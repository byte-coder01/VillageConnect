from __future__ import annotations

import json
import re
import sys
import time
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path
from urllib.parse import urljoin, urlparse, urldefrag
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
SOURCES_FILE = DATA_DIR / "notice-sources.json"
OUTPUT_FILE = DATA_DIR / "notices.json"
IST = timezone(timedelta(hours=5, minutes=30))
DIRECTORY_ROOT = "https://igod.gov.in"
PIB_REGION_FALLBACK_IDS = tuple(range(1, 25))
DIRECTORY_URLS = [
    ("https://igod.gov.in/districts", "directory", "", "", 0),
    ("https://igod.gov.in/sg/district/states", "states", "", "", 0),
]

DATE_RE = re.compile(r"\b(\d{1,2})[./-](\d{1,2})[./-](\d{4})\b")
DATE_TEXT_RE = re.compile(r"\b(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b", re.I)
TIME_RE = re.compile(r"\b(\d{1,2}:\d{2})\s*(AM|PM)\b", re.I)
MONTHS = {m.lower(): i for i, m in enumerate(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], 1)}

STATE_NAMES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
    "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
    "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal",
]

DEFAULT_SOURCE_PATHS = [
    "/en/notice_category/public-notice/", "/notice_category/public-notice/",
    "/en/notice_category/announcements/", "/notice_category/announcements/",
    "/announcements-and-press-notes/", "/whats-new/whats-new/", "/en/whats-new/whats-new/",
    "/notices/", "/en/notices/", "/notifications/", "/en/notifications/", "/news/", "/en/news/",
    "/recruitment/", "/en/recruitment/", "/tenders/", "/en/tenders/", "/circulars/", "/orders/",
]
NOTICE_HINT_RE = re.compile(r"notice|notification|announcement|press|what.?s new|recruit|tender|circular|latest update|public notice|orders?|सूचना|घोषणा|निविदा|भर्ती|आदेश|अधिसूचना|परिपत्र", re.I)
NAV_TEXT_RE = re.compile(
    r"^(home|home page|homepage|go to home|skip to content|skip to main content|menu|search|login|logout|"
    r"accessibility|contact us|site map|sitemap|copyright|privacy policy|terms|read more|view|details|click here|"
    r"districts|states|state/ut government|district website|official website|मुख्य पृष्ठ|होम|घर|वापस जाएँ|मुखपृष्ठ|यहाँ क्लिक करें|और पढ़ें)$", re.I,
)
MARKDOWN_RE = re.compile(r"!?\[[^\]]*\]\([^)]*\)")
BAD_TITLE_RE = re.compile(
    r"(?:https?://|www\.|\.nic\.in|\.gov\.in|go to home|skip to (?:content|main content)|"
    r"home page|homepage|image\s*\d+|logo\s*\d+|icon\s*\d+|patna\s*patna)", re.I,
)


def clean(value: str) -> str:
    value = unescape(value or "")
    value = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", value)
    value = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", value)
    value = re.sub(r"`([^`]+)`", r"\1", value)
    value = re.sub(r"https?://\S+", " ", value, flags=re.I)
    value = re.sub(r"\s+", " ", value)
    return value.strip(" |\t\n\r•-:")


def normalize(value: str) -> str:
    return re.sub(r"[^\w\s-]", "", clean(value).casefold(), flags=re.UNICODE).replace("_", " ").strip()


def plausible_title(value: str) -> bool:
    raw = unescape(value or "").strip()
    title = clean(raw)
    return (
        15 <= len(title) <= 240
        and not MARKDOWN_RE.search(raw)
        and not BAD_TITLE_RE.search(raw)
        and not BAD_TITLE_RE.search(title)
        and not NAV_TEXT_RE.match(title)
        and sum(char.isalpha() for char in title) >= 8
        and len(title.split()) >= 2
    )


def trusted_government_url(value: str) -> bool:
    try:
        parsed = urlparse(value)
        host = (parsed.hostname or "").lower()
        return parsed.scheme == "https" and (host.endswith(".nic.in") or host.endswith(".gov.in")) and bool(parsed.path and parsed.path != "/")
    except Exception:
        return False


