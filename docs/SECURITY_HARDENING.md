# Security hardening

## Database boundary

The deployed Supabase database is frozen. This work intentionally does not modify the database schema, migrations, RLS policies, functions, triggers, grants, or generated `types/database.ts`.

## Anonymous incident submission

Public incident creation remains anonymous and does not require an account or reporter profile.

The application uses the existing `create_anonymous_incident` RPC as the sole incident-creation path. The API does not bypass the frozen database contract with a service-role direct insert.

The HTTP boundary also rejects non-JSON requests and oversized request bodies before database access.

## Moderation

Admin status changes continue to require an active staff session and are delegated to the existing database moderation RPC. Database-side workflow rules remain the source of truth.

## Rate limiting

A distributed rate limiter is intentionally not implemented with process-local memory. Vercel serverless instances do not provide a reliable shared counter, and adding a persistent rate-limit store would introduce a new infrastructure dependency. Abuse protection should be added through a supported edge/rate-limit service in a separate application-layer change when the deployment configuration is ready.
