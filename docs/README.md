# RukheDao documentation

This directory contains the project-specific documentation for RukheDao.

## Start here

- [Project overview](PROJECT.md) — purpose, scope, and current product boundaries
- [Architecture](ARCHITECTURE.md) — how the web app, APIs, database, and moderation boundary fit together
- [Reporting workflow](REPORTING.md) — anonymous submission and publication lifecycle
- [Moderation](MODERATION.md) — staff review, status transitions, verification, revisions, and reports
- [Privacy model](PRIVACY.md) — anonymity boundaries and information the application is designed not to collect for public reporting
- [Database contract](DATABASE.md) — the frozen Supabase/PostgreSQL schema and security contract
- [Testing](TESTING.md) — local and CI verification used by the repository
- [Deployment](DEPLOYMENT.md) — production deployment and verification expectations
- [Security hardening](SECURITY_HARDENING.md) — implementation-level security boundaries and hardening notes

## Documentation rules

These documents describe the implementation that exists in this repository. They are not a roadmap or a specification for unimplemented features.

When code changes, update the relevant documentation in the same change when behavior, interfaces, security boundaries, or contributor workflows are affected.

For security vulnerabilities, follow the reporting process in the repository's root [SECURITY.md](../SECURITY.md) rather than opening a public issue.