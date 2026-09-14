# Security hardening

This document records security-sensitive implementation boundaries that contributors should preserve.

## Database boundary

The deployed Supabase database is frozen. Application changes must not modify the database schema, migrations, RLS policies, functions, triggers, grants, or generated database types as a shortcut for implementing application behavior.

## Anonymous incident submission

Public incident creation does not require a public account or reporter profile.

The submission API:

- applies a per-client-IP application-layer rate limit;
- requires `application/json`;
- enforces a 16 KiB request-body limit;
- validates incident fields and prevents future incident dates;
- validates category, division, and district references through public-safe database views;
- uses the configured server-side service-role path when available;
- otherwise preserves the existing `create_anonymous_incident` RPC path.

The service-role credential is server-side only and must never be exposed to the browser or committed to the repository.

When a server-side insert does not return normally, the API verifies the generated opaque public ID before asking the reporter to retry. This protects against duplicate writes when a database response is lost after commit.

## Reporter privacy boundary

The frozen application database does not model a public reporter identity. Contributors must not add reporter accounts, reporter identity fields, or tracking identifiers to the reporting workflow without an explicit architectural change.

Application-level anonymity should not be described as absolute or untraceable; deployment and network infrastructure can have independent logging and observability behavior.

## Moderation

Staff status and moderation operations require the existing authenticated staff boundary. Database-side workflow rules remain the source of truth for permitted state changes and publication consistency.

## Rate limiting

The submission endpoint currently applies a process-local rate limit keyed by the client IP. This is useful as an application-layer abuse-control boundary, but it is not a globally shared distributed limiter across all Vercel instances. A future distributed limiter would be a separate infrastructure change and must not require changing the frozen database contract.
