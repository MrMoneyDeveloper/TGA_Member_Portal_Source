# The Gun Association member experience

A mobile-first static prototype for a South African firearm association. It demonstrates a professional public website, membership application, exact demo login, member portal, administrator CRM, assessments, document metadata, payment journeys and a guarded support assistant.

The experience promotes responsible ownership, safety, secure storage, training and lawful compliance. It is not a firearm store, accredited course platform, legal-advice service or production member system.

## Frontend stack

- Semantic HTML5 and accessible native controls
- Vanilla JavaScript / ES modules
- Vanilla CSS, CSS Grid, Flexbox and Bootstrap 5.3.8
- Self-hosted DM Sans and Barlow Condensed through Fontsource
- GSAP 3.15.0 with ScrollTrigger and Flip
- Lenis 1.3.25 smooth scrolling with reduced-motion and mobile safeguards
- Three.js 0.185.1 for restrained hero particles, rings and precision lines
- Optional Rive WebGL 2.38.5, loaded only after an approved `.riv` file is detected
- Iconify Icon 3.0.2 with Solar interface icons
- esbuild 0.28.1 and Wrangler 4.112.0
- Cloudflare Workers Static Assets with SPA fallback

No React, Vue, Next.js, backend framework or database is used.

## Public pages

The public website uses a small History API router with Cloudflare SPA fallback. Direct visits, refreshes and browser Back/Forward are supported for:

- `/` — concise overview and service previews
- `/about` — association positioning, pillars and review placeholders
- `/membership` — benefits, member journey and illustrative plans
- `/training` — learning pathways and assessments
- `/resources` — compliance, responsible ownership, secure storage and FAQ
- `/contact` — general, membership and professional-support placeholders

`/login` opens the demonstration sign-in screen. An authenticated in-memory demo session uses `/portal`; directly opening or refreshing that path returns to login because no production authentication exists.

## Project layout

```text
index.html                 Semantic shell and metadata
src/main.js                Application state, events and prototype workflows
src/templates.js           Public, login, member and administrator templates
src/data.js                Central content, demo records and image manifest
src/config.js              Build-time public configuration
src/effects.js             GSAP, Lenis, Three.js and optional Rive effects
src/styles.css              Design tokens and responsive interface styling
public/images/tga/         Responsive prototype photography
docs/asset-register.md     Image-generation and approval register
scripts/build.mjs          Cloudflare-compatible production build
```

## Local development

Requirements: Node.js 20 or newer and npm.

```bash
npm ci
npm run dev
```

The Wrangler preview is available at `http://127.0.0.1:5173`.

## Production build

```bash
npm run build
```

Output is written to `dist/client`; the Sites-compatible Worker entry is written to `dist/server/index.js`.

Build-time settings:

| Variable | Default | Purpose |
|---|---|---|
| `SITE_URL` | empty | Verified absolute production or preview origin used for canonical and social metadata |
| `PUBLIC_INDEX` | `false` | Enables `index,follow`, sitemap and public canonical metadata only when `SITE_URL` is also valid |
| `DEMO_MODE` | `true` | Shows demo accounts, prototype guide and stakeholder-only notices |

Private preview builds remain `noindex,nofollow` by default. A public launch should use a verified domain and `DEMO_MODE=false` only after TGA approves content, legal wording and production functionality.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Member | `member@tga.co.za` | `demo123` |
| Administrator | `admin@tga.co.za` | `admin123` |

The browser accepts only these exact pairs. This is still frontend simulation, not secure authentication.

## Cloudflare deployment

From the GitHub repository root:

```bash
npm ci
npx wrangler deploy
```

The root Wrangler configuration runs `npm ci && npm run build` inside this nested application before publishing `dist/client`. The Worker name is `tgamemberportalsource` and the asset handler uses SPA fallback.

For an approved public build, configure the deployment environment with a verified `SITE_URL`, set `PUBLIC_INDEX=true`, and set `DEMO_MODE=false`. Do not add API keys, PayFast passphrases, private storage credentials or secrets to frontend variables.

## Imagery and licensing

The six website photographs and social card are AI-generated prototype assets created for this draft. They are not evidence of real TGA events, facilities, members, instructors or endorsements. TGA must review safety details, representation, crops, captions and suitability before publication.

See [docs/asset-register.md](docs/asset-register.md) for prompts, output names, placement, approval state and replacement guidance. Production imagery must be client-owned, properly licensed, royalty-free or explicitly approved. Do not hotlink third-party images.

## Privacy and POPIA boundary

- Public application information is validated in the browser and then discarded.
- Selected upload file contents are not transmitted or retained; display metadata may be saved in localStorage on the current device.
- Privacy, terms, retention and consent wording is draft copy requiring legal approval.
- Production needs lawful-purpose confirmation, role-based access, encryption, private storage, audit logging, retention/deletion controls, malware scanning and incident processes.

## PayFast boundary

The checkout and transaction records are simulations. A production integration must create signed requests on a secure server, validate amount and signature, process PayFast ITN callbacks idempotently, reconcile status and generate trustworthy receipts. No PayFast secret belongs in browser JavaScript.

## Known prototype limitations

- Authentication, password handling and permissions are not secure.
- Password recovery and email verification are not connected.
- There is no database, member CRM persistence or server-side authorization.
- Documents are not uploaded, encrypted, scanned or privately stored.
- Payments, receipts, refunds and renewals are simulated.
- Notifications, support requests and consulting requests are not sent.
- Audit trails are illustrative rather than immutable.
- Assessment content is not accredited or approved training.
- Prices, plans, people, metrics, reviews and contact information are illustrative.
- The chatbot uses static approved-topic responses and is not connected to an AI service.
- The optional Rive journey uses a static fallback until approved artwork is supplied.

## Production backend requirements

1. Identity with verified email, secure password hashing, MFA for privileged roles, session controls and server-authorized roles.
2. Member CRM, applications, membership lifecycle, configurable categories and status history.
3. Private object storage, content-type validation, malware scanning, signed access and document-review history.
4. Versioned assessments, attempts, scoring rules, reviewer overrides and immutable result snapshots.
5. PayFast request signing, ITN verification, idempotent event processing, receipts, refunds and reconciliation.
6. Approved notification delivery, support/consulting workflows and a governed knowledge base.
7. Immutable audit events, monitoring, backups, security testing and legally approved POPIA controls.

## Roadmap

- Obtain verified company, contact, membership, course and consulting content.
- Complete legal review of privacy, terms, consent and retention wording.
- Approve or replace prototype photography and supply social profile URLs.
- Build and security-test the production services listed above.
- Supply optional TGA journey Rive artwork if it provides genuine member value.
- Run formal accessibility, performance, privacy and penetration testing before public launch.
