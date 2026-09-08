# Render backend and Vercel frontend handover

The user will create and connect hosting services. No live deployment is claimed.

## Standalone frontend first

Import this repository into Vercel with repository root as the root directory. `vercel.json` defines the build and output directory. Leave `TGA_FRONTEND_DATA_MODE=demo`; no API URL is required. All demonstrated workflows use local browser fixtures. Public demo accounts are in [DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md).

Build: `npm run build`. Output: `TGA_Member_Portal_Source/tga-portal-prototype/dist/client`. The existing Cloudflare worker remains available as an alternative deployment target.

## Connect the backend

1. Create a Render web service from this repository and the root Dockerfile, or use `render.yaml` as a Blueprint.
2. Set `ASPNETCORE_ENVIRONMENT=Sandbox`, `TGA_DATA_MODE=Demo`, `TGA_PAYMENT_MODE=Mock`, `TGA_EMAIL_MODE=Console`, `TGA_SMS_MODE=Console`.
3. Generate `Jwt__Key` (32+ random bytes). Set `AllowedOrigins__0` to the exact HTTPS Vercel origin, without a trailing slash. Add additional allowed origins only if needed.
4. Keep the documented public demo passwords for a client POC, or set `DemoAdmin__Email`, `DemoAdmin__Password`, and `DemoMember__Password` before the first seed. Do not set blank password overrides. Overrides do not modify existing accounts; reset the disposable demo database if needed.
5. Deploy the API. Check `https://YOUR-API.onrender.com/health/ready` and `/swagger`.
6. In Vercel set `TGA_FRONTEND_DATA_MODE=api` and `VITE_API_BASE_URL=https://YOUR-API.onrender.com`, then rebuild/redeploy the frontend.
7. Sign in and test profile, document, assessment, payment, admin approval, and logout.

The app binds to Render's `PORT` on `0.0.0.0`. Health checks query the database. SQLite seeds automatically when absent and the default filesystem is disposable. Sleep/cold starts can delay the first request; frontend errors include a retry prompt.

## Cookies and proxies

Access tokens are memory-only. Refresh uses rotating Secure/HttpOnly/SameSite=None cookies in Sandbox. Some browsers block third-party cookies between `vercel.app` and `onrender.com`; sign-in can work while refresh fails. Use sibling custom domains under the same site, or a reviewed same-origin reverse proxy, for reliable long-lived sessions. There is no localStorage token fallback.

Forwarded headers are accepted only from configured `TrustedProxies__0`, etc. Configure actual trusted proxy addresses if client IP attribution is required. Secure cookie settings do not depend on trusting arbitrary forwarding headers.

## Reset and persistence

Browser POC: Administrator → Demo controls → Reset demo records.

Backend: stop the service and replace only its disposable SQLite database/file storage under its configured data directory, then restart. On ephemeral Render storage a fresh redeploy may reset data. There is intentionally no HTTP endpoint that deletes the database. Preserve production data separately; never use this reset procedure on production.

## URLs after your deployment

Frontend: your assigned Vercel URL. API: your assigned Render URL. Readiness: API URL + `/health/ready`. Swagger: API URL + `/swagger`. Actual live URLs cannot be supplied until you create these services.

Reference: [Render Docker](https://render.com/docs/docker), [port binding](https://render.com/docs/web-services#port-binding).