def plausible_description(value: str) -> bool:
    text = clean(value)
    return bool(text and not MARKDOWN_RE.search(value or "") and not BAD_TITLE_RE.search(value or "") and not NAV_TEXT_RE.match(text) and len(text) >= 18 and sum(c.isalpha() for c in text) >= 12)


def valid_notice_record(item: dict) -> bool:
    if not isinstance(item, dict) or not plausible_title(str(item.get("title") or "")):
        return False
    if not trusted_government_url(str(item.get("source") or "")):
        return False
    date_text = str(item.get("date") or "")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date_text):
        return False
    try:
        date_value = datetime.fromisoformat(date_text).date()
    except ValueError:
        return False
    age = (datetime.now(IST).date() - date_value).days
    return -30 <= age <= 400


def looks_like_markdown_document(text: str) -> bool:
    sample = (text or "").lstrip()[:4000]
    if not sample or re.search(r"<html(?:\s|>)|<body(?:\s|>)", sample, re.I):
        return False
    return bool(re.search(r"(?m)^\s*!\[[^\]]*\]\([^)]*\)", sample) or re.search(r"(?m)^\s*\[[^\]]+\]\(https?://", sample))


def parse_date(text: str) -> str:
    text = clean(text)
    m = DATE_RE.search(text)
    if m:
        d, mo, y = map(int, m.groups())
        try:
            return datetime(y, mo, d).date().isoformat()
        except ValueError:
            return ""
    m = DATE_TEXT_RE.search(text)
    if m:
        d, month, y = int(m.group(1)), m.group(2).lower(), int(m.group(3))
        try:
            return datetime(y, MONTHS[month], d).date().isoformat()
        except ValueError:
            return ""
    return ""


def parse_time(text: str) -> str:
    m = TIME_RE.search(clean(text))
    return f"{m.group(1)} {m.group(2).upper()}" if m else ""


def category(title: str) -> str:
    t = title.casefold()
    if re.search(r"election|electoral|sir|voter|evm|vvpat|मतदाता|निर्वाचन", t): return "Election"
    if re.search(r"health|hospital|medical|vaccin|medicine|स्वास्थ्य|अस्पताल", t): return "Health"
    if re.search(r"school|education|college|scholarship|exam|student|शिक्षा|विद्यालय", t): return "Education"
    if re.search(r"recruit|vacancy|job|appointment|selection|भर्ती|नियुक्ति", t): return "Recruitment"
    if re.search(r"tender|procurement|bid|eoi|निविदा", t): return "Tender"
    if re.search(r"road|traffic|disaster|weather|rain|flood|आपदा|मौसम|बाढ़", t): return "Public safety"
    if re.search(r"farmer|agri|agriculture|crop|panchayat|कृषि|किसान", t): return "Agriculture"
    return "Government"


def fetch(url: str, accept: str = "text/html,application/xhtml+xml,application/rss+xml,application/xml;q=0.9,*/*;q=0.2") -> tuple[str, str, str]:
    req = Request(url, headers={"User-Agent": "VillageConnect Government Notice Indexer/2.0 (GitHub Actions; official-source discovery)", "Accept": accept})
    with urlopen(req, timeout=10) as response:
        ctype = response.headers.get_content_type() or ""
        final_url = response.geturl()
        body = response.read(2_500_000).decode("utf-8", errors="replace")
        return body, ctype, final_url


def gov_host(host: str) -> bool:
    host = (host or "").lower().split(":", 1)[0]
    return host.endswith(".nic.in") or host.endswith(".gov.in")


def same_host(a: str, b: str) -> bool:
    return (urlparse(a).hostname or "").lower() == (urlparse(b).hostname or "").lower()


def detect_state(text: str) -> str:
    low = normalize(text)
    candidates = sorted(STATE_NAMES, key=len, reverse=True)
    for state in candidates:
        if normalize(state) and normalize(state) in low:
            return state
    return ""


def looks_like_label(value: str) -> bool:
    label = clean(value)
    return 2 <= len(label) <= 90 and not NAV_TEXT_RE.match(label) and sum(c.isalpha() for c in label) >= 2


