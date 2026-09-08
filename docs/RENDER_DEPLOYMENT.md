# TGA sandbox deployment handover

This repository is prepared for a split sandbox deployment:

- **Frontend:** Vercel static deployment from the repository root.
- **Backend:** Render Docker web service from the repository root.
- **Sandbox database:** EF Core SQLite under `data/tga.db`.
- **Sandbox document storage:** local filesystem under `data/documents`.
- **Payments:** mock provider only.
- **Email/SMS:** console/database notification providers only.

No production deployment is claimed by this document.

## 1. Deploy the frontend to Vercel

Import `MrMoneyDeveloper/TGA_Member_Portal_Source` into Vercel and keep the **repository root** as the Vercel Root Directory.

The committed `vercel.json` supplies:

- Build command: `npm run build`
- Output directory: `TGA_Member_Portal_Source/tga-portal-prototype/dist/client`
- SPA rewrite to `index.html`
- `noindex, nofollow` sandbox headers

For the first deployment, use these Vercel environment variables:

```text
TGA_FRONTEND_DATA_MODE=demo
DEMO_MODE=true
PUBLIC_INDEX=false
```

`VITE_API_BASE_URL` and `SITE_URL` can be left unset for this first standalone deployment.

The standalone frontend uses browser fixtures and does not require Render to exist yet.

## 2. Deploy the backend to Render

Preferred route: create a **Render Blueprint** from the repository's root `render.yaml`.

The Blueprint already defines:

```text
ASPNETCORE_ENVIRONMENT=Sandbox
TGA_DATA_MODE=Demo
TGA_PAYMENT_MODE=Mock
TGA_EMAIL_MODE=Console
TGA_SMS_MODE=Console
ConnectionStrings__Demo=Data Source=data/tga.db
Storage__Path=data/documents
Jwt__AccessTokenMinutes=120
```

It also generates `Jwt__Key` automatically.

During initial Blueprint creation Render will prompt for:

```text
AllowedOrigins__0
```

Set it to the **exact Vercel HTTPS origin with no trailing slash**, for example:

```text
https://tga-member-portal.vercel.app
```

If you create a Render Web Service manually instead of using the Blueprint, use the root `Dockerfile` and add the same environment values yourself. In that case, also generate a fresh random `Jwt__Key` containing at least 32 bytes.

The API reads Render's `PORT` environment variable and binds on `0.0.0.0`. Do not hardcode a Render port in the dashboard.

## 3. Verify Render before connecting the frontend

After Render reports a successful deployment, verify:

```text
https://YOUR-API.onrender.com/health
https://YOUR-API.onrender.com/health/ready
https://YOUR-API.onrender.com/swagger
```

`/health/ready` must return a successful response before switching Vercel into API mode.

On first startup the sandbox automatically applies the SQLite migrations and seeds fictional demo records.

## 4. Connect Vercel to Render

In Vercel, change/add:

```text
TGA_FRONTEND_DATA_MODE=api
VITE_API_BASE_URL=https://YOUR-API.onrender.com
DEMO_MODE=true
PUBLIC_INDEX=false
```

Then redeploy Vercel. These values are consumed at build time.

The build intentionally fails if `TGA_FRONTEND_DATA_MODE=api` is selected without a valid `VITE_API_BASE_URL`. This prevents a successful-looking deployment with a dead backend connection.

## 5. Sandbox smoke test

After the Vercel redeploy, verify at minimum:

1. Open the public site.
2. Open member login.
3. Sign in with one of the fictional accounts in `DEMO_ACCOUNTS.md`.
4. Load the member dashboard.
5. View membership details.
6. Upload a small demo PDF/image.
7. Complete a demo assessment.
8. Run the mock renewal/payment workflow.
9. Sign out.
10. Sign in as Administrator.
11. Open the member register and dashboard metrics.
12. Review a demo document/application.

## Authentication note for vercel.app + onrender.com

Access tokens remain in browser memory. Refresh tokens use rotating Secure/HttpOnly/SameSite=None cookies.

Some privacy-focused browsers can block third-party cookies between `vercel.app` and `onrender.com`. The sandbox therefore uses a configurable **120-minute access-token lifetime** so a normal client presentation does not depend on refresh succeeding every ten minutes.

The preferred long-term configuration is sibling custom domains such as:

```text
portal.thegunassociation.co.za
api.thegunassociation.co.za
```

Production should return to a shorter reviewed access-token lifetime.

## Render Free persistence warning

Render Free web services use an **ephemeral filesystem**. Local SQLite changes and uploaded files can be lost when the service spins down, restarts, or redeploys. A Free web service can also spin down after inactivity.

That is acceptable for this disposable stakeholder sandbox because seed data is recreated automatically, but it means **client-created changes/uploads are not durable**.

If the client needs a stable sandbox whose changes survive idle periods/redeployments, move the Render API to a paid service with a persistent disk or replace the demo persistence strategy with a durable external store.

## Demo accounts and secrets

Public fictional demo accounts are documented in `DEMO_ACCOUNTS.md`.

Optional Render overrides:

```text
DemoAdmin__Email
DemoAdmin__Password
DemoMember__Password
```

Do not set blank password overrides. Do not place any real customer/member information in this sandbox.

## Production boundary

The application intentionally rejects `ASPNETCORE_ENVIRONMENT=Production` while mock/demo adapters remain installed. Production requires reviewed implementations/configuration for:

- Microsoft SQL Server
- durable secure document storage
- malware/file scanning
- PayFast production integration
- transactional email
- SMS/OTP
- production security/session configuration

See `OPEN_BUSINESS_DECISIONS.md` for unresolved client rules.
