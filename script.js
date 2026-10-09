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

  const defaultLocation = document.body.dataset.defaultLocation || 'Pauri Garhwal, Uttarakhand, India';
  document.body.dataset.defaultLocation = defaultLocation;
  const SHARED_LOCATION_KEY = 'villageconnect-shared-location';
  const parseJson = (value, fallback = {}) => { try { return JSON.parse(value); } catch { return fallback; } };
  const isCoordinateQuery = value => /^\s*-?\d{1,3}(?:\.\d+)\s*,\s*-?\d{1,3}(?:\.\d+)\s*$/.test(String(value || ''));
  const normalizeLocationRecord = value => {
    const item = value && typeof value === 'object' ? value : {};
    const latitude = Number.isFinite(Number(item.latitude)) && item.latitude !== '' && item.latitude !== null ? Number(item.latitude) : null;
    const longitude = Number.isFinite(Number(item.longitude)) && item.longitude !== '' && item.longitude !== null ? Number(item.longitude) : null;
    const record = {
      region: String(item.region || '').trim(),
      area: String(item.area || '').trim(),
      pincode: String(item.pincode || '').trim(),
      query: String(item.query || item.mapQuery || '').trim(),
      latitude,
      longitude,
      source: String(item.source || 'manual'),
      updatedAt: String(item.updatedAt || '')
    };
    if (!record.query && latitude !== null && longitude !== null) record.query = `${latitude}, ${longitude}`;
    if (!record.query) record.query = [record.area, record.region, record.pincode].filter(Boolean).join(', ');
    return record;
  };
  const readSharedLocation = () => {
    const raw = getSetting(SHARED_LOCATION_KEY, '');
    if (raw) {
      const parsed = parseJson(raw, null);
      if (parsed && typeof parsed === 'object') return normalizeLocationRecord(parsed);
    }
    // Migrate location choices made by earlier VillageConnect versions.
    const legacyNotice = parseJson(getSetting('villageconnect-notice-location', '{}'), {});
    const legacyMap = String(getSetting('villageconnect-map-location', '') || '').trim();
    const migrated = normalizeLocationRecord(legacyNotice);
    if (isCoordinateQuery(legacyMap)) {
      const parts = legacyMap.split(',').map(Number);
      migrated.latitude = parts[0]; migrated.longitude = parts[1]; migrated.query = `${parts[0]}, ${parts[1]}`;
    } else if (!migrated.area && !migrated.region && legacyMap) {
      migrated.area = legacyMap; migrated.query = legacyMap;
    } else if (!migrated.query && legacyMap) {
      migrated.query = legacyMap;
    }
    if (migrated.area || migrated.region || migrated.pincode || migrated.query) {
      migrated.source ||= 'migrated';
      setSetting(SHARED_LOCATION_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return {};
  };
  const sharedLocationLabel = locationRecord => {
    const item = normalizeLocationRecord(locationRecord);
    return [item.area, item.region, item.pincode].filter(Boolean).join(', ') || item.query || '';
  };
  const sharedLocationQuery = (locationRecord, fallback = '') => {
    const item = normalizeLocationRecord(locationRecord);
    if (item.latitude !== null && item.longitude !== null) return `${item.latitude}, ${item.longitude}`;
    return item.query || [item.area, item.region, item.pincode].filter(Boolean).join(', ') || fallback;
  };
  const saveSharedLocation = (value, { notify = false } = {}) => {
    const previous = readSharedLocation();
    const supplied = value && typeof value === 'object' ? value : {};
    const combined = normalizeLocationRecord({ ...previous, ...supplied, updatedAt: new Date().toISOString() });
    if (Object.prototype.hasOwnProperty.call(supplied, 'latitude') && supplied.latitude === null) combined.latitude = null;
    if (Object.prototype.hasOwnProperty.call(supplied, 'longitude') && supplied.longitude === null) combined.longitude = null;
    if (!combined.query) combined.query = sharedLocationQuery(combined, defaultLocation);
    setSetting(SHARED_LOCATION_KEY, JSON.stringify(combined));
    // Keep older page versions compatible while the repository finishes updating.
    setSetting('villageconnect-map-location', combined.query || sharedLocationLabel(combined));
    setSetting('villageconnect-notice-location', JSON.stringify({ region: combined.region, area: combined.area, pincode: combined.pincode }));
    if (notify) window.dispatchEvent(new CustomEvent('villageconnect:locationchange', { detail: combined }));
    return combined;
  };

  const savedLocation = readSharedLocation();
  const mapFrame = document.querySelector('#google-map');
  const mapFrames = [...document.querySelectorAll('#google-map, .google-map-mini')];
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
    mapFrames.forEach(frame => { frame.src = makeEmbedUrl(target); frame.title = `Google Maps results for ${target}`; });
    if (googleLink) googleLink.href = makeMapsUrl(target);
    if (miniMapCaption && area) {
      const saved = readSharedLocation();
      const captionArea = sharedLocationQuery(saved, '') === area ? (sharedLocationLabel(saved) || area) : area;
      miniMapCaption.replaceChildren(`Showing ${category ? `${category} near ` : ''}${captionArea} on Google Maps.`);
    }
    if (mapStatus) mapStatus.textContent = `Showing Google Maps results for ${target}. Select “Open Google Maps” to see place details and directions.`;
  };
  const savedQuery = sharedLocationQuery(savedLocation, '');
  const savedLabel = sharedLocationLabel(savedLocation);
  if (mapInput) {
    const initialArea = mapAreaFromUrl || savedLabel || savedQuery || defaultLocation;
    mapInput.value = initialArea;
    updateMaps(mapAreaFromUrl || savedQuery || defaultLocation, mapCategory);
  } else if (mapFrames.length) {
    updateMaps(savedQuery || defaultLocation, mapCategory);
  }
  document.querySelector('#map-search-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const area = mapInput?.value.trim();
    if (!area) return;
    saveSharedLocation({ region: '', area, pincode: '', query: area, latitude: null, longitude: null, source: 'manual' });
    updateMaps(area, mapCategory);
  });
  document.querySelector('#current-location')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      if (mapStatus) mapStatus.textContent = 'Location access is not available in this browser. Enter your village or town instead.';
      return;
    }
    if (mapStatus) mapStatus.textContent = 'Waiting for your browser location permission…';
    navigator.geolocation.getCurrentPosition(async position => {
      const latitude = Number(position.coords.latitude.toFixed(6));
      const longitude = Number(position.coords.longitude.toFixed(6));
      const area = `${latitude}, ${longitude}`;
      if (mapInput) mapInput.value = area;
      saveSharedLocation({ region: '', area: '', pincode: '', query: area, latitude, longitude, source: 'geolocation' });
      updateMaps(area, mapCategory);
      if (mapStatus) mapStatus.textContent = 'Your location is shown on Google Maps and saved only in this browser so other VillageConnect pages can reuse it.';
      try {
        const place = await reverseGeocode(latitude, longitude);
        saveSharedLocation({ ...place, query: area, latitude, longitude, source: 'geolocation' });
        if (mapInput) mapInput.value = sharedLocationLabel({ ...place, query: area }) || area;
        updateMaps(area, mapCategory);
      } catch { /* Coordinates remain saved if reverse lookup is unavailable. */ }
    }, error => {
      const message = error.code === 1 ? 'Location permission was not granted. You can enter a village or town instead.' : 'Could not read your location. Please enter a village or town instead.';
      if (mapStatus) mapStatus.textContent = message;
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  });

  // Regional notice board for the Updates page.
  // GitHub Pages remains the only hosting layer: a scheduled GitHub Actions workflow
  // refreshes data/notices.json from configured official government sites and deploys it
  // with the static site. The browser only reads the generated JSON file.
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
  let lastCoordinateQuery = '';
  let selectedEventsMapCategory = '';
  const eventsMapCategories = {
    markets: { label: 'Markets', query: 'markets farmers markets and local shops' },
    learning: { label: 'Learning', query: 'schools libraries learning centres and colleges' },
    health: { label: 'Health & wellbeing', query: 'clinics hospitals pharmacies and health centres' },
    community: { label: 'Community gatherings', query: 'community centres halls public events and gatherings' }
  };

  const normalizeLocation = value => String(value || '').toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, ' ').trim();
  const formatDateParts = iso => {
    const m = String(iso || '').match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return { display: iso || 'Date not listed', day: '' };
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const locale = window.VillageConnectLanguage?.current === 'hi' ? 'hi-IN' : 'en-IN';
    return { display: `${String(d.getDate()).padStart(2,'0')} ${d.toLocaleString(locale,{month:'short'})} ${d.getFullYear()}`, day: d.toLocaleString(locale,{weekday:'short'}) };
  };
  const escapeHtml = value => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const to24Hour = value => { const m = String(value).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i); if (!m) return '00:00'; let h = Number(m[1]); if (m[3].toUpperCase()==='PM' && h!==12) h += 12; if (m[3].toUpperCase()==='AM' && h===12) h = 0; return `${String(h).padStart(2,'0')}:${m[2]}`; };

  const loadNoticeData = async () => {
    try {
      const [sourcesResponse, noticesResponse] = await Promise.all([
        fetch(`data/notice-sources.json?v=${Date.now()}`, { cache: 'no-store' }),
        fetch(`data/notices.json?v=${Date.now()}`, { cache: 'no-store' })
      ]);
      if (!sourcesResponse.ok || !noticesResponse.ok) throw new Error('Notice data could not be loaded');
      return { sources: await sourcesResponse.json(), data: await noticesResponse.json() };
    } catch {
      return { sources: null, data: { status: 'empty', generatedAt: '', notices: [], parserWarnings: [] } };
    }
  };

  const pickDistrict = (region, area, pincode, sources) => {
    if (!sources?.districts) return null;
    const r = normalizeLocation(region);
    const a = normalizeLocation(area);
    const p = String(pincode || '').trim();
    let best = null;
    let bestScore = -1;
    sources.districts.forEach(district => {
      const aliases = [district.name, ...(district.aliases || [])].map(normalizeLocation);
      let score = 0;
      aliases.forEach(alias => {
        if (!alias) return;
        if (a === alias) score += 100;
        else if (a && (a.includes(alias) || alias.includes(a))) score += 45;
        if (r === alias) score += 20;
      });
      if (district.region && r && r !== normalizeLocation(district.region)) score -= 80;
      if ((district.pincodes || []).includes(p)) score += 35;
      if (score > bestScore) { bestScore = score; best = district; }
    });
    return bestScore > 0 ? best : null;
  };

  const invalidNoticeText = value => {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) return true;
    if (/!\s*\[[^\]]*\]\s*\(|\[[^\]]+\]\(\s*https?:\/\//i.test(text)) return true;
    if (/https?:\/\/|www\.|go to home|skip to (?:content|main content)|home page|site map|sitemap/i.test(text)) return true;
    if (/\b(?:image|logo|icon)\s*\d+\b/i.test(text)) return true;
    if (/^(?:home|homepage|go to home|menu|search|contact us|read more|click here|view|details|patna)$/i.test(text)) return true;
    return false;
  };
  const isRenderableNotice = item => {
    if (!item || typeof item !== 'object') return false;
    const title = String(item.title || '').replace(/\s+/g, ' ').trim();
    if (title.length < 15 || title.length > 220 || invalidNoticeText(title)) return false;
    const letters = Array.from(title).filter(char => /\p{L}/u.test(char)).length;
    if (letters < 8) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(item.date || ''))) return false;
    const parsedDate = new Date(`${item.date}T00:00:00Z`);
    if (Number.isNaN(parsedDate.getTime())) return false;
    const ageDays = (Date.now() - parsedDate.getTime()) / 86400000;
    if (ageDays > 730 || ageDays < -400) return false;
    try {
      const source = new URL(String(item.source || ''));
      if (source.protocol !== 'https:' || !(/\.nic\.in$/i.test(source.hostname) || /\.gov\.in$/i.test(source.hostname))) return false;
      if (!source.pathname || source.pathname === '/') return false;
    } catch { return false; }
    return true;
  };

  const renderNotices = (items, locationLabel, generatedAt, status, showParserWarning = false) => {
    if (!noticeBoard) return;
    items = (Array.isArray(items) ? items : []).filter(isRenderableNotice);
    noticeBoard.replaceChildren();
    if (showParserWarning) {
      const warning = document.createElement('div');
      warning.className = 'notice-parser-warning';
      warning.setAttribute('role', 'status');
      warning.innerHTML = '<span aria-hidden="true">ⓘ</span><p>Some official source content for this area could not be read in a usable notice format. Any malformed entries were hidden; please open the official source or check again after the next refresh.</p>';
      noticeBoard.append(warning);
    }
    if (noticeSourceNote) noticeSourceNote.textContent = status === 'live' ? 'Notices are refreshed by GitHub Actions from government sites discovered through India’s official government directory. If a local notice feed is unavailable, current Government of India PIB releases from available feeds may be shown instead. VillageConnect is independent; verify important details with the responsible authority.' : 'Showing the most recently collected verified government notices available. GitHub Actions refreshes the national index daily. VillageConnect is independent; verify important details with the responsible authority.';
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-board-message';
      empty.innerHTML = `<span class="empty-state-icon" aria-hidden="true">ⓘ</span><h3>No verified government notices found</h3><p>There are no collected notices for <strong>${escapeHtml(locationLabel)}</strong> yet. Try the district name, or check again after the next scheduled refresh.</p>`;
      noticeBoard.append(empty);
      return;
    }
    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'sample-notice';
      const dateParts = formatDateParts(item.date);
      const meta = document.createElement('div'); meta.className = 'sample-notice-meta';
      const tag = document.createElement('span'); tag.className = 'notice-tag';
      tag.textContent = item.scope === 'national' ? 'Government of India · PIB update' : item.scope === 'state' ? `${item.region || 'State'} government` : item.category || 'Government';
      const time = document.createElement('time'); time.dateTime = item.date + (item.time ? `T${to24Hour(item.time)}` : ''); time.textContent = `${dateParts.display} ${dateParts.day ? `${dateParts.day}, ` : ''}${item.time || 'Time not listed'}`;
      meta.append(tag, time);
      const title = document.createElement('h3'); title.textContent = item.title;
      const desc = document.createElement('p');
      const description = String(item.description || '').trim();
      desc.textContent = invalidNoticeText(description) ? 'See the official government notice for full details.' : (description || 'See the official government notice for full details.');
      const source = document.createElement('a'); source.className = 'text-link'; source.target = '_blank'; source.rel = 'noopener noreferrer'; source.href = item.source; source.textContent = 'Official government source ↗';
      card.append(meta, title, desc, source);
      noticeBoard.append(card);
    });
    if (noticeStatus) noticeStatus.textContent = `Showing ${items.length} verified government notices for ${locationLabel}${generatedAt ? ` · refreshed ${generatedAt}` : ''}.`;
  };

  const getEventsBaseLocation = () => {
    if (lastCoordinateQuery) return lastCoordinateQuery;
    if (noticeForm) {
      const formLocation = [noticeArea?.value.trim(), noticeRegion?.value.trim(), noticePincode?.value.trim()].filter(Boolean).join(', ');
      if (formLocation) return formLocation;
    }
    return sharedLocationQuery(readSharedLocation(), defaultLocation) || defaultLocation;
  };
  const updateEventsMap = (mapLocation = '') => {
    if (!eventsMiniMap && !eventsGoogleLink) return;
    const locationText = mapLocation || getEventsBaseLocation() || 'India';
    const category = eventsMapCategories[selectedEventsMapCategory];
    const query = category ? `${category.query} near ${locationText}` : `public events and services near ${locationText}`;
    if (eventsMiniMap) { eventsMiniMap.src = makeEmbedUrl(query); eventsMiniMap.title = `Google Maps showing ${category ? category.label.toLowerCase() : 'public events and services'} near ${locationText}`; }
    if (eventsGoogleLink) eventsGoogleLink.href = makeMapsUrl(query);
    const label = category ? category.label : 'public events and services';
    const saved = readSharedLocation();
    const displayLocation = sharedLocationQuery(saved, '') === locationText ? (sharedLocationLabel(saved) || locationText) : locationText;
    if (eventsMapIntro) eventsMapIntro.textContent = `Showing ${label.toLowerCase()} around ${displayLocation}.`;
    if (miniMapCaption) miniMapCaption.textContent = `Showing ${label.toLowerCase()} around ${displayLocation} on Google Maps.`;
    document.querySelectorAll('[data-map-category]').forEach(button => {
      const active = button.dataset.mapCategory === selectedEventsMapCategory;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('is-active', active);
    });
  };
  document.querySelectorAll('[data-map-category]').forEach(button => button.addEventListener('click', () => {
    selectedEventsMapCategory = button.dataset.mapCategory || '';
    updateEventsMap();
  }));
  const applyRegionalMap = (region, area, pincode, mapQuery = '') => {
    const locationLabel = [area, region, pincode].filter(Boolean).join(', ');
    const mapLocation = mapQuery || locationLabel || sharedLocationQuery(readSharedLocation(), defaultLocation) || defaultLocation;
    updateEventsMap(mapLocation);
  };

  const refreshRegionalNotices = async ({ region, area, pincode, mapQuery = '', persist = true } = {}) => {
    const normalizedRegion = String(region || '').trim(); const normalizedArea = String(area || '').trim(); const normalizedPincode = String(pincode || '').trim();
    const locationLabel = [normalizedArea, normalizedRegion, normalizedPincode].filter(Boolean).join(', ') || 'your location';
    applyRegionalMap(normalizedRegion, normalizedArea, normalizedPincode, mapQuery);
    if (persist) {
      const coords = String(mapQuery || '').match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
      saveSharedLocation({ region: normalizedRegion, area: normalizedArea, pincode: normalizedPincode, query: mapQuery || locationLabel || defaultLocation, latitude: coords ? Number(coords[1]) : null, longitude: coords ? Number(coords[2]) : null, source: coords ? 'geolocation' : 'manual' });
    }
    if (noticeStatus) noticeStatus.textContent = 'Loading the latest collected government notices…';
    if (noticeBoard) { noticeBoard.setAttribute('aria-busy', 'true'); noticeBoard.replaceChildren(); const loading = document.createElement('div'); loading.className = 'empty-board-message'; loading.innerHTML = '<span class="empty-state-icon" aria-hidden="true">↻</span><h3>Finding verified notices</h3><p>Matching your area to the latest government notice data.</p>'; noticeBoard.append(loading); }

    const { sources, data } = await loadNoticeData();
    const district = pickDistrict(normalizedRegion, normalizedArea, normalizedPincode, sources);
    const rawNotices = Array.isArray(data.notices) ? data.notices : [];
    const districtKey = district ? normalizeLocation(district.name) : '';
    const aliases = district ? [district.name, ...(district.aliases || [])].map(normalizeLocation) : [];
    const areaKey = normalizeLocation(normalizedArea);
    const regionKey = normalizeLocation(normalizedRegion);
    const matchesSelectedDistrict = item => {
      if (!item || item.scope === 'national') return false;
      const key = normalizeLocation(item.district);
      const configuredMatch = Boolean(district && key && (
        key === districtKey || aliases.includes(key) || aliases.some(alias => {
          return Boolean(alias) && (key.includes(alias) || alias.includes(key));
        })
      ));
      const directMatch = Boolean(areaKey && key && (key === areaKey || key.includes(areaKey) || areaKey.includes(key)));
      const districtMatch = Boolean(configuredMatch || directMatch);
      const regionMatches = !regionKey || !item.region || normalizeLocation(item.region) === regionKey;
      return districtMatch && regionMatches;
    };
    const matchingRawNotices = rawNotices.filter(matchesSelectedDistrict);
    const rejectedMatchingNotices = matchingRawNotices.some(item => !isRenderableNotice(item));
    const all = rawNotices.filter(isRenderableNotice);
    const localNotices = all.filter(matchesSelectedDistrict);
    const stateNotices = all.filter(item => item.scope === 'state' && regionKey && normalizeLocation(item.region) === regionKey);
    const nationalNotices = all.filter(item => item.scope === 'national');
    let notices = localNotices.length ? localNotices : (stateNotices.length ? stateNotices : nationalNotices);
    const usingNationalFallback = localNotices.length === 0 && stateNotices.length === 0 && nationalNotices.length > 0;
    const parserWarnings = Array.isArray(data.parserWarnings) ? data.parserWarnings.map(normalizeLocation) : [];
    const sourceParserWarning = !!district && parserWarnings.includes(districtKey);
    notices = notices.sort((a,b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`)).slice(0, 6);
    const generatedLabel = data.generatedAt ? new Date(data.generatedAt).toLocaleString(window.VillageConnectLanguage?.current === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '';
    renderNotices(notices, locationLabel, generatedLabel, data.status || 'empty', sourceParserWarning || rejectedMatchingNotices);
    if (usingNationalFallback && noticeStatus) {
      noticeStatus.textContent = `No district-specific notices were found for ${locationLabel}; showing current Government of India PIB releases instead.`;
    } else if (!notices.length && noticeStatus) {
      noticeStatus.textContent = `No current verified government notices are available for ${locationLabel}. The site will try again after the next scheduled refresh.`;
    }
    if (noticeBoard) noticeBoard.setAttribute('aria-busy', 'false');
  };

  if (noticeForm && noticeBoard) {
    const saved = readSharedLocation();
    const hasSavedLocation = Boolean(saved.region || saved.area || saved.pincode || saved.query);
    if (saved.region) noticeRegion.value = saved.region;
    if (saved.area) noticeArea.value = saved.area;
    if (saved.pincode) noticePincode.value = saved.pincode;
    if (!hasSavedLocation) { noticeRegion.value = 'Uttarakhand'; noticeArea.value = 'Pauri Garhwal'; }
    lastCoordinateQuery = Number.isFinite(saved.latitude) && Number.isFinite(saved.longitude) ? `${saved.latitude}, ${saved.longitude}` : (isCoordinateQuery(saved.query) ? saved.query : '');
    noticeForm.addEventListener('submit', event => {
      event.preventDefault();
      const p = noticePincode.value.trim();
      if (p && !/^\d{6}$/.test(p)) { if (noticeStatus) noticeStatus.textContent = 'Please enter a valid 6-digit PIN code.'; return; }
      lastCoordinateQuery = '';
      refreshRegionalNotices({ region: noticeRegion.value, area: noticeArea.value, pincode: p });
    });
    refreshRegionalNotices({ region: noticeRegion.value, area: noticeArea.value, pincode: noticePincode.value, mapQuery: lastCoordinateQuery, persist: false });
  }

  const noticeCurrentLocation = document.querySelector('#notice-current-location');
  const reverseGeocode = async (latitude, longitude) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=10&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    let response;
    try { response = await fetch(url, { headers: { Accept: 'application/json', 'Accept-Language': 'en' }, cache: 'no-store', signal: controller.signal }); }
    finally { window.clearTimeout(timeout); }
    if (!response.ok) throw new Error('Reverse geocoding failed');
    const result = await response.json();
    const address = result.address || {};
    const region = address.state || address.region || address.state_name || '';
    const area = address.state_district || address.district || address.county || address.city_district || address.municipality || address.city || address.town || address.village || '';
    const pincode = String(address.postcode || '').match(/\b\d{6}\b/)?.[0] || '';
    if (!region && !area && !pincode) throw new Error('District not found');
    return { region, area, pincode };
  };

  noticeCurrentLocation?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      if (noticeStatus) noticeStatus.textContent = 'Location access is not available in this browser. Enter your region and area manually.';
      return;
    }
    noticeCurrentLocation.disabled = true;
    noticeCurrentLocation.setAttribute('aria-busy', 'true');
    if (noticeStatus) noticeStatus.textContent = 'Requesting your location permission…';
    navigator.geolocation.getCurrentPosition(async position => {
      const latitude = Number(position.coords.latitude.toFixed(6));
      const longitude = Number(position.coords.longitude.toFixed(6));
      const coordinateQuery = `${latitude}, ${longitude}`;
      lastCoordinateQuery = coordinateQuery;
      saveSharedLocation({ region: '', area: '', pincode: '', query: coordinateQuery, latitude, longitude, source: 'geolocation' });
      updateEventsMap(coordinateQuery);
      if (noticeStatus) noticeStatus.textContent = 'Finding your district…';
      try {
        const place = await reverseGeocode(latitude, longitude);
        noticeRegion.value = place.region;
        noticeArea.value = place.area;
        noticePincode.value = place.pincode;
        saveSharedLocation({ ...place, query: coordinateQuery, latitude, longitude, source: 'geolocation' });
        if (!place.area && !place.pincode) {
          if (noticeStatus) noticeStatus.textContent = 'The map is centered on your current coordinates, but your district could not be identified. Please enter your region and area to load matching notices.';
        } else {
          if (noticeStatus) noticeStatus.textContent = 'Location found. Matching government notices to your district…';
          await refreshRegionalNotices({ region: place.region, area: place.area, pincode: place.pincode, mapQuery: coordinateQuery });
        }
      } catch {
        saveSharedLocation({ region: '', area: '', pincode: '', query: coordinateQuery, latitude, longitude, source: 'geolocation' });
        if (noticeStatus) noticeStatus.textContent = 'Could not look up your district. The map is updated to your current coordinates; please enter your region and area manually.';
      } finally {
        noticeCurrentLocation.disabled = false;
        noticeCurrentLocation.removeAttribute('aria-busy');
      }
    }, error => {
      if (noticeStatus) noticeStatus.textContent = error.code === 1 ? 'Your location was not shared. You can enter your region and area manually.' : 'Could not access your current location. Please enter your region and area manually.';
      noticeCurrentLocation.disabled = false;
      noticeCurrentLocation.removeAttribute('aria-busy');
    }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
  });

  // Re-render dates, categories and generated status text in the selected language.
  window.addEventListener('villageconnect:languagechange', () => {
    if (!noticeForm || !noticeBoard) return;
    refreshRegionalNotices({ region: noticeRegion.value, area: noticeArea.value, pincode: noticePincode.value, mapQuery: lastCoordinateQuery, persist: false });
  });

  // Dynamic homepage notices reuse the same verified dataset as the Updates page.
  const homeNoticeList = document.querySelector('#home-notices-list');
  const homeNoticeEmpty = document.querySelector('#home-notices-empty');
  const homeNoticeStatus = document.querySelector('#home-notices-status');
  const effectiveHomeLocation = () => {
    const saved = readSharedLocation();
    if (saved.region || saved.area || saved.pincode || saved.query) return saved;
    return { region: 'Uttarakhand', area: 'Pauri Garhwal', pincode: '', query: 'Pauri Garhwal, Uttarakhand, India' };
  };
  const matchingNoticesFor = (region, area, pincode, sources, data) => {
    const district = pickDistrict(region, area, pincode, sources);
    const regionKey = normalizeLocation(region);
    const areaKey = normalizeLocation(area);
    const districtKey = district ? normalizeLocation(district.name) : '';
    const aliases = district ? [district.name, ...(district.aliases || [])].map(normalizeLocation) : [];
    const all = (Array.isArray(data?.notices) ? data.notices : []).filter(isRenderableNotice);
    const local = all.filter(item => {
      if (item.scope === 'national') return false;
      const key = normalizeLocation(item.district);
      const sourceDistrictMatch = Boolean(key && district && (key === districtKey || aliases.includes(key) || aliases.some(alias => alias && (key.includes(alias) || alias.includes(key)))));
      const directDistrictMatch = Boolean(areaKey && key && (key === areaKey || key.includes(areaKey) || areaKey.includes(key)));
      const sourceRegion = normalizeLocation(item.region);
      return (sourceDistrictMatch || directDistrictMatch) && (!regionKey || !sourceRegion || sourceRegion === regionKey);
    });
    const state = all.filter(item => item.scope === 'state' && regionKey && normalizeLocation(item.region) === regionKey);
    const national = all.filter(item => item.scope === 'national');
    return { notices: (local.length ? local : state.length ? state : national).sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`)), nationalFallback: !local.length && !state.length && national.length > 0 };
  };
  const loadHomeNotices = async () => {
    if (!homeNoticeList) return;
    const place = effectiveHomeLocation();
    const label = sharedLocationLabel(place) || sharedLocationQuery(place, defaultLocation) || defaultLocation;
    homeNoticeList.replaceChildren();
    if (homeNoticeStatus) homeNoticeStatus.textContent = 'Loading recent official notices…';
    try {
      const { sources, data } = await loadNoticeData();
      const selected = matchingNoticesFor(place.region, place.area, place.pincode, sources, data);
      const items = selected.notices.slice(0, 3);
      if (homeNoticeEmpty) homeNoticeEmpty.hidden = items.length > 0;
      if (!items.length) {
        if (homeNoticeStatus) homeNoticeStatus.textContent = `No verified notices are currently available for ${label}. Open the Updates page to check the latest notice index.`;
        return;
      }
      items.forEach(item => {
        const card = document.createElement('article');
        card.className = 'home-notice-item';
        const meta = document.createElement('div'); meta.className = 'home-notice-meta';
        const tag = document.createElement('span'); tag.className = 'notice-tag';
        tag.textContent = item.scope === 'national' ? 'Government of India · PIB update' : item.scope === 'state' ? `${item.region || 'State'} government` : (item.category || 'Government');
        const dateParts = formatDateParts(item.date);
        const time = document.createElement('time');
        time.dateTime = item.date + (item.time ? `T${to24Hour(item.time)}` : '');
        time.textContent = `${dateParts.display}${dateParts.day ? ` · ${dateParts.day}` : ''}${item.time ? ` · ${item.time}` : ''}`;
        meta.append(tag, time);
        const title = document.createElement('h4'); title.textContent = item.title;
        const source = document.createElement('a'); source.className = 'text-link'; source.href = item.source; source.target = '_blank'; source.rel = 'noopener noreferrer'; source.textContent = 'Official government source ↗';
        card.append(meta, title, source);
        homeNoticeList.append(card);
      });
      if (homeNoticeStatus) {
        homeNoticeStatus.textContent = `Recent verified notices for ${label}${data.generatedAt ? ` · refreshed ${new Date(data.generatedAt).toLocaleDateString(window.VillageConnectLanguage?.current === 'hi' ? 'hi-IN' : 'en-IN')}` : ''}.`;
      }
    } catch {
      if (homeNoticeEmpty) homeNoticeEmpty.hidden = false;
      if (homeNoticeStatus) homeNoticeStatus.textContent = 'Official notices could not be loaded right now. Please try the Updates page again later.';
    }
  };
  if (homeNoticeList) loadHomeNotices();

  // If a second VillageConnect tab changes the saved location, update this tab too.
  window.addEventListener('storage', event => {
    if (event.key !== SHARED_LOCATION_KEY) return;
    const place = readSharedLocation();
    const query = sharedLocationQuery(place, defaultLocation) || defaultLocation;
    if (mapInput && document.activeElement !== mapInput) mapInput.value = sharedLocationLabel(place) || query;
    if (noticeForm) {
      noticeRegion.value = place.region || '';
      noticeArea.value = place.area || '';
      noticePincode.value = place.pincode || '';
      lastCoordinateQuery = Number.isFinite(place.latitude) && Number.isFinite(place.longitude) ? `${place.latitude}, ${place.longitude}` : (isCoordinateQuery(place.query) ? place.query : '');
      refreshRegionalNotices({ region: place.region, area: place.area, pincode: place.pincode, mapQuery: lastCoordinateQuery, persist: false });
    } else {
      updateMaps(query, mapCategory);
    }
    if (homeNoticeList) loadHomeNotices();
  });
  window.addEventListener('villageconnect:languagechange', () => { if (homeNoticeList) loadHomeNotices(); });

  const feedbackForm = document.querySelector('.feedback-form');
  const feedbackText = document.querySelector('#feedback-text');
  const feedbackEmail = document.querySelector('#feedback-email');
  const characterCount = document.querySelector('.character-count');
  let preparedMessage = '';
  const feedbackConfirmation = feedbackForm?.querySelector('.feedback-confirmation');
  const copyFeedbackButton = feedbackForm?.querySelector('.copy-feedback');

  feedbackText?.addEventListener('input', () => {
    if (characterCount) characterCount.textContent = `${feedbackText.value.length} / 500 characters`;
  });

  // FormSubmit handles delivery for this static GitHub Pages site.
  // The _next URL is built at runtime so it works on both a custom domain
  // and a GitHub Pages project path.
  if (feedbackForm) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('contact') === 'sent') {
      if (feedbackConfirmation) {
        feedbackConfirmation.textContent = 'Your message was submitted. If this is the first submission, delivery will begin after the inbox owner confirms FormSubmit’s activation email.';
      }
      params.delete('contact');
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('contact');
      window.history.replaceState({}, document.title, cleanUrl.toString());
    }

    feedbackForm.addEventListener('submit', () => {
      const data = new FormData(feedbackForm);
      const topic = String(data.get('topic') || 'General');
      const content = String(feedbackText?.value || '').trim();
      preparedMessage = `VillageConnect message — ${topic}\n\n${content}`;

      const subject = feedbackForm.querySelector('[name="_subject"]');
      const next = feedbackForm.querySelector('[name="_next"]');
      const sourceUrl = feedbackForm.querySelector('[name="_url"]');
      if (subject) subject.value = `VillageConnect message — ${topic}`;
      if (next) {
        const returnUrl = new URL(window.location.pathname, window.location.origin);
        returnUrl.searchParams.set('contact', 'sent');
        next.value = returnUrl.toString();
      }
      if (sourceUrl) sourceUrl.value = window.location.href;
      if (feedbackConfirmation) feedbackConfirmation.textContent = 'Sending your message…';
    });
  }

  copyFeedbackButton?.addEventListener('click', async () => {
    const content = String(feedbackText?.value || '').trim();
    const topic = new FormData(feedbackForm).get('topic') || 'General';
    preparedMessage = `VillageConnect message — ${topic}\n\n${content}`;
    try {
      await navigator.clipboard.writeText(preparedMessage);
      if (feedbackConfirmation) feedbackConfirmation.textContent = 'Message copied. You can paste it into your email or another contact channel.';
    } catch {
      if (feedbackConfirmation) feedbackConfirmation.textContent = 'Clipboard access is unavailable. You can select and copy your message manually.';
    }
  });
})();