def district_candidate_from_anchor(anchor, page_url: str, state_hint: str, district_hint: str, parent_text: str) -> dict | None:
    href = urljoin(page_url, anchor.get("href", ""))
    host = (urlparse(href).hostname or "").lower()
    if not gov_host(host) or host.endswith("igod.gov.in") or host.endswith("india.gov.in"):
        return None
    label = clean(anchor.get_text(" ", strip=True) or anchor.get("title", ""))
    district_name = district_hint or (label if looks_like_label(label) and re.search(r"district|website|administration", label, re.I) is None else "")
    if not district_name:
        return None
    context_state = state_hint or detect_state(parent_text)
    name_normal = normalize(district_name)
    first_host_label = host.split(".")[0].replace("-", " ")
    score = 1
    if any(token and token in normalize(first_host_label) for token in name_normal.split() if len(token) >= 3): score += 5
    if re.search(r"district|official|website|administration", label, re.I): score += 3
    if not urlparse(href).path or urlparse(href).path == "/": score += 1
    if re.search(r"pib|passport|railway|highcourt|services\.india|india\.gov|igod", host, re.I): score -= 8
    return {"name": clean(district_name), "region": context_state, "domain": host, "score": score, "link": href, "label": label}


def discover_district_sites(existing_sources: dict) -> tuple[list[dict], str, int]:
    """Discover district government portals from the official IGOD district directory.

    The existing registry is a recovery cache only; the official directory is crawled on each run.
    No notice titles or descriptions are sourced from this registry.
    """
    discovered: dict[tuple[str, str], dict] = {}
    queue: list[tuple[str, str, str, str, int]] = list(DIRECTORY_URLS)
    seen: set[str] = set()
    visited_pages = 0
    discovery_error = ""

    while queue and visited_pages < 950:
        # Fetch directory pages in batches so one slow page doesn't block the entire discovery.
        batch = []
        while queue and len(batch) < 24 and visited_pages + len(batch) < 950:
            url, kind, region_hint, district_hint, depth = queue.pop(0)
            url = urldefrag(url)[0]
            if url in seen:
                continue
            if (urlparse(url).hostname or "").lower() != "igod.gov.in":
                continue
            seen.add(url)
            batch.append((url, kind, region_hint, district_hint, depth))
        if not batch:
            continue
        def get_page(item):
            url, kind, region_hint, district_hint, depth = item
            try:
                body, content_type, final_url = fetch(url)
                if content_type not in {"text/html", "application/xhtml+xml"} or looks_like_markdown_document(body):
                    return item, None, f"Unusable directory page: {url} ({content_type})"
                return item, (body, final_url), ""
            except Exception as exc:
                return item, None, f"{url}: {exc}"
        with ThreadPoolExecutor(max_workers=10) as pool:
            results = list(pool.map(get_page, batch))
        for (requested, kind, region_hint, district_hint, depth), result, error in results:
            visited_pages += 1
            if error:
                discovery_error = error
                print(f"[directory] {error}", file=sys.stderr)
                continue
            body, final_url = result
            soup = BeautifulSoup(body, "html.parser")
            page_title = clean(soup.title.get_text(" ", strip=True) if soup.title else "")
            headings = " ".join(clean(h.get_text(" ", strip=True)) for h in soup.select("h1,h2")[:4])
            page_context = clean(f"{page_title} {headings} {soup.get_text(' ', strip=True)[:1800]}")
            state_here = region_hint or detect_state(page_title + " " + headings)
            page_path = urlparse(final_url).path.lower()

            # Determine whether the page itself represents a particular district.
            district_here = ""
            if depth > 0 and kind == "district":
                district_here = district_hint or clean(requested.rstrip("/").split("/")[-1].replace("-", " "))
                # Prefer a heading that has the district context, but avoid generic directory headings.
                if not district_hint and headings and not NAV_TEXT_RE.match(headings.split(" ")[0]):
                    first_heading = clean(headings.split("  ")[0])
                    if first_heading and len(first_heading) < 100 and not re.search(r"state/ut-wise list|districts\s*[a-z-]*z", first_heading, re.I):
                        district_here = first_heading
            if kind == "state" and not state_here:
                state_here = detect_state(page_context)

            # Official links on district detail pages are the strongest candidates.
            if district_here or kind == "district":
                anchors = soup.select("a[href]")
                candidates = []
                for anchor in anchors:
                    parent = anchor.parent
                    parent_text = clean(parent.get_text(" ", strip=True) if parent else "")
                    candidate = district_candidate_from_anchor(anchor, final_url, state_here, district_here, parent_text)
                    if candidate and candidate["score"] >= 3:
                        candidates.append(candidate)
                # If a directory detail page has several gov links, take only the best likely district portal.
                best_by_host = {}
                for c in candidates:
                    key = (normalize(c["name"]), c["domain"])
                    if key not in best_by_host or c["score"] > best_by_host[key]["score"]:
                        best_by_host[key] = c
                for c in sorted(best_by_host.values(), key=lambda x: x["score"], reverse=True)[:1]:
                    key = (normalize(c["name"]), normalize(c["region"]))
                    rec = discovered.setdefault(key, {"name": c["name"], "aliases": [c["name"]], "domain": c["domain"], "domains": [], "pincodes": [], "region": c["region"], "sourcePaths": []})
                    if c["domain"] not in rec["domains"]:
                        rec["domains"].append(c["domain"])
                    rec["score"] = max(rec.get("score", 0), c["score"])

            # Directory page may link directly to district portals or to state/district entries.
            for anchor in soup.select("a[href]"):
                label = clean(anchor.get_text(" ", strip=True) or anchor.get("title", ""))
                if not looks_like_label(label):
                    continue
                href = urljoin(final_url, anchor.get("href", ""))
                parsed = urlparse(href)
                host = (parsed.hostname or "").lower()
                if host == "igod.gov.in":
                    if href.rstrip("/") == final_url.rstrip("/"):
                        continue
                    path = parsed.path.lower()
                    segments = [x for x in path.split("/") if x and x != "index.php"]
                    is_state = any(normalize(label) == normalize(s) for s in STATE_NAMES)
                    if is_state and depth < 2:
                        queue.append((href, "state", label, "", depth + 1))
                    elif depth < 2 and ("district" in path or "/sg/" in path) and not NAV_TEXT_RE.match(label):
                        # From the state index, nested organization pages generally represent districts.
                        next_kind = "district" if (kind == "state" or len(segments) >= 3 or "district" in path) else "state"
                        next_region = state_here or region_hint
                        next_district = label if next_kind == "district" and not is_state else ""
                        queue.append((href, next_kind, next_region, next_district, depth + 1))
                elif gov_host(host):
                    # Direct external links on an all-district listing are usable when its link label is a district.
                    if kind in {"directory", "district"} and not district_here and not NAV_TEXT_RE.match(label):
                        candidate = district_candidate_from_anchor(anchor, final_url, state_here, label, page_context)
                        if candidate and candidate["score"] >= 1:
                            key = (normalize(candidate["name"]), normalize(candidate["region"]))
                            rec = discovered.setdefault(key, {"name": candidate["name"], "aliases": [candidate["name"]], "domain": host, "domains": [], "pincodes": [], "region": candidate["region"], "sourcePaths": []})
                            if host not in rec["domains"]:
                                rec["domains"].append(host)

    # Merge the dynamic directory discoveries with the last known official domains as a recovery cache.
    # Notice content itself is never taken from this list; it is fetched live below.
    cached = existing_sources.get("districts", []) if isinstance(existing_sources, dict) else []
    for item in cached if isinstance(cached, list) else []:
        if not isinstance(item, dict) or not item.get("name"):
            continue
        domains = item.get("domains") or ([item.get("domain")] if item.get("domain") else [])
        key = (normalize(item.get("name", "")), normalize(item.get("region", "")))
        if key in discovered:
            rec = discovered[key]
            rec["aliases"] = sorted(set((rec.get("aliases") or []) + (item.get("aliases") or []) + [item["name"]]))
            rec["pincodes"] = sorted(set((rec.get("pincodes") or []) + (item.get("pincodes") or [])))
            rec["sourcePaths"] = list(dict.fromkeys((item.get("sourcePaths") or []) + (rec.get("sourcePaths") or [])))
            for domain in domains:
                if domain and domain not in rec["domains"]:
                    rec["domains"].append(domain)
        else:
            rec = dict(item)
            rec["domains"] = sorted(set(domains))
            rec.setdefault("aliases", [rec["name"]])
            rec.setdefault("pincodes", [])
            rec.setdefault("sourcePaths", [])
            discovered[key] = rec

    records = []
    for item in discovered.values():
        item.pop("score", None)
        item["domains"] = sorted(set(item.get("domains") or ([item.get("domain")] if item.get("domain") else [])))
        if item.get("domains") and not item.get("domain"):
            item["domain"] = item["domains"][0]
        if not item.get("region"):
            item["region"] = ""
        records.append(item)
    records.sort(key=lambda x: (normalize(x.get("region", "")), normalize(x.get("name", ""))))
    status = "live-directory" if len(discovered) >= max(100, len(cached) * 2) else ("partial-directory" if discovered else "cached-registry")
    if len(discovered) < 100:
        print(f"[directory] Only {len(discovered)} districts indexed from IGOD plus cache; this run may have partial national coverage.", file=sys.stderr)
    return records, status, visited_pages


