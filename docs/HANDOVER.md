# TGA implementation handover

## Delivery and ownership

The client POC works independently of the backend. The ASP.NET Core backend is separately buildable and has an HTTP frontend adapter. The owner will create/connect Render and Vercel services. Work is delivered on `main`, preserving the newer official-logo and deployment-hardening changes.

This handover describes the implemented sandbox and the production work still outstanding. It does not claim a live deployment, production security certification or finished production integrations.

## Demonstration data and access

Use [DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md) for the nine public logins and a step-by-step client walkthrough. The seed contains:

- 50 fictional members, including pending, active, expiring, expired and suspended scenarios.
- Two illustrative annual plans (R450 and R750), with no demo joining fee.
- 64 sample document records across five optional document types.
- Two non-accredited portal-learning assessments and 24 seeded results.
- 40 mock payment records, including successful, failed and pending examples.
- Notification records and an activity log.

The browser seed is `TGA_Member_Portal_Source/tga-portal-prototype/src/demo-api.js`. The readable backend seed is `src/Tga.Infrastructure/Persistence/Seeds/demo.json`. Regenerate the JSON after deliberately changing browser fixtures with:

```sh
npm --prefix TGA_Member_Portal_Source/tga-portal-prototype run seed:export
```

Browser records are isolated by browser and origin. Switch member/staff accounts in the same browser to demonstrate their shared workflow. A backend deployment shares its SQLite records across clients.

## Implemented architecture

| Project | Responsibility |
|---|---|
| Tga.Domain | Entities, annual membership rules, document validation, assessment scoring and role/policy constants |
| Tga.Application | Request/response DTOs and service/provider contracts |
| Tga.Infrastructure | Identity persistence, EF Core contexts/migrations, JSON seeder, workflow services, demo file storage and notification outbox |
| Tga.Api | REST controllers, authentication, authorization, ProblemDetails, CORS, correlation IDs, rate limiting, health and Swagger |

Important interfaces include `IMembershipService`, `IAssessmentService`, `IPaymentService`, `IPaymentGateway`, `IDocumentStorageService`, `IFileSecurityScanner`, `IEmailService`, `ISmsService`, `INotificationService`, `IAuditService`, `ICurrentUserService`, and `IMembershipNumberGenerator`. Backend workflows use injected `TimeProvider` and EF transactions/concurrency tokens.

The backend is a modular monolith. SQLite is a local file, not a separately provisioned database service. SQL Server uses the same business logic and its own EF migration set.

## Screens and workflows

The public pages and visual system are retained. Operational screens consume the selected service adapter rather than independent hardcoded counters:

- Login and remembered email; member/staff sessions and role-specific navigation.
- Member overview, annual membership status and upcoming renewal.
- Profile edits and registration/application creation.
- Document submission, status, review notes and downloads.
- Assessment attempts, results, configurable demo rules and non-accredited demo participation downloads.
- Mock checkout success/failure/cancellation, history, receipts and finance refunds.
- Administrator dashboard, member search/filtering and membership decisions.
- Document review queue, assessment result review, payments, notifications and activity log.
- Local support ticket simulation and browser demo reset.

Browser mode stores document **metadata only** and generates a clearly labelled sample download. API mode uploads sample bytes to private backend storage and authorizes downloads. Its scanner is a labelled demo no-op. Browser role checks are demonstrations; API permissions and ownership checks are enforced server-side.

## Database entities and relationships

Identity uses the standard ASP.NET Identity user, role, user-role, claim, login and token tables. Additional entities are:

