# VillageConnect — Digital Village Portal

VillageConnect is a responsive digital village portal concept that brings essential services, nearby places, community updates, and local discovery together in one simple website. The map defaults to India on the Updates page until a visitor enters an area or shares their location; the map page retains its original Pauri Garhwal starting point.

## Features

- Responsive landing page and navigation designed for desktop and mobile.
- Service categories and practical guides for public services, health, education, water, and emergency information.
- Discover page for exploring local services, community spaces, schools, shops, and outdoor places.
- Embedded Google Maps with place search, links to Google Maps results, and optional browser geolocation.
- Community updates page that pulls current district-government notices discovered by the scheduled indexer and falls back to available official PIB releases when local sources are unavailable.
- Day/night theme switch. Day mode is the default; night mode uses a deep blue palette, a crescent moon, and stars.
- Accessibility settings for text size, high contrast, and reduced motion.

## Built with

- HTML
- CSS
- Vanilla JavaScript
- Google Maps embeds and search links

The site is a static frontend and does not require a build step or application server.

## Pages

- `index.html` — Main VillageConnect landing page.
- `services.html` — Service categories.
- `service-guide.html` — Practical service guidance.
- `directory.html` — Nearby-place discovery.
- `map.html` — Searchable map centered by default on Pauri Garhwal.
- `events.html` — Community notices and public event discovery.
- `feedback.html` — Suggestion form.
- `settings.html` — Display and motion settings.
- `portal.html` — Compatibility redirect to the main home page.

## Run locally

Open `index.html` in a modern browser. An internet connection is needed for Google Maps and web fonts. For the most consistent browser behavior, the site can also be served through any simple static web server.

## Deployment

The site is hosted on GitHub Pages and uses a GitHub Actions workflow to refresh regional notice data before deploying. Upload the contents of this project to the repository root, then open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. The workflow runs on pushes, supports a manual run from the Actions tab, and is scheduled daily for **6:00 AM Asia/Kolkata**. Each run discovers district portals from the official IGOD directory and updates the source registry before deployment. It is not a real-time request each time a visitor changes location.

## Important notes

- VillageConnect is an independent community information portal, not a government website or emergency service. Verify important information with the responsible local organization.

- Google Maps provides map data and search results. The optional location button requests browser permission; coordinates are sent directly to Google Maps to load results.
- The Contact form sends submissions to the VillageConnect inbox using FormSubmit, a third-party form delivery service. The inbox owner must confirm FormSubmit’s one-time activation email after the first submission before ongoing delivery is enabled. An optional sender email lets the site owner reply. Avoid collecting passwords or sensitive personal information. The form returns visitors to `feedback.html?contact=sent` after submission; the query parameter is removed after the confirmation appears.
- Community notices and local listings should be verified and connected to a trusted source before treating the portal as a live public service.


## Branding

- `favicon.svg` — Shared VillageConnect favicon used by every HTML page.

## Regional notice board

The Updates page accepts a region/state, area/district, and 6-digit PIN code. Submitting the form updates the existing Google Maps panel and filters the latest generated notice dataset for the selected district. Government pages are fetched by GitHub Actions, not scraped directly in a visitor’s browser. The updater discovers district portals from IGOD rather than relying on a fixed district allowlist. Every displayed notice must pass format, date, and official-source checks and links back to its source. Malformed source output is excluded and can trigger an explanatory warning in the selected district’s notice board.

## Regional notices on GitHub Pages

The Updates page uses the visitor’s Region/State, Area/District, and PIN code to update the Google Maps panel and select matching district notices collected by the scheduled indexer. If that district has no current notices, the site can show available official Government of India PIB releases instead, clearly labelled as wider government updates. The site itself remains static.

A GitHub Actions workflow in `.github/workflows/update-and-deploy.yml` runs on pushes, manual runs, and once daily. It discovers official district-government portals from IGOD, fetches their current notice pages, gathers official Press Information Bureau (PIB) RSS releases across the available regional feeds as a fallback, writes `data/notices.json`, and deploys the static site to GitHub Pages. No separate application server is required.

For GitHub Pages, set **Settings → Pages → Build and deployment → Source → GitHub Actions**. GitHub documents custom Actions workflows for building and deploying static Pages sites. Scheduled workflows use the repository's GitHub-hosted runner. The workflow refreshes `data/notice-sources.json` with district portals discovered from IGOD each run. The package starts with an empty source registry, not a fixed set of locations, and starts with an empty notice dataset, not seeded notice text. After the first successful run, discovered official domains are retained as a temporary recovery cache if the directory is temporarily unavailable.


### Regional notice architecture

VillageConnect remains a static GitHub Pages site. A scheduled GitHub Actions workflow discovers official district portals through IGOD and fetches government HTML pages at **6:00 AM IST daily**, filters out navigation/Markdown fragments, writes `data/notices.json`, and deploys that refreshed static data with the site. The browser does not scrape government sites directly. Entering a location updates Google Maps immediately; the notice board filters the latest collected notices for the matching discovered district. If no district notices were collected for a location, it shows current official PIB releases from the available regional feeds rather than fixed demonstration content. These are Government of India releases, not a claim that they originate from the user’s own district.


## Location and language controls

- The Updates page has a **Use my current location** button. It asks for browser permission only after the visitor clicks it, centers the map on the obtained coordinates, and uses OpenStreetMap Nominatim reverse geocoding to identify the district. The chosen location is stored only in this browser under one shared preference so all pages can reuse it; coordinates are sent to mapping/reverse-lookup services and are not sent to a VillageConnect server. If permission is unavailable or reverse geocoding fails, visitors can enter the region and area manually.
- An **English / हिंदी** toggle is available across the pages. The chosen language is saved in that browser and applied across the site without changing the layout. Government notices are kept in their original published wording unless a verified translation is explicitly available; the interface, location statuses, categories, and notice-date/day formatting are translated.
- If a configured official notice endpoint returns Markdown, a redirect to the site homepage, or another non-HTML response, the scheduled updater rejects that source content. The Updates page then shows a small warning for that selected district instead of rendering the broken fragment as a notice. The browser also rejects malformed notice records before rendering.


### India-wide source discovery and coverage

The first scheduled/manual Actions run discovers district portals from the official IGOD directory and populates `data/notice-sources.json`; subsequent runs refresh those sources and the notice dataset. The updater also discovers the list of English PIB RSS region IDs from PIB’s own RSS page, with a small documented fallback range if the selector cannot be read, and merges valid current releases from available feeds.

Because district portals use different site software and formats, this is broad best-effort discovery—not a guarantee that every local page, block, village, or PIN code publishes machine-readable notices. The site must never invent a local notice: it shows matching district notices when available, otherwise current official Government of India PIB releases, or a clear empty state if official sources are unavailable.


## Shared location, map categories, and homepage notices

All pages read one `villageconnect-shared-location` browser preference. Earlier `villageconnect-map-location` and `villageconnect-notice-location` values are migrated when possible. The Updates page map-category pills are buttons that change the embedded Google Maps search and the associated external Maps link in place. The homepage community board loads up to three recent validated records from `data/notices.json`, matching the saved district first, then state notices, and clearly labelled national PIB fallback notices.
