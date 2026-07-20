# TGA Production Architecture Draft

## Domain modules

### Identity and access
- Member, reviewer, finance, support, administrator, and super-administrator roles
- Email verification, password reset, MFA for privileged roles, session controls
- Explicit permissions for viewing and changing sensitive records

### Member CRM
- Personal and contact information
- Membership tier, status, start/renewal/expiry dates
- Application checklist and lifecycle history
- Notes, assignments, communication preferences, and consent

### Assessments
- Versioned tests and question banks
- Assigned tests, time windows, pass criteria, attempts, scoring, and reviewer overrides
- Immutable result snapshot so later question edits do not change historical results

### Documents
- Configurable document types and expiry rules
- Private upload, content validation, malware scanning, review notes, approval/rejection, and replacement history
- Signed URLs and complete access logs

### Payments
- PayFast checkout request created by the server
- Unique internal payment reference
- Signature and amount verification
- Instant Transaction Notification endpoint
- Idempotent status updates, receipts, refunds, renewal links, and reconciliation

### Chatbot and consulting
- Answers drawn only from approved TGA content
- Clear distinction between general portal help and professional advice
- Human escalation, conversation retention controls, and admin knowledge-base management

## Recommended data entities

- users
- roles and permissions
- member_profiles
- memberships
- membership_status_history
- applications
- application_tasks
- document_types
- member_documents
- document_reviews
- assessments
- assessment_versions
- questions and answer_options
- assessment_assignments
- assessment_attempts and responses
- payments and payment_events
- receipts
- support_conversations
- consulting_requests
- notifications
- audit_events

## Security boundaries

The browser must never hold database credentials, PayFast passphrases, AI API keys, or permanent object-storage credentials. All privileged operations must be authorised and performed server-side.