| Entity | Principal relationship / purpose |
|---|---|
| MemberProfile | One per Identity user; unique membership number |
| MembershipPlan | Referenced by memberships and applications |
| Membership | One per member; plan and optional last payment |
| MembershipApplication | Member and selected plan; review outcome |
| MembershipStatusHistory | Append-only membership transitions |
| DocumentType | Configurable optional sample types and restrictions |
| MemberDocument | Member, type and private storage metadata |
| DocumentReviewHistory | Document decisions and review notes |
| Assessment | Definition, rules and question collection |
| Question | Assessment question |
| QuestionOption | Question options and server-side answer key |
| AssessmentAttempt | Member and assessment; immutable question/rule snapshot |
| AssessmentAnswer | Attempt and question; selected options and awarded points |
| Certificate | Member and attempt; model for future issuance workflow |
| PaymentTransaction | Member and optional membership; decimal amount and provider reference |
| PaymentWebhookEvent | Unique provider/event reference for idempotency |
| Refund | Payment and approval/completion information |
| NotificationTemplate | Template key and demo content |
| NotificationLog | Recipient user, channel, provider and outcome |
| OutboxMessage | Recipient and pending notification event |
| OtpChallenge | User, hashed code, expiry and attempt counters; model only |
| AuditEvent | Actor, action, entity, timestamp and correlation ID |
| PolicyDocument | Versioned placeholder policy content |
| UserPolicyAcceptance | User acceptance of a policy version |
| RefreshSession | User, hashed rotating token, family and revocation |
| SupportRequest | User and local sandbox support request |

EF migrations contain the exact table names, keys, indexes and foreign keys. Read-only endpoints project DTOs rather than returning tracked entities.

## API surface

Swagger at `/swagger` is the authoritative request/response reference for the running sandbox.

| Group | Implemented routes |
|---|---|
| Health | `GET /health`, `GET /health/ready` |
| Authentication | `POST /api/auth/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password`, `/verify-email`; `GET /api/auth/me` |
| Admin demo recovery | `POST /api/auth/demo-account-token/{userId}`; system administrator, Demo mode only |
| Public configuration | `GET /api/membership-plans`, `GET /api/policies` |
| Member | `GET/PATCH /api/me/profile`; `GET /api/me/membership`, `/payments`, `/documents`, `/assessments`, `/membership-history` |
| Documents | `GET /api/documents/types`; `POST /api/documents`; `GET/DELETE /api/documents/{id}`; `GET /api/documents/{id}/download` |
| Assessments | `GET /api/assessments`, `GET /api/assessments/{id}`, `POST /api/assessments/{id}/attempts` |
| Attempts | `PUT /api/assessment-attempts/{id}/answers`; `POST .../{id}/submit`; `GET .../{id}/result` |
| Payments | `POST /api/payments/checkout`, `POST /api/payments/{id}/mock-complete`, `POST /api/payments/{id}/cancel` |
| PayFast | `/api/payments/payfast/itn` explicitly returns unavailable; no live webhook processing |
| Notifications/support | `GET /api/notifications`; `POST /api/support` |
| Admin members | `GET /api/admin/members`, `GET .../members/{id}`, `GET .../membership-history`; `PATCH .../memberships/{id}`; `POST .../memberships/{id}/approve`, `/reject`, `/suspend` |
| Admin documents | `GET /api/admin/documents/pending`; `POST .../documents/{id}/approve`, `/reject` |
| Admin assessments | `POST /api/admin/assessments`; `PATCH .../assessments/{id}`; `POST .../assessments/{id}/questions`; `PATCH .../questions/{id}`; `GET .../assessment-results` |
| Admin finance | `GET /api/admin/payments`; `POST .../payments/{id}/refund` |
| Reporting | `GET /api/admin/dashboard`, `/audit`, `/notifications`, `/reports/members.csv` |

Large admin list endpoints have bounded pagination. The current API frontend adapter fetches the first 100 records, sufficient for the seeded demo; full UI pagination is a production follow-up. There is no destructive server database-reset endpoint. New server databases seed automatically.

## Verification

