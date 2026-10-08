(() => {
  const getSetting = (key, fallback) => {
    try { return localStorage.getItem(key) ?? fallback; }
    catch { return fallback; }
  };
  const setSetting = (key, value) => {
    try { localStorage.setItem(key, value); }
    catch { /* Keep controls useful when browser storage is unavailable. */ }
  };

  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.nav-links');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
    }));
  }

  const themeButtons = [...document.querySelectorAll('.theme-toggle')];
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const dayThemeColor = themeColorMeta?.content || '#fcfaf5';
  const setTheme = isNight => {
    document.documentElement.classList.toggle('night-mode', isNight);
    themeButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(isNight));
      button.setAttribute('aria-label', isNight ? 'Switch to day mode' : 'Switch to night mode');
      button.title = isNight ? 'Switch to day mode' : 'Switch to night mode';
      const icon = button.querySelector('.theme-icon');
      if (icon) icon.textContent = isNight ? '☀' : '☾';
    });
    if (themeColorMeta) themeColorMeta.content = isNight ? '#101a2e' : dayThemeColor;
    setSetting('villageconnect-theme', isNight ? 'night' : 'day');
  };
  setTheme(getSetting('villageconnect-theme', 'day') === 'night');
  themeButtons.forEach(button => button.addEventListener('click', () => {
    setTheme(!document.documentElement.classList.contains('night-mode'));
  }));

  const contrastButtons = [...document.querySelectorAll('.contrast-button')];
  const setContrast = enabled => {
    document.body.classList.toggle('high-contrast', enabled);
    contrastButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(enabled));
      if (button.classList.contains('settings-toggle')) button.textContent = enabled ? 'Turn off' : 'Turn on';
    });
    setSetting('villageconnect-contrast', String(enabled));
  };
  setContrast(getSetting('villageconnect-contrast', 'false') === 'true');
  contrastButtons.forEach(button => button.addEventListener('click', () => {
    setContrast(!document.body.classList.contains('high-contrast'));
  }));

  let textScale = Math.max(90, Math.min(120, Number(getSetting('villageconnect-text-scale', '100'))));
  const updateTextScale = value => {
    textScale = Math.max(90, Math.min(120, value));
    document.documentElement.style.fontSize = `${textScale}%`;
    const indicator = document.querySelector('.font-size-indicator');
    if (indicator) indicator.textContent = `${textScale}%`;
    setSetting('villageconnect-text-scale', String(textScale));
  };
  updateTextScale(textScale);
  document.querySelectorAll('.font-control').forEach(button => button.addEventListener('click', () => {
    updateTextScale(textScale + (button.dataset.font === 'up' ? 5 : -5));
  }));

  const motionButton = document.querySelector('.motion-button');
  const updateMotion = enabled => {
    document.body.classList.toggle('reduce-motion', enabled);
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', String(enabled));
      motionButton.textContent = enabled ? 'Turn off' : 'Turn on';
    }
    setSetting('villageconnect-reduce-motion', String(enabled));
  };
  updateMotion(getSetting('villageconnect-reduce-motion', 'false') === 'true');
  motionButton?.addEventListener('click', () => updateMotion(!document.body.classList.contains('reduce-motion')));

  document.querySelector('.portal-search')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const query = form.querySelector('input').value.trim().toLowerCase();
    const feedback = form.querySelector('.search-feedback');
    if (!query) {
      feedback.textContent = 'Type a service, place or topic to search.';
      return;
    }
    const routes = [
      { terms: ['health', 'clinic', 'doctor', 'pharmacy', 'document', 'certificate', 'government', 'school', 'education', 'water', 'emergency', 'service', 'job'], label: 'Services', href: 'services.html' },
      { terms: ['place', 'market', 'hall', 'library', 'garden', 'shop', 'business', 'nearby', 'discover'], label: 'Discover nearby', href: 'directory.html' },
      { terms: ['event', 'news', 'update', 'notice', 'calendar', 'festival'], label: 'Community updates', href: 'events.html' },
      { terms: ['map', 'location', 'where', 'route'], label: 'Open the map', href: `map.html?area=${encodeURIComponent(query)}` }
    ];
    const matches = routes.filter(route => route.terms.some(term => term.includes(query) || query.includes(term)));
    const suggestions = matches.length ? matches : routes.slice(0, 3);
    feedback.replaceChildren();
    const label = document.createElement('span');
    label.textContent = matches.length ? `Suggested for “${query}”: ` : `No exact match. Browse: `;
    feedback.append(label);
    suggestions.forEach((route, index) => {
      const link = document.createElement('a');
      link.href = route.href;
      link.textContent = route.label;
      feedback.append(link);
      if (index < suggestions.length - 1) feedback.append(' · ');
    });
  });

  const wireFilter = (inputSelector, cardSelector, emptySelector, countSelector) => {
    const input = document.querySelector(inputSelector);
    const cards = [...document.querySelectorAll(cardSelector)];
    if (!input || !cards.length) return;
    const empty = document.querySelector(emptySelector);
    const count = document.querySelector(countSelector);
    let category = 'all';
    const apply = () => {
      const term = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const categoryMatch = category === 'all' || card.dataset.category === category;
        const textMatch = !term || card.textContent.toLowerCase().includes(term);
        card.hidden = !(categoryMatch && textMatch);
        if (!card.hidden) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
      if (count) count.textContent = `${visible} ${visible === 1 ? 'category' : 'categories'} found`;
    };
    document.querySelectorAll('.filter-chip[data-filter]').forEach(button => button.addEventListener('click', () => {
      category = button.dataset.filter;
      document.querySelectorAll('.filter-chip[data-filter]').forEach(chip => chip.classList.toggle('selected', chip === button));
      apply();
    }));
    input.addEventListener('input', apply);
    const query = new URLSearchParams(location.search).get('q');
    if (query) input.value = query;
    apply();
  };
  wireFilter('#service-search', '.catalog-card', '.empty-state', '.result-count');
  wireFilter('#directory-search', '.place-card', '.empty-state', '.result-count');

  const defaultLocation = 'Pauri Garhwal, Uttarakhand, India';
  document.body.dataset.defaultLocation = defaultLocation;
  const savedLocation = getSetting('villageconnect-map-location', '');
  const mapFrame = document.querySelector('#google-map');
  const miniMap = document.querySelector('.google-map-mini');
  const mapInput = document.querySelector('#area-input');
  const mapStatus = document.querySelector('#map-status');
  const googleLink = document.querySelector('.google-maps-link');
  const miniMapCaption = document.querySelector('#mini-map-caption');
  const pageQuery = new URLSearchParams(location.search);
  const mapCategory = pageQuery.get('q') || document.body.dataset.mapQuery || '';
  const mapAreaFromUrl = pageQuery.get('area') || '';
  const makeMapsUrl = query => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const makeEmbedUrl = query => `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const updateMaps = (area, category = '') => {
    const target = [category, area].filter(Boolean).join(' near ') || area || defaultLocation || 'India';
    const openQuery = [category, area].filter(Boolean).join(' near ') || area || defaultLocation || 'India';
    if (mapFrame) mapFrame.src = makeEmbedUrl(target);
    if (miniMap) miniMap.src = makeEmbedUrl(target);
    if (googleLink) googleLink.href = makeMapsUrl(openQuery);
    if (miniMapCaption && area) {
      miniMapCaption.replaceChildren(`Showing ${category ? `${category} near ` : ''}${area} on Google Maps. `);
      const link = document.createElement('a');
      link.href = makeMapsUrl(area);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'View nearby places ↗';
      miniMapCaption.append(link);
    }
    if (mapStatus) mapStatus.textContent = `Showing Google Maps results for ${target}. Select “Open Google Maps” to see place details and directions.`;
  };
  if (mapInput) {
    const initialArea = mapAreaFromUrl || savedLocation || defaultLocation;
    mapInput.value = initialArea;
    if (initialArea) updateMaps(initialArea, mapCategory);
  } else if (mapFrame || miniMap) {
    updateMaps(savedLocation || defaultLocation);
  }
  document.querySelector('#map-search-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const area = mapInput.value.trim();
    if (!area) return;
    setSetting('villageconnect-map-location', area);
    updateMaps(area, mapCategory);
  });
  document.querySelector('#current-location')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      if (mapStatus) mapStatus.textContent = 'Location access is not available in this browser. Enter your village or town instead.';
      return;
    }
    if (mapStatus) mapStatus.textContent = 'Waiting for your browser location permission…';
    navigator.geolocation.getCurrentPosition(position => {
      const area = `${position.coords.latitude},${position.coords.longitude}`;
      if (mapInput) mapInput.value = area;
      updateMaps(area, mapCategory);
      if (mapStatus) mapStatus.textContent = 'Showing your current area on Google Maps. Your coordinates are sent directly to Google Maps to load the map; VillageConnect does not receive or store them.';
    }, error => {
      const message = error.code === 1 ? 'Location permission was not granted. You can enter a village or town instead.' : 'Could not read your location. Please enter a village or town instead.';
      if (mapStatus) mapStatus.textContent = message;
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  });

  // Regional notice board for the Updates page.
  // GitHub Pages is static, so government pages are read through a browser-friendly
  // relay when direct CORS access is not available. The displayed notice URL remains
  // the official government source.
  const noticeForm = document.querySelector('#notice-location-form');
  const noticeBoard = document.querySelector('#notice-board-list');
  const noticeRegion = document.querySelector('#notice-region-input');
  const noticeArea = document.querySelector('#notice-area-input');
  const noticePincode = document.querySelector('#notice-pincode-input');
  const noticeStatus = document.querySelector('#notice-location-status');
  const noticeSourceNote = document.querySelector('#notice-source-note');
  const eventsMapIntro = document.querySelector('#events-map-intro');
  const eventsMiniMap = document.querySelector('#events-mini-map');
  const eventsGoogleLink = document.querySelector('#events-google-link');

  const pauriFallbackNotices = [
    { category: 'Election', date: '2026-10-07', time: '12:30 PM', title: 'Special voter enrolment campaign meeting', description: 'A district-level meeting covered a special campaign to enrol voters left out during SIR-2026 and new or first-time voters after final publication of the Electoral Roll.', source: 'https://pauri.nic.in/meetings-with-political-parties/' },
    { category: 'Election', date: '2026-10-06', time: '11:00 AM', title: 'Final Electoral Roll and EVM/VVPAT review meeting', description: 'A district-level meeting covered the final publication of the Electoral Roll under SIR-2026 and the First Level Checking of EVM & VVPAT machines.', source: 'https://pauri.nic.in/meetings-with-political-parties/' },
    { category: 'Election', date: '2026-09-21', time: '3:00 PM', title: 'SIR-2026 Electoral Roll meeting', description: 'Proceedings were recorded for a district meeting concerning the Special Intensive Revision of the Electoral Roll in the NIC Video Conference Room.', source: 'https://pauri.nic.in/meetings-with-political-parties/' },
    { category: 'Election', date: '2026-09-14', time: '3:00 PM', title: 'SIR-2026 Electoral Roll meeting', description: 'Proceedings were recorded for a district meeting concerning the Special Intensive Revision of the Electoral Roll in the NIC Video Conference Room.', source: 'https://pauri.nic.in/meetings-with-political-parties/' }
  ];

  const sourceMap = {
    'pauri garhwal': [
      'https://pauri.nic.in/meetings-with-political-parties/',
      'https://pauri.nic.in/announcements-and-press-notes/',
      'https://pauri.nic.in/whats-new/whats-new/'
    ],
    'pauri': [
      'https://pauri.nic.in/meetings-with-political-parties/',
      'https://pauri.nic.in/announcements-and-press-notes/',
      'https://pauri.nic.in/whats-new/whats-new/'
    ]
  };

  const cleanText = value => value.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
  const slugifyDistrict = value => cleanText(value).toLowerCase().replace(/\b(district|garhwal|state|india|uttrakhand|uttarakhand)\b/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const getNoticeSources = (area, region) => {
    const key = `${area}`.trim().toLowerCase();
    if (sourceMap[key]) return sourceMap[key];
    const slug = slugifyDistrict(area);
    if (!slug) return [];
    const base = `https://${slug}.nic.in`;
    return [
      `${base}/announcements-and-press-notes/`,
      `${base}/whats-new/whats-new/`,
      `${base}/notice_category/announcements/`
    ];
  };
  const formatDateParts = iso => {
    const m = String(iso || '').match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return { display: iso || 'Date not listed', day: '' };
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return { display: `${String(d.getDate()).padStart(2,'0')} ${d.toLocaleString('en-IN',{month:'short'})} ${d.getFullYear()}`, day: d.toLocaleString('en-IN',{weekday:'short'}) };
  };
  const parseDate = value => {
    let m = value.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
    m = value.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})/i);
    if (!m) return '';
    const months = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
    return `${m[3]}-${String(months[m[2].slice(0,3).toLowerCase()]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
  };
  const parseTime = value => {
    const m = value.match(/\b(\d{1,2}:\d{2}\s*(?:AM|PM))\b/i);
    return m ? m[1].toUpperCase().replace(/\s+/g,' ') : '';
  };
  const parseReaderContent = (content, sourceUrl) => {
    const rows = [];
    const lines = String(content || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      let title = '';
      let raw = line;
      let date = parseDate(line);
      let time = parseTime(line);
      let source = sourceUrl;
      const table = line.match(/^\|\s*(?:\d+\.?\s*)?\|\s*(.*?)\s*\|\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4})\s*\|/);
      if (table) {
        title = cleanText(table[1]);
        date = parseDate(table[2]);
      }
      const linkMatch = line.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/i);
      if (linkMatch) source = linkMatch[2];
      if (!title && date) {
        title = cleanText(line.replace(/\|/g, ' ').replace(datePatternGlobal(), '').trim());
        if (title.length < 12 && i > 0) title = cleanText(lines[i - 1]);
      }
      if (!date || !title || title.length < 12) continue;
      if (/^(s\.?\s*no|announcement|details|click here|view more|upload date|meeting date)$/i.test(title)) continue;
      const displaySource = source || sourceUrl;
      let description = '';
      if (i + 1 < lines.length) {
        const next = cleanText(lines[i + 1]);
        if (next && !parseDate(next) && next.length > 35 && !/^\|?\s*\d+\.?\s*\|/.test(lines[i + 1])) description = next.slice(0, 260);
      }
      rows.push({ category: inferNoticeCategory(title), date, time, title: title.slice(0, 180), description: description || 'See the official notice for the full details.', source: displaySource, raw });
    }
    const dedup = new Map();
    rows.forEach(item => dedup.set(`${item.title}|${item.date}`, item));
    return [...dedup.values()].sort((a,b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)).slice(0, 8);
  };
  const datePatternGlobal = () => /\b\d{1,2}[./-]\d{1,2}[./-]\d{4}\b/;
  const inferNoticeCategory = title => {
    const t = title.toLowerCase();
    if (/(election|electoral|sir|voter|evm|vvpat|ero|blo)/.test(t)) return 'Election';
    if (/(health|hospital|medical|vaccin)/.test(t)) return 'Health';
    if (/(education|school|college|scholarship|exam)/.test(t)) return 'Education';
    if (/(tender|procurement|bid)/.test(t)) return 'Tender';
    if (/(recruit|vacancy|job|engineer|appointment)/.test(t)) return 'Recruitment';
    return 'Government';
  };
  const readerFetch = async sourceUrl => {
    const direct = await fetch(sourceUrl, { headers: { Accept: 'text/html' } });
    if (direct.ok) {
      return await direct.text();
    }
    throw new Error(`Direct source failed: ${direct.status}`);
  };
  const relayFetch = async sourceUrl => {
    const relayUrl = `https://r.jina.ai/${sourceUrl}`;
    const response = await fetch(relayUrl, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Reader relay failed: ${response.status}`);
    const payload = await response.json();
    return payload?.data?.content || payload?.content || '';
  };
  const parseHtmlContent = (html, sourceUrl) => {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const rows = [];
      doc.querySelectorAll('table tr').forEach(row => {
        const cells = [...row.querySelectorAll('th,td')].map(cell => cleanText(cell.textContent || ''));
        if (cells.length < 2) return;
        const dateText = cells.find(cell => /\d{1,2}[./-]\d{1,2}[./-]\d{4}/.test(cell));
        const titleCell = cells.find(cell => cell.length > 12 && !/^(s\.?\s*no|details|upload date|meeting date)$/i.test(cell) && !/\d{1,2}[./-]\d{1,2}[./-]\d{4}/.test(cell));
        if (!dateText || !titleCell) return;
        const links = [...row.querySelectorAll('a[href]')].map(a => a.href).filter(Boolean);
        rows.push({ category: inferNoticeCategory(titleCell), date: parseDate(dateText), time: parseTime(`${titleCell} ${row.textContent || ''}`), title: titleCell.slice(0, 180), description: 'See the official notice for the full details.', source: links[0] || sourceUrl });
      });
      return rows.filter(item => item.date && item.title).slice(0, 12);
    } catch {
      return [];
    }
  };
  const loadGovernmentNoticeSource = async sourceUrl => {
    try {
      const html = await readerFetch(sourceUrl);
      const parsed = parseHtmlContent(html, sourceUrl);
      if (parsed.length) return parsed;
    } catch {
      // Try the relay below when the government page blocks browser CORS.
    }
    try {
      const content = await relayFetch(sourceUrl);
      return parseReaderContent(content, sourceUrl);
    } catch {
      return [];
    }
  };
  const renderNotices = (items, locationLabel, sourceLive = true) => {
    if (!noticeBoard) return;
    noticeBoard.replaceChildren();
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-board-message';
      empty.innerHTML = `<span class="empty-state-icon" aria-hidden="true">ⓘ</span><h3>No verified government notices found</h3><p>We could not match an official notice source for <strong>${escapeHtml(locationLabel)}</strong> yet. Try the district name, or check your local government website.</p>`;
      noticeBoard.append(empty);
      return;
    }
    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'sample-notice';
      const dateParts = formatDateParts(item.date);
      const meta = document.createElement('div'); meta.className = 'sample-notice-meta';
      const tag = document.createElement('span'); tag.className = 'notice-tag'; tag.textContent = item.category || 'Government';
      const time = document.createElement('time'); time.dateTime = item.date + (item.time ? `T${to24Hour(item.time)}` : ''); time.textContent = `${dateParts.display} ${dateParts.day ? `${dateParts.day}, ` : ''}${item.time || 'Time not listed'}`;
      meta.append(tag, time);
      const title = document.createElement('h3'); title.textContent = item.title;
      const desc = document.createElement('p'); desc.textContent = item.description || 'See the official government notice for full details.';
      const link = document.createElement('a'); link.className = 'text-link'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.href = item.source; link.textContent = `${sourceLive ? 'Verified government source' : 'Official-source fallback'} ↗`;
      card.append(meta, title, desc, link);
      noticeBoard.append(card);
    });
  };
  const escapeHtml = value => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const to24Hour = value => { const m = String(value).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i); if (!m) return '00:00'; let h = Number(m[1]); if (m[3].toUpperCase()==='PM' && h!==12) h += 12; if (m[3].toUpperCase()==='AM' && h===12) h = 0; return `${String(h).padStart(2,'0')}:${m[2]}`; };
  const saveNoticeLocation = (region, area, pincode) => setSetting('villageconnect-notice-location', JSON.stringify({ region, area, pincode }));
  const loadNoticeLocation = () => { try { return JSON.parse(getSetting('villageconnect-notice-location', '{}')); } catch { return {}; } };
  const applyRegionalMap = (region, area, pincode) => {
    const locationLabel = [area, region, pincode].filter(Boolean).join(', ');
    const query = `public events and services near ${locationLabel || 'India'}`;
    if (eventsMiniMap) eventsMiniMap.src = makeEmbedUrl(query);
    if (eventsGoogleLink) eventsGoogleLink.href = makeMapsUrl(locationLabel || 'India');
    if (eventsMapIntro) eventsMapIntro.textContent = `Explore Google Maps results around ${locationLabel || 'your selected location'}.`;
    if (miniMapCaption) miniMapCaption.textContent = `Showing ${locationLabel || 'your selected location'} on Google Maps.`;
  };
  const refreshRegionalNotices = async ({ region, area, pincode }) => {
    const normalizedRegion = region.trim(); const normalizedArea = area.trim(); const normalizedPincode = pincode.trim();
    const locationLabel = [normalizedArea, normalizedRegion, normalizedPincode].filter(Boolean).join(', ') || 'your location';
    applyRegionalMap(normalizedRegion, normalizedArea, normalizedPincode);
    saveNoticeLocation(normalizedRegion, normalizedArea, normalizedPincode);
    if (noticeStatus) noticeStatus.textContent = 'Checking official government notice sources…';
    if (noticeBoard) { noticeBoard.setAttribute('aria-busy', 'true'); noticeBoard.replaceChildren(); const loading = document.createElement('div'); loading.className = 'empty-board-message'; loading.innerHTML = '<span class="empty-state-icon" aria-hidden="true">↻</span><h3>Fetching verified notices</h3><p>Checking the official government source for this location.</p>'; noticeBoard.append(loading); }
    const sources = getNoticeSources(normalizedArea, normalizedRegion);
    let notices = [];
    for (const source of sources) {
      const found = await loadGovernmentNoticeSource(source);
      notices = notices.concat(found);
      if (notices.length >= 6) break;
    }
    const isPauri = /pauri\s*garhwal|\bpauri\b/i.test(`${normalizedArea} ${normalizedRegion}`);
    if (!notices.length && isPauri) notices = pauriFallbackNotices;
    renderNotices(notices.slice(0,6), locationLabel, notices.length > 0 && !notices.includes(pauriFallbackNotices[0]));
    if (noticeStatus) noticeStatus.textContent = notices.length ? `Showing ${notices.length} government notices for ${locationLabel}.` : `No verified government notices were found for ${locationLabel}.`;
    if (noticeSourceNote) noticeSourceNote.textContent = notices.length ? `Source: official government notice pages for the selected district or area. VillageConnect is independent; verify important details with the responsible authority.` : `No verified government notice source matched ${locationLabel}. VillageConnect is independent; try a district name or check your local government website.`;
    if (noticeBoard) noticeBoard.setAttribute('aria-busy', 'false');
  };
  if (noticeForm && noticeBoard) {
    const saved = loadNoticeLocation();
    if (saved.region) noticeRegion.value = saved.region;
    if (saved.area) noticeArea.value = saved.area;
    if (saved.pincode) noticePincode.value = saved.pincode;
    noticeForm.addEventListener('submit', event => {
      event.preventDefault();
      const p = noticePincode.value.trim();
      if (p && !/^\d{6}$/.test(p)) { if (noticeStatus) noticeStatus.textContent = 'Please enter a valid 6-digit PIN code.'; return; }
      refreshRegionalNotices({ region: noticeRegion.value, area: noticeArea.value, pincode: p });
    });
    refreshRegionalNotices({ region: noticeRegion.value, area: noticeArea.value, pincode: noticePincode.value });
  }

  const feedbackForm = document.querySelector('.feedback-form');
  const feedbackText = document.querySelector('#feedback-text');
  const characterCount = document.querySelector('.character-count');
  let preparedMessage = '';
  feedbackText?.addEventListener('input', () => {
    if (characterCount) characterCount.textContent = `${feedbackText.value.length} / 500 characters`;
  });
  feedbackForm?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(feedbackForm);
    const topic = data.get('topic');
    const content = feedbackText.value.trim();
    preparedMessage = `VillageConnect suggestion — ${topic}\n\n${content}`;
    const confirmation = feedbackForm.querySelector('.feedback-confirmation');
    confirmation.textContent = 'Your message draft is ready on this device. Copy it below to share with your local portal administrator; nothing has been sent.';
    const copyButton = feedbackForm.querySelector('.copy-feedback');
    if (copyButton) copyButton.hidden = false;
  });
  document.querySelector('.copy-feedback')?.addEventListener('click', async () => {
    const confirmation = feedbackForm?.querySelector('.feedback-confirmation');
    try {
      await navigator.clipboard.writeText(preparedMessage);
      if (confirmation) confirmation.textContent = 'Message copied. You can paste it into your local contact channel.';
    } catch {
      if (confirmation) confirmation.textContent = 'Clipboard access is unavailable. You can select and copy your message manually.';
    }
  });
})();
