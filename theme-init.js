(() => {
  try {
    if (localStorage.getItem('villageconnect-theme') === 'night') {
      document.documentElement.classList.add('night-mode');
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.content = '#101a2e';
    }
  } catch {
    // The site starts in day mode when browser storage is unavailable.
  }
})();