The verified CI run for commit `f8ae1da` is [GitHub Actions run 34260680079](https://github.com/MrMoneyDeveloper/TGA_Member_Portal_Source/actions/runs/34260680079).

| Check | Result |
|---|---|
| Frontend workflow tests | 23 passed |
| Browser scenarios | 5 passed; public routes, member workflows, admin/staff, registration and mobile |
| Backend unit tests | 24 passed |
| Backend integration tests | 13 passed against migrated temporary SQLite |
| SQLite migration consistency | Passed |
| SQL Server migration consistency | Passed |
| Docker image build | Passed in Linux CI |

The current local frontend build and 23 workflow tests also pass; the .NET solution builds with zero warnings/errors. A later local integration-test attempt was blocked by Windows Application Control (`0x800711C7`) before loading the test assembly; no security policy was changed. CI provides the successful integration/Docker evidence. Docker is not installed on this local machine.

The current npm install reports four high-severity advisories in the development dependency tree. They are not a production-security clearance; review/update the affected tooling before a production release. SQL Server live migration execution and a deployed Render/Vercel end-to-end smoke test remain unverified. The existing browser suite exercises standalone mode; API integration tests exercise the backend separately.

## Deployment and environment handover

Follow [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) and [.env.example](../.env.example).

1. Vercel: repository root, `npm run build`, output `TGA_Member_Portal_Source/tga-portal-prototype/dist/client`, start in `demo` mode.
2. Render: root Dockerfile / `render.yaml`; Sandbox environment; Demo SQLite; Mock payments; generated `Jwt__Key`; exact allowed frontend origin.
3. Verify API `/health/ready` and `/swagger`.
4. Vercel: change to `TGA_FRONTEND_DATA_MODE=api`, set `VITE_API_BASE_URL`, rebuild.
5. Run the documented client smoke test in both member and staff roles.

Sandbox access tokens default to 120 minutes; Development defaults to 10. Refresh cookies are Secure/HttpOnly in Sandbox and rotated. Cross-site cookie blocking may affect session restoration; use sibling custom domains for a stable long-term configuration. Tokens are not stored in localStorage.

Real URL fields are intentionally not invented: frontend = the owner's Vercel URL, API = the owner's Render URL, readiness = API URL + `/health/ready`.

## Reset and troubleshooting

- **Browser POC reset:** Administrator → Demo controls → Reset demo records.
- **API reset:** stop the API; back up any wanted demo data, replace only its configured disposable SQLite data and demo upload directory, then restart. Do not use this procedure with production data.
- **API build fails:** confirm .NET 10 SDK and restore packages.
- **Frontend API build fails:** supply a full `http(s)` API URL before building.
- **API will not start in Sandbox:** verify signing key, valid Demo/SqlServer mode and provider configuration.
- **Login works but refresh fails:** check exact CORS origin, HTTPS and browser third-party cookie settings.
- **Demo seed overrides have no effect:** overrides only apply to an empty database.
- **Render resets records:** ephemeral storage is expected; use paid persistent storage or a durable database for continuity.
- **No backend link:** the frontend defaults to its working standalone demo; this is deliberate.

## Remaining production work

- Replace local demo files/no-op scanner with private durable object storage and malware scanning.
- Implement and verify real PayFast checkout, signature/merchant/amount verification, ITN replay protection, reconciliation and refund policy. Current payments are Mock only.
- Connect transactional email and SMS providers. Recovery requests currently record simulated notifications; admin-issued demo tokens allow testing Identity reset/verification mechanics. OTP has a data model, not a delivered OTP service.
- Complete server-issued certificate workflows; current downloadable participation records are demo/non-accredited.
- Validate SQL Server migrations against a real server; provision secrets, backups, monitoring and recovery procedures.
- Review email verification enforcement, staff MFA, session lifetimes, rate-limit deployment behavior, retention and sensitive-data protection.
- Add full UI pagination, broader reporting/CSV exports and reviewed scheduled reminder/expiry processing. The notification outbox is lightweight and needs production retry/concurrency hardening.
- Finalize membership transitions and renewal/refund rules. Some browser demo transitions are broader than the current API service; only backend-permitted transitions should be used in connected demonstrations.
- Replace placeholder legal/POPIA text and confirm prices, document requirements, assessment rules, accreditation and all items in [OPEN_BUSINESS_DECISIONS.md](OPEN_BUSINESS_DECISIONS.md).
- Complete an API-connected browser walkthrough on the actual hosting domains before client use in API mode.

The Production environment is intentionally blocked while sandbox providers remain. Enabling production requires completing and reviewing these items, not merely changing an environment variable.
