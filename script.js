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
      link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(area)}`;
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
      mapInput.value = area;
      updateMaps(area, mapCategory);
      if (mapStatus) mapStatus.textContent = 'Showing your current area on Google Maps. Your coordinates are sent directly to Google Maps to load the map; VillageConnect does not receive or store them.';
    }, error => {
      const message = error.code === 1 ? 'Location permission was not granted. You can enter a village or town instead.' : 'Could not read your location. Please enter a village or town instead.';
      if (mapStatus) mapStatus.textContent = message;
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  });

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
    confirmation.textContent = 'Your message draft is ready on this device. Copy it below to share with your local portal administrator.';
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
