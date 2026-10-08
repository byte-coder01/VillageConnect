# VillageConnect — Digital Village Portal

VillageConnect is a responsive digital village portal concept that brings essential services, nearby places, community updates, and local discovery together in one simple website. The default map area is Pauri Garhwal, Uttarakhand, India.

## Features

- Responsive landing page and navigation designed for desktop and mobile.
- Service categories and practical guides for public services, health, education, water, and emergency information.
- Discover page for exploring local services, community spaces, schools, shops, and outdoor places.
- Embedded Google Maps with place search, links to Google Maps results, and optional browser geolocation.
- Community updates page with an honest empty state until verified notices are added.
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

The files can be hosted on GitHub Pages because the site is static. Create a GitHub repository, add the site files, push them to the repository, and enable GitHub Pages for the branch and folder containing `index.html`.

## Important notes

- Google Maps provides map data and search results. The optional location button requests browser permission; coordinates are sent directly to Google Maps to load results.
- Feedback is not connected to an inbox or database yet. The current form prepares a message draft for the visitor to copy. To receive submissions, connect a form service such as Formspree or embed a Google Form.
- Community notices and local listings should be verified and connected to a trusted source before treating the portal as a live public service.


## Branding

- `favicon.svg` — Shared VillageConnect favicon used by every HTML page.