def source_base_urls(district: dict) -> list[str]:
    domains = district.get("domains") or ([district.get("domain")] if district.get("domain") else [])
    output = []
    for domain in domains:
        if isinstance(domain, str) and gov_host(domain):
            base = f"https://{domain.strip().lower()}"
            if base not in output:
                output.append(base)
    return output


def likely_notice_links(html: str, page_url: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    result = []
    for anchor in soup.select("a[href]"):
        label = clean(anchor.get_text(" ", strip=True) or anchor.get("title", ""))
        href = urljoin(page_url, anchor.get("href", ""))
        parsed = urlparse(href)
        if not same_host(page_url, href) or not gov_host(parsed.hostname or ""):
            continue
        if not parsed.path or parsed.path == "/" or href.rstrip("/") == page_url.rstrip("/"):
            continue
        if NOTICE_HINT_RE.search(label + " " + parsed.path):
            if href not in result:
                result.append(href)
    return result


def parse_page(html: str, page_url: str, district: dict, diagnostics: dict | None = None) -> list[dict]:
    if looks_like_markdown_document(html):
        if diagnostics is not None:
            diagnostics["rejectedRecords"] = diagnostics.get("rejectedRecords", 0) + 1
        return []
    soup = BeautifulSoup(html, "html.parser")
    for noisy in soup.select("script,style,noscript,template,nav,header,footer,aside,form"):
        noisy.decompose()
    found: list[dict] = []
    seen: set[tuple[str, str]] = set()
    cutoff = datetime.now(IST).date() - timedelta(days=365)

    def add(title: str, date: str, time_value: str, source: str, description: str = "") -> None:
        raw_title = title
        title, description = clean(title), clean(description)
        if not date:
            return
        if not plausible_title(raw_title) or not trusted_government_url(source):
            if diagnostics is not None and clean(raw_title):
                diagnostics["rejectedRecords"] = diagnostics.get("rejectedRecords", 0) + 1
            return
        try:
            d = datetime.fromisoformat(date).date()
        except ValueError:
            return
        if d < cutoff:
            return
        if re.match(r"^(s\.?\s*no|details|view|click here|read more|upload date|meeting date)$", title, re.I):
            return
        if not plausible_description(description):
            description = "Open the official notice for the full details."
        key = (title.casefold(), date)
        if key in seen:
            return
        seen.add(key)
        found.append({
            "scope": district.get("scope", "district"),
            "district": district.get("name", ""),
            "region": district.get("region", ""),
            "category": category(title),
            "date": date,
            "time": time_value,
            "title": title[:220],
            "description": (description or "See the official notice for the full details.")[:320],
            "source": source,
        })

    for row in soup.select("table tr"):
        cells = [clean(c.get_text(" ", strip=True)) for c in row.select("th, td")]
        if len(cells) < 2:
            continue
        row_text = " | ".join(cells)
        date = parse_date(row_text)
        if not date:
            continue
        link = row.select_one("a[href]")
        source = urljoin(page_url, link.get("href")) if link and link.get("href") else page_url
        candidates = [c for c in cells if len(c) >= 12 and not parse_date(c) and not re.match(r"^(s\.?\s*no|details|view|file)$", c, re.I)]
        title = candidates[0] if candidates else ""
        description = candidates[1] if len(candidates) > 1 else ""
        add(title, date, parse_time(row_text), source, description)

    for anchor in soup.select("a[href]"):
        raw_title = anchor.get_text(" ", strip=True)
        if not plausible_title(raw_title):
            continue
        href = urljoin(page_url, anchor.get("href", ""))
        if not href.startswith("https://") or not same_host(page_url, href):
            continue
        if urlparse(href).path in ("", "/") or href.rstrip("/") == page_url.rstrip("/"):
            continue
        parent = anchor
        context = ""
        for _ in range(4):
            parent = parent.parent
            if not parent:
                break
            if getattr(parent, "name", "") in {"header", "nav", "footer", "aside", "form"}:
                parent = None
                break
            context = clean(parent.get_text(" ", strip=True))
            if parse_date(context):
                break
        date = parse_date(context)
        if not date:
            continue
        description = ""
        if parent:
            bits = [clean(x.get_text(" ", strip=True)) for x in parent.select("p")]
            description = next((b for b in bits if b and b.casefold() != clean(raw_title).casefold()), "")
        add(raw_title, date, parse_time(context), href, description)
    found.sort(key=lambda x: (x["date"], x.get("time", "")), reverse=True)
    return found[:40]


def scrape_district(district: dict, global_paths: list[str]) -> tuple[str, list[dict], bool, bool]:
    name = district.get("name", "Unknown district")
    collected: list[dict] = []
    source_responded = False
    parser_warning = False
    domains = source_base_urls(district)
    for base in domains[:3]:
        urls = [base + "/"]
        try:
            home, ctype, final_home = fetch(base + "/")
            if ctype in {"text/html", "application/xhtml+xml"} and not looks_like_markdown_document(home) and same_host(base, final_home):
                source_responded = True
                page_district = dict(district, scope="district")
                diag = {"rejectedRecords": 0}
                collected.extend(parse_page(home, final_home, page_district, diag))
                parser_warning |= diag["rejectedRecords"] > 0
                discovered_links = likely_notice_links(home, final_home)
            else:
                parser_warning = True
                discovered_links = []
        except Exception as exc:
            print(f"[home] {base}: {exc}", file=sys.stderr)
            discovered_links = []

        explicit_paths = district.get("sourcePaths") or []
        path_urls = [base + (path if path.startswith("/") else "/" + path) for path in explicit_paths[:4]]
        guesses = [base + p for p in DEFAULT_SOURCE_PATHS]
        candidates = []
        for url in discovered_links + path_urls + guesses:
            if url.rstrip("/") == (base + "/").rstrip("/") or url in candidates:
                continue
            candidates.append(url)
        # Test homepage-discovered notice sections first, then known CMS paths.
        for url in candidates[:6]:
            try:
                html, ctype, final_url = fetch(url)
                if ctype not in {"text/html", "application/xhtml+xml"} or looks_like_markdown_document(html):
                    parser_warning = True
                    continue
                if not same_host(base, final_url) or (urlparse(final_url).path.rstrip("/") == "" and urlparse(url).path.rstrip("/")):
                    parser_warning = True
                    continue
                source_responded = True
                diagnostics = {"rejectedRecords": 0}
                collected.extend(parse_page(html, final_url, dict(district, scope="district"), diagnostics))
                parser_warning |= diagnostics["rejectedRecords"] > 0
            except Exception as exc:
                # A missing candidate URL is normal for heterogeneous government sites.
                if isinstance(exc, TimeoutError):
                    print(f"[page] timeout {url}", file=sys.stderr)
            time.sleep(0.08)
    unique = {}
    for notice in collected:
        unique[(normalize(notice.get("district", "")), notice["title"].casefold(), notice["date"])] = notice
    out = sorted(unique.values(), key=lambda n: (n["date"], n.get("time", "")), reverse=True)[:10]
    return name, out, source_responded, parser_warning


def discover_pib_region_ids() -> list[int]:
    """Discover available English PIB RSS region IDs from PIB's own RSS page.

    PIB's page is the source of truth. Use the documented 1..24 range only if its
    selector cannot be read, so a temporary page change cannot block the board.
    """
    page_url = "https://www.pib.gov.in/ViewRss.aspx?lang=1&reg=1"
    try:
        body, content_type, final_url = fetch(page_url, "text/html,application/xhtml+xml,*/*;q=0.5")
        if content_type not in {"text/html", "application/xhtml+xml"} or not (urlparse(final_url).hostname or "").lower().endswith("pib.gov.in"):
            raise ValueError("PIB RSS directory did not return an official HTML page")
        soup = BeautifulSoup(body, "html.parser")
        ids: set[int] = set()
        for select in soup.select("select"):
            context = normalize(" ".join(str(select.get(k, "")) for k in ("id", "name", "aria-label", "title")))
            if "region" not in context:
                continue
            for option in select.select("option[value]"):
                value = str(option.get("value", "")).strip()
                if value.isdigit() and 1 <= int(value) <= 99:
                    ids.add(int(value))
        if ids:
            return sorted(ids)
    except Exception as exc:
        print(f"[pib] Could not read RSS region selector; trying the standard region ID range: {exc}", file=sys.stderr)
    return list(PIB_REGION_FALLBACK_IDS)


def parse_pib_feed(region_id: int) -> tuple[int, list[dict], bool]:
    """Fetch one official PIB regional RSS feed. Failures are isolated per feed."""
    rss_url = f"https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid={region_id}"
    body, _ctype, final_url = fetch(rss_url, "application/rss+xml,application/xml,text/xml,*/*;q=0.5")
    host = (urlparse(final_url).hostname or "").lower()
    if not host.endswith("pib.gov.in"):
        raise ValueError("PIB feed redirected away from the official PIB domain")
    try:
        root = ET.fromstring(body)
    except ET.ParseError as exc:
        raise ValueError(f"PIB region {region_id} returned invalid XML") from exc

    def field(entry, name):
        node = entry.find(name)
        if node is None or node.text is None:
            return ""
        if name == "link":
            return unescape(node.text.strip())
        return clean(node.text)

    out = []
    for entry in root.findall(".//item"):
        title = field(entry, "title")
        link = field(entry, "link")
        description_raw = field(entry, "description")
        description = clean(BeautifulSoup(description_raw, "html.parser").get_text(" ", strip=True))
        pub_text = field(entry, "pubDate")
        try:
            published = parsedate_to_datetime(pub_text)
            if published.tzinfo is None:
                published = published.replace(tzinfo=IST)
            local = published.astimezone(IST)
            date_value = local.date().isoformat()
            time_value = local.strftime("%I:%M %p").lstrip("0")
        except Exception:
            date_value, time_value = parse_date(pub_text), parse_time(pub_text)
        item = {
            "scope": "national", "district": "", "region": "India", "category": category(title),
            "date": date_value, "time": time_value, "title": title,
            "description": description or "Open the official Government of India press release for details.", "source": link,
            "sourceName": "Press Information Bureau (Government of India)",
        }
        if valid_notice_record(item):
            out.append(item)
    return region_id, out, True


def parse_pib_rss() -> list[dict]:
    """Aggregate current official PIB press releases across all discoverable region feeds."""
    region_ids = discover_pib_region_ids()
    collected: list[dict] = []
    successful_feeds = 0
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(parse_pib_feed, region_id): region_id for region_id in region_ids}
        for future in as_completed(futures):
            region_id = futures[future]
            try:
                _region, items, _ok = future.result()
                successful_feeds += 1
                collected.extend(items)
            except Exception as exc:
                print(f"[pib] Region feed {region_id} unavailable: {exc}", file=sys.stderr)
    if not successful_feeds:
        raise RuntimeError("No official PIB regional RSS feeds could be read")
    unique = {}
    for notice in collected:
        key = (notice["title"].casefold(), notice["date"], notice["source"])
        unique[key] = notice
    merged = sorted(unique.values(), key=lambda n: (n["date"], n.get("time", "")), reverse=True)
    print(f"[pib] Read {successful_feeds}/{len(region_ids)} official feeds; collected {len(merged)} unique releases")
    return merged[:180]

