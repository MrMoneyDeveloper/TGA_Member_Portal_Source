# The Gun Association static frontend

A lightweight, mobile-first public website and member/admin portal prototype built with semantic HTML, vanilla JavaScript modules and vanilla CSS. It does not use React, Vue, Next.js or a backend framework.

## Frontend stack

- HTML5 and accessible native controls
- Vanilla JavaScript / ES modules
- Vanilla CSS with CSS Grid, Flexbox and Bootstrap 5.3.8 utilities
- GSAP 3.15.0 with ScrollTrigger and Flip
- Lenis 1.3.25 smooth scrolling
- Three.js 0.185.1 WebGL particles, orbitals, lighting and cursor response
- Rive WebGL 2.38.5 with an honest missing-asset fallback
- Iconify Icon 3.0.2 using Solar interface icons
- esbuild 0.28.1 for a single browser-safe JavaScript bundle
- Wrangler 4.112.0 and Cloudflare Workers Static Assets

The project includes original lazy-loaded PNG gallery imagery, a CSS noise layer, spotlight cards, GSAP flip cards, a two-part member journey, an audio-ready chapter dock and responsive public/member/admin layouts.

## Run locally

```bash
npm install
npm run dev
```

The Wrangler preview runs at `http://127.0.0.1:5173`.

## Production build

```bash
npm run build
```

The static deployment output is written to `dist/`.

## Cloudflare deployment

Authenticate Wrangler for the intended Cloudflare account, then run:

```bash
npm run deploy
```

`wrangler.jsonc` publishes `dist/` through Cloudflare Workers Static Assets with SPA fallback handling.

## Demo credentials

| Role | Email | Password |
|---|---|---|
| Member | `member@tga.co.za` | `demo123` |
| Administrator | `admin@tga.co.za` | `admin123` |

## Optional production assets

The interface detects these files and activates their controls when supplied:

- `public/assets/tga-journey.riv`
- `public/audio/part-1.mp3`
- `public/audio/part-2.mp3`

Until approved files are supplied, the Rive frame and audio dock clearly state that assets are pending instead of simulating real content.

## Prototype limitations

- Authentication and role checks are simulated in the browser.
- Application data is not transmitted or stored.
- Uploaded file contents are not retained; safe display metadata can be stored locally.
- Payments, notifications, receipts, exports and chatbot responses are simulated.
- Prices, people, records and metrics are illustrative.
- Privacy wording requires legal review before publication.
