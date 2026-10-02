# TGA Member Platform

Client demonstration of The Gun Association member and administration platform. The existing public website, visual design and navigation are retained. The repository supports two data modes:

| Mode | What runs | Persistence |
|---|---|---|
| `demo` (default) | Static frontend only; public demo logins and simulated workflows | Browser localStorage; each browser/site address has its own records |
| `api` | The same frontend connected to ASP.NET Core | SQLite file and private sample files on the API host |

**Start with the standalone frontend for client presentations.** Deploy and connect the API when ready. This is a fictional sandbox, not a production member service. No real payments, accredited certification or SAPS integration are provided.

## Start here

- [Developer and client handover](docs/HANDOVER.md)
- [All demo logins and walkthrough](docs/DEMO_ACCOUNTS.md)
- [Render and Vercel deployment](docs/RENDER_DEPLOYMENT.md)
- [Architecture and original repository audit](docs/BACKEND_ARCHITECTURE.md)
- [Unresolved business decisions](docs/OPEN_BUSINESS_DECISIONS.md)
- [Environment variable reference](.env.example)

## Prerequisites

- Node.js 24 and npm for the frontend (the CI uses Node 24).
- .NET 10 SDK for the optional API and backend tests.
- Docker only if building/running the backend container locally.
- No database server, merchant account, email provider or SMS account is required for the sandbox.

## Run the standalone frontend

From the repository root:

```sh
npm ci
npm run build
npm run dev
```

Open **http://127.0.0.1:5173**. The build installs the nested frontend dependencies. `npm run dev` builds and starts the local static preview.

Example public demo credentials:

| Role | Email | Password |
|---|---|---|
| Active member | `member@tga.co.za` | `demo123` |
| System administrator | `admin@tga.co.za` | `admin123` |

The [login register](docs/DEMO_ACCOUNTS.md) contains all nine accounts, including pending and expired members, membership administration, document verification, finance, assessment administration and support. These values are deliberately public POC fixtures, not secrets. Do not reuse them for real accounts.

Client journeys include profile edits, application creation/review, sample document metadata/review, assessments and results, simulated payment success/failure/cancellation, receipts, refunds, notifications and an activity log. Administrator **Demo controls** restores the original browser fixtures. No real member information should be entered.

## Run the API

```sh
dotnet restore Tga.slnx
dotnet run --project src/Tga.Api --launch-profile http
```

The launch profile selects Development and **http://localhost:5179**. A new SQLite database is migrated and seeded automatically. Private sample files are stored under the API's `data/documents` directory. Development creates a temporary signing key if none is supplied; a restart then invalidates existing access tokens.

- Process health: `http://localhost:5179/health`
- Database readiness: `http://localhost:5179/health/ready`
- API documentation: `http://localhost:5179/swagger`

The JSON fixtures are readable at [`src/Tga.Infrastructure/Persistence/Seeds/demo.json`](src/Tga.Infrastructure/Persistence/Seeds/demo.json). Default seeded logins match the public demo register. Optional `DemoAdmin__Email`, `DemoAdmin__Password` and `DemoMember__Password` overrides apply on initial seeding only; do not supply blank overrides.

## Connect the frontend locally

Leave the API running, then in a separate PowerShell terminal at the repository root:

```powershell
$env:TGA_FRONTEND_DATA_MODE = 'api'
$env:VITE_API_BASE_URL = 'http://localhost:5179'
npm run dev
```

Use **http://localhost:5173** for the frontend in this configuration so the development cookies stay on the same hostname. Both local frontend origins are allowed by default. For another origin, configure `AllowedOrigins__0` on the API.

To return to standalone mode, set `TGA_FRONTEND_DATA_MODE=demo` and rebuild. Frontend values are build-time settings. `.env.example` is documentation; these scripts do **not** automatically load `.env` files. Set variables in the shell or hosting dashboard.

## Tests and builds

```sh
npm test
npm run test:browser
dotnet test Tga.slnx --configuration Release
dotnet build Tga.slnx --configuration Release
```

Browser tests require a built frontend. Locally they use installed Microsoft Edge. To use downloaded Chromium:

```sh
cd TGA_Member_Portal_Source/tga-portal-prototype
npx playwright install chromium
```

Set `PLAYWRIGHT_CHANNEL=chromium` before running browser tests. CI installs Chromium and its system dependencies automatically.

The [CI workflow](.github/workflows/ci.yml) runs 23 frontend workflow tests, 5 browser scenarios, 24 backend unit tests, 13 integration tests, both EF migration consistency checks, and a Docker build. See the [handover](docs/HANDOVER.md#verification) for verified results and environment limitations.

## Database migrations

SQLite and SQL Server have separate migration sets against the same domain and business services:

```sh
dotnet tool restore
dotnet ef migrations has-pending-model-changes --project src/Tga.Infrastructure --startup-project src/Tga.Api --context DemoDbContext
dotnet ef migrations has-pending-model-changes --project src/Tga.Infrastructure --startup-project src/Tga.Api --context SqlServerDbContext
```

After a model change, create a migration for **each** context using the corresponding output directory under `Persistence/Migrations`. SQL Server configuration uses `TGA_DATA_MODE=SqlServer` and `ConnectionStrings__SqlServer`; apply its migrations explicitly:

```sh
dotnet ef database update --project src/Tga.Infrastructure --startup-project src/Tga.Api --context SqlServerDbContext
```

SQL Server runtime/migration execution against a real server is still a deployment validation task. The application intentionally refuses the Production environment until production providers and security requirements are implemented and reviewed.

## Deploy

- **Vercel:** import the repository with its root as the project root. `vercel.json` defines the build, static output and SPA fallback. Start with `TGA_FRONTEND_DATA_MODE=demo`.
- **Render:** create a Blueprint from `render.yaml`, or use the root multi-stage Dockerfile. Set the exact Vercel origin for CORS and a generated signing key. The API respects Render's `PORT`.
- **Connect:** set Vercel's `TGA_FRONTEND_DATA_MODE=api` and `VITE_API_BASE_URL` to the Render URL, then rebuild.

Full environment settings, cookie considerations and smoke tests are in [RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md). Hosting is to be connected by the owner; no live Render/Vercel deployment is claimed here.

For a local container, set a fresh `Jwt__Key` in your shell first:

```sh
docker build -t tga-api-sandbox .
docker run --rm -p 8080:8080 -e Jwt__Key -e AllowedOrigins__0=http://localhost:5173 tga-api-sandbox
```

Sandbox cookies require HTTPS; use the Development launch profile for ordinary local HTTP browser testing. Render's default filesystem is disposable; do not rely on SQLite or uploaded samples surviving a restart/redeploy.

## Repository layout

```text
TGA_Member_Portal_Source/tga-portal-prototype/  Existing esbuild/JavaScript frontend
src/Tga.Api/                                 Controllers, middleware, authentication
src/Tga.Domain/                              Entities and domain rules
src/Tga.Application/                         Contracts, DTOs and provider interfaces
src/Tga.Infrastructure/                      EF Core, seeding, storage and services
tests/Tga.UnitTests/                         Domain and policy tests
tests/Tga.IntegrationTests/                  WebApplicationFactory + SQLite tests
docs/                                       Handover, architecture and deployment
```

The original Cloudflare configuration is retained. `npm run deploy` still targets Cloudflare, **not** Vercel or Render. The current official logo assets are retained in the frontend public directory.
