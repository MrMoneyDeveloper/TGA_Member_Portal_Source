# The Gun Association (TGA) Portal Prototype

A working front-end prototype for a South African association portal/CRM covering member management, online assessments, document workflows, payments, and chatbot support.

## What is included

- Public marketing and membership application journey
- Demo member and administrator authentication
- Member profile and digital membership card
- Document upload and review states
- Online assessment with automatic scoring
- Membership payment and receipt screens
- Admin dashboard, member register, filters, record review, and status updates
- Document review queue
- Assessment and payment reporting
- Embedded support chatbot
- Responsive layout for desktop, tablet, and mobile
- GitHub Pages deployment workflow

## Demo credentials

| Role | Email | Password |
|---|---|---|
| Member | `member@tga.co.za` | `demo123` |
| Administrator | `admin@tga.co.za` | `admin123` |

Authentication is intentionally simulated. The login form directs `admin@...` or the password `admin123` to the admin portal; all other demo credentials open the member portal.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Build

```bash
npm run build
npm run preview
```

## Deploy with GitHub Pages

1. Push the repository to GitHub with `main` as the default branch.
2. In **Settings → Pages**, select **GitHub Actions** as the source.
3. Push a commit or run the **Deploy TGA portal to GitHub Pages** workflow manually.

The workflow builds the Vite project and deploys the `dist` directory.

## Important prototype limitations

This repository is for discovery, stakeholder review, and UI validation. It is **not production ready**.

- No real authentication, password storage, MFA, or role enforcement
- No database or server-side API
- Uploaded file contents are not retained; only safe metadata is stored in browser `localStorage`
- No real PayFast transaction is created
- No real AI provider is connected
- No legal or licensing advice is provided by the chatbot
- Prices, member records, results, and metrics are illustrative

## Recommended production architecture

```text
Browser / mobile web app
        │
        ▼
React or Next.js application
        │
        ├── Authentication and RBAC
        ├── Member and CRM API
        ├── Assessment service
        ├── Document service + malware scanning
        ├── Payment service + PayFast ITN handler
        ├── Notification service
        └── AI support gateway + human escalation
        │
        ▼
PostgreSQL + private object storage + audit log
```

### Production requirements

- Server-side authentication with MFA for administrators
- Role-based access controls and least-privilege permissions
- Encryption in transit and at rest
- Private object storage, signed download URLs, file type validation, and malware scanning
- PayFast server-side signature generation and Instant Transaction Notification validation
- Idempotent payment processing and immutable transaction history
- Consent records, data retention rules, access logs, and POPIA-aligned privacy processes
- Versioned assessments and immutable attempt results
- Email/SMS notifications and renewal reminders
- Backups, monitoring, incident response, and disaster recovery

## Suggested delivery phases

1. **Discovery and design:** Confirm membership types, workflows, required documents, assessments, roles, reports, and service-level targets.
2. **MVP:** Secure accounts, member CRM, document uploads, admin review, assessments, PayFast sandbox, email notifications, and core reporting.
3. **Operational release:** Production payments, audit exports, renewals, case management, consulting requests, chatbot knowledge base, and support handover.
4. **Enhancements:** Mobile app/PWA, digital credentials, automation, analytics, integrations, and advanced AI assistance.

## Source structure

```text
src/
  App.jsx
  data.js
  styles.css
  components/
    AdminPortal.jsx
    Brand.jsx
    Chatbot.jsx
    Login.jsx
    MemberPortal.jsx
    Modal.jsx
    PortalShell.jsx
.github/workflows/deploy-pages.yml
```

## Safety and compliance note

The prototype focuses on association administration, member safety, compliance records, and authorised support. It must not be used to provide automated case-specific legal advice or unsafe operational guidance.
