# Wilderness Winter Weather

Ski, ride, or sled with confidence. Wilderness Winter Weather is a PWA that fetches Open‑Meteo data and translates it into rider-friendly insights: Beaufort wind levels with icons, avalanche risk, riding conditions, snowfall, and a mobile-first UI with offline support.

## Features
- Fast PWA shell with offline caching of the last known forecast (service worker + runtime image caching).
- Mobile-first cards with Beaufort wind icons (0–12), avalanche/riding condition pills, and animated Meteocons.
- Add resorts or current location; supports cached data when offline and marks cards as online/offline.
- Light/dark theme toggle and forecast collapse preference stored locally.

## Getting Started
1) Install dependencies: `npm install`  
2) Run locally: `npm start` (defaults to http://localhost:8000)  
3) Add a resort and allow location if you want current conditions.  
4) To test offline: load once online, then disable network and refresh to confirm cached data and icons render.

## Development Notes
- Code lives under `public/` for the client and `server.js` for API proxy/formatting.  
- Service worker: `public/service-worker.js` (update cache versions when changing cached assets).  
- Icons: Meteocons SVGs under `public/images/meteocons/fill/svg`; header logo in `public/images/icons/`.  
- Styles: `public/styles/styles.css`; JavaScript: `public/scripts/app.js`.  
- This repo has moved far beyond the original Google codelab; references and unused lab files were removed.

## Contributing
- Open a small PR with a clear summary and testing notes (online/offline checks are ideal).  
- Keep cache names bumped when you change cached assets.  
- Favor readable, secure code and add concise comments only where the flow isn’t obvious.
