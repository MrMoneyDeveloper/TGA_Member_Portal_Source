# TGA backend architecture

## Updated delivery order

The user clarified during implementation: deliver a standalone, hardcoded, traceable client POC first, test it, then build the backend. They will connect and deploy Render/Vercel themselves. The browser adapter therefore remains the default and public demo passwords are explicitly authorized. It uses seeded fictional localStorage records behind asynchronous service methods. This is not production authentication or shared server persistence. The ASP.NET Core backend is a separate selectable mode and is developed after frontend verification.

## Repository audit (before implementation)

The application lives in `TGA_Member_Portal_Source/tga-portal-prototype`. It is vanilla JavaScript with HTML template functions, CSS, esbuild, GSAP/Three/Rive effects and a Cloudflare static-assets worker. There is no React, TypeScript, backend, database or API client. Root package scripts wrap the nested project. No AGENTS.md or Sites hosting configuration was found. Public routes use History API (`/`, `/about`, `/membership`, `/training`, `/resources`, `/contact`); `/login` and `/portal` share the same entry point. Portal sections are state driven.

### Hardcoded data inventory and mapping

* `src/data.js`: demoUsers -> Identity users/roles (remove browser passwords); demoMembers -> MemberProfile, Membership, MembershipPlan; initialDocuments -> DocumentType, MemberDocument; assessmentQuestions including answer keys -> Assessment, Question, QuestionOption (remove browser answer keys). membershipPlans -> MembershipPlan. Other arrays are public editorial content, image metadata and scripted support guidance.
* `src/main.js`: browser-only login/role selection; localStorage document metadata and score; simulated registration, profile save, payment, document review and member status updates; in-browser CSV. Replace operational actions with authenticated APIs. Keep only remembered email locally.
* `src/templates.js`: memberOverview hardcodes name, number, expiry, progress, receipt and activity; memberProfile hardcodes contact details; memberPayments hardcodes transaction; memberAssessments hardcodes rules; adminDashboard hardcodes metrics; adminReviews hardcodes queue; adminAssessments hardcodes scores; adminPayments hardcodes transactions. Convert these functions to consume state populated from API DTOs while retaining CSS/layout/navigation. Forms: login, application, profile, upload, assessment and local scripted chat.
* `src/config.js` and `scripts/build.mjs`: public site/index/demo build flags, no API config. Add `VITE_API_BASE_URL` as esbuild define (name retained for deployment compatibility).
* `wrangler.jsonc`, worker and README target Cloudflare. Add independent Vercel static deployment and Render Docker backend without removing the existing worker.

## Proposed modular monolith

.NET 10 controllers in Tga.Api; plain entities and rules in Tga.Domain; DTOs/service contracts in Tga.Application; EF Core, Identity and provider implementations in Tga.Infrastructure. SQLite Demo and SQL Server use the same business operations, with provider-specific migration contexts. Controllers enforce policies and record ownership. Business workflows use transactions, concurrency tokens and UTC TimeProvider.

API authentication uses bearer access tokens kept in browser memory, hashed rotating refresh tokens in HttpOnly cookies and server-side role policies. Development defaults to 10-minute access tokens; Sandbox defaults to a configurable 120 minutes for presentations. Cross-origin cookie requests require an explicit allowed Origin. Deployment must use HTTPS; development cookies permit localhost HTTP. Following the user's POC clarification, public fictional demo passwords are intentionally included in the browser login register; production credentials must never be bundled.

Uploads are private, validated by extension, MIME, signature and size and downloaded through authorized endpoints. A sandbox scanner is explicitly a no-op; production must configure a real scanner/storage adapter. Payments start with server-priced Mock checkout; PayFast is isolated behind IPaymentGateway. No card details are collected. Assessment answers are scored on the server; member DTOs exclude answer keys.

## Demo and production strategy

Seed fictional users and scenarios only in Demo mode outside Production. Public demo passwords are documented in DEMO_ACCOUNTS.md and may be overridden by environment variables. SQLite and temporary files are disposable sandbox infrastructure. SQL Server is configured by environment and deployed using explicit EF migrations, never deletion/recreation at production startup. Production adapters and client-approved policy content remain required before production enablement.

## Assumptions and conflicts

The frontend is not React/Vite, so its current esbuild pipeline is retained. Existing R450/R750 annual fees are illustrative configurable seed defaults. Existing firearm-related assessment questions are replaced with explicitly fictional portal-learning content, not accredited competency. Misleading browser-only privacy statements must change because data will now reach the sandbox API. Support/chat remain local scripted guidance, outside backend scope. All document types are optional demo types. Annual duration is 12 months; manual renewal and admin approval are demo rules, pending client confirmation.

The user's follow-up leaves Render/Vercel deployment and connection to the owner. The Docker build and tests have passed in Linux CI; configuration and a successful image build are not reported as a live deployment. See HANDOVER.md for delivered behavior, verification evidence and remaining work.

## References

Provider migrations: https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/providers
Render port binding: https://render.com/docs/web-services#port-binding
