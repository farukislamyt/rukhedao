# Project overview

## What RukheDao is

RukheDao (রুখে দাও) is a Bengali-focused public-interest incident-reporting web application. It provides a public surface for submitting incident information without creating a public reporter account, while keeping publication behind an existing moderation workflow.

The project is intentionally privacy-first: the public reporting model is anonymous, and the application database does not define a public reporter identity system.

## What the application provides

- Public Bengali incident discovery and reading surfaces
- Anonymous public incident submission
- Controlled incident categorization and Bangladesh division/district reference data
- Staff-only administration and moderation
- Incident revisions and moderation history
- Public reporting of concerns about published incidents
- Verification state management for incidents

## Core boundary

Submitting an incident does not make it public. A submission enters the moderation lifecycle first. Publication is a separate state controlled by the existing database workflow and authorized staff operations.

## Database contract

The production Supabase/PostgreSQL database is a frozen application contract. Contributors must adapt application code to that contract rather than changing the schema, migrations, RLS policies, functions, triggers, grants, or core relationships.

See [DATABASE.md](DATABASE.md) for the authoritative project rules.

## Current scope

RukheDao is treated as a completed application for this documentation phase. Future open-source work should focus on maintenance, security, testing, accessibility, documentation, compatibility, and other clearly scoped improvements unless project maintainers explicitly reopen product development.

## Technology

- Next.js 16
- React 19
- TypeScript
- Supabase / PostgreSQL
- Tailwind CSS
- Playwright for end-to-end verification
- GitHub Actions for repository quality checks
- Vercel for production hosting

## Repository map

```text
app/           Next.js routes, public pages, APIs, and admin pages
components/    Shared UI components
features/      Feature-level application logic
lib/           Shared server/client utilities and workflow logic
types/         TypeScript and database types
supabase/      Frozen database baseline and related SQL
tests/         Unit/security and end-to-end tests
docs/          Project documentation
.github/       GitHub Actions workflows
```

## For contributors

Read [CONTRIBUTING.md](../CONTRIBUTING.md) first. The most important project-specific constraint is that the database contract is frozen. Contributions should be focused, preserve the anonymous reporting model, and include appropriate verification.