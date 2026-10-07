# TGA Member Portal — Dependencies and Configuration

Companion to [HANDOVER.md](HANDOVER.md). Based on repository documentation and configuration/source inspected on 7 October 2026; the live deployment must be reconciled before sign-off. Package manifests and lockfiles remain authoritative for exact transitive versions; this is the operational dependency list, not a frozen software bill of materials.

| Dependency | Required setup / configuration | Source or handover action |
| --- | --- | --- |
| Build/runtime | Node.js 24/npm; optional .NET 10 SDK/API; Docker if using container deployment | package.json/lockfiles; src/*.csproj; docs/HANDOVER.md |
| Frontend config | TGA_FRONTEND_DATA_MODE; VITE_API_BASE_URL; DEMO_MODE; PUBLIC_INDEX | Build-time public settings; rebuild after changes. |
| API auth/origins | Jwt__Key; AllowedOrigins__0; Jwt__AccessTokenMinutes | Server environment; generate a fresh signing secret and plan token/session invalidation. |
| Storage | SQLite ConnectionStrings__Demo and Storage__Path; optional future SQL Server connection | Back up database and private files together; free Render disk is ephemeral. |
| Sandbox accounts | Optional DemoAdmin__Email/Password and DemoMember__Password overrides | Initial seeding only. Changing environment variables does not update existing seeded accounts. |
| Future providers | Real payment, email, SMS and other production integrations are not configured | No claim of existing merchant credentials or OAuth clients. Provision and document them only when implemented. |

## API and OAuth completion requirements

For **every enabled API/OAuth integration**, record its accountable owner, provider/project, credential name, scopes, secret-store location, endpoint/redirect URI, expiry/renewal behavior and dependent consumers in the private operations register. Rotate/reissue all applicable keys, client secrets, tokens, grants and deployment credentials; configure each consumer; test the new identity; then revoke the superseded credentials. See the ordered procedure in [HANDOVER.md](HANDOVER.md).

Never put secret values in this file. If the live environment has additional integrations, add their non-secret dependency details before handover sign-off. Items absent from inspected source are unverified, not automatically unnecessary. This documentation update does not perform credential rotation or modify runtime settings.