def main() -> int:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    existing_sources = json.loads(SOURCES_FILE.read_text(encoding="utf-8")) if SOURCES_FILE.exists() else {"districts": [], "sourcePaths": DEFAULT_SOURCE_PATHS}
    existing_data = json.loads(OUTPUT_FILE.read_text(encoding="utf-8")) if OUTPUT_FILE.exists() else {"status": "empty", "notices": []}
    previous_status = existing_data.get("status", "empty")
    previous_notices = [n for n in existing_data.get("notices", []) if valid_notice_record(n)] if previous_status in {"live", "partial", "stale"} else []

    districts, discovery_status, directory_pages = discover_district_sites(existing_sources)
    sources_output = {
        "country": "India",
        "sourceDirectory": "https://igod.gov.in/districts",
        "discoveryUpdatedAt": datetime.now(IST).isoformat(timespec="seconds"),
        "discoveryStatus": discovery_status,
        "directoryPagesVisited": directory_pages,
        "sourcePaths": DEFAULT_SOURCE_PATHS,
        "districts": districts,
    }
    SOURCES_FILE.write_text(json.dumps(sources_output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[directory] status={discovery_status}; districts={len(districts)}; pages={directory_pages}")

    all_fresh: list[dict] = []
    failed_districts: set[str] = set()
    successes = 0
    warnings: set[str] = set()
    # Parallelize by district, while each site is crawled sequentially to avoid hammering one domain.
    with ThreadPoolExecutor(max_workers=16) as pool:
        futures = {pool.submit(scrape_district, district, DEFAULT_SOURCE_PATHS): district for district in districts}
        for future in as_completed(futures):
            district = futures[future]
            try:
                name, notices, source_responded, warning = future.result()
            except Exception as exc:
                name, notices, source_responded, warning = district.get("name", "Unknown district"), [], False, True
                print(f"[district] {name}: {exc}", file=sys.stderr)
            if source_responded:
                successes += 1
            else:
                failed_districts.add(normalize(name))
            if warning:
                warnings.add(normalize(name))
            all_fresh.extend(notices)

    try:
        national = parse_pib_rss()
        all_fresh.extend(national)
        print(f"[national] collected {len(national)} PIB releases")
    except Exception as exc:
        print(f"[national] PIB RSS unavailable: {exc}", file=sys.stderr)

    # Preserve only previously fetched records for districts that failed completely, and only briefly.
    # This avoids wiping the board during an upstream outage while ensuring no hardcoded seed content is used.
    current_district_names = {normalize(d.get("name", "")) for d in districts}
    if failed_districts and previous_notices:
        cutoff = datetime.now(IST).date() - timedelta(days=30)
        for old in previous_notices:
            if old.get("scope", "district") == "national":
                continue
            old_district = normalize(old.get("district", ""))
            try:
                old_date = datetime.fromisoformat(old.get("date", "")).date()
            except ValueError:
                continue
            if old_district in failed_districts and old_date >= cutoff and old_district in current_district_names:
                item = dict(old)
                item["stale"] = True
                all_fresh.append(item)

    all_fresh = [item for item in all_fresh if valid_notice_record(item)]
    unique = {}
    for item in all_fresh:
        key = (normalize(item.get("scope", "district")), normalize(item.get("district", "")), item.get("title", "").casefold(), item.get("date", ""))
        unique[key] = item
    notices = sorted(unique.values(), key=lambda n: (n.get("date", ""), n.get("time", "")), reverse=True)
    fresh_count = sum(1 for n in notices if not n.get("stale"))
    status = "live" if fresh_count else ("stale" if notices else "empty")
    output = {
        "generatedAt": datetime.now(IST).isoformat(timespec="seconds"),
        "status": status,
        "noticeCount": len(notices),
        "districtsDiscovered": len(districts),
        "districtSourcesResponded": successes,
        "directoryStatus": discovery_status,
        "parserWarnings": sorted(warnings),
        "failedDistrictSources": len(failed_districts),
        "notices": notices[:12000],
    }
    OUTPUT_FILE.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {output['noticeCount']} current/cached verified notices; status={status}; fresh={fresh_count}; stale={sum(1 for n in notices if n.get('stale'))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
