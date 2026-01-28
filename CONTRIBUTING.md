# Contributing

Thanks for helping improve Wilderness Winter Weather! A few quick guidelines:

- **Branches/PRs**: Use focused branches and small PRs with a short summary plus what you tested (online/offline, UI checks).  
- **Caching**: When you change cached assets or service worker behavior, bump cache names in `public/service-worker.js`.  
- **Style**: Follow the existing ESLint/Prettier conventions, keep comments concise, and avoid unused assets or scripts.  
- **Testing**: Spot-check mobile and desktop layouts; confirm the PWA still loads from cache when offline.  
- **Security**: Prefer safe defaults, avoid exposing secrets, and validate any new inputs.
