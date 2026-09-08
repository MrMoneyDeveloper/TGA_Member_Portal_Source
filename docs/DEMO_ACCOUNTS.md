# Public client POC login register

These hardcoded accounts are fictional and deliberately public. Never reuse these passwords for production.

| Scenario / role | Email | Password |
|---|---|---|
| Active member with upcoming renewal | member@tga.co.za | demo123 |
| Pending application | pending@tga.example | demo123 |
| Expired membership | expired@tga.example | demo123 |
| System administrator | admin@tga.co.za | admin123 |
| Membership administrator | membership@tga.example | demo123 |
| Document verifier | verifier@tga.example | demo123 |
| Finance user | finance@tga.example | demo123 |
| Assessment administrator | assessor@tga.example | demo123 |
| Support agent | support@tga.example | demo123 |

New frontend demo applications receive the entered fictional email and `demo123`. The login screen and administrator **Demo controls** show the seeded account register.

Source of truth: `TGA_Member_Portal_Source/tga-portal-prototype/src/demo-api.js`, `DEMO_ACCOUNTS` and `seedDemo`. The backend has a readable JSON seed fixture derived from the same source.

## Repeatable walkthrough

1. Sign in as the active member; update a fictional profile field.
2. Submit a sample PDF/JPG/PNG. Only metadata is retained in browser mode.
3. Complete Demo Portal Foundation. Correct demo choices are 2, 2, 2, 1, 2. Results are non-accredited.
4. Simulate failed payment, retry, and simulate success. Check receipt and renewal date.
5. Sign out and use the administrator login in the same browser.
6. Search Megan, open her record, approve/reject with a reason.
7. Review a pending document with a note.
8. Inspect payments, results, notifications and Activity log.
9. Use Finance to simulate a refund; use Assessor to adjust demo rules.
10. Use Administrator → Demo controls → Reset demo records to repeat.

Browser mode stores records under `tga-poc-v2` in localStorage and the selected account under `tga-poc-session-v2` in sessionStorage. Changes persist across reloads and sign-outs in that browser/origin. Different browsers/devices have separate copies. Browser role checks are demonstrative, not a security boundary. No real personal information, bank details, identity files or credentials should be entered.
