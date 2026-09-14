# Architecture

RukheDao is a Next.js application whose public reporting surface and staff administration are separated by application and database authorization boundaries.

## High-level flow

```text
Public visitor
    │
    ├── Read public incidents
    │
    └── Submit incident anonymously
              │
              ▼
        Next.js application/API
              │
              ▼
   Existing database workflow/RPCs
              │
              ▼
       Pending incident record
              │
              ▼
       Staff moderation boundary
              │
        ┌─────┴─────────┐
        │               │
     revise/reject   approve
        │               │
        └──────┐   ┌────┘
               ▼   ▼
          incident state
               │
               ▼
        Public publication
```

## Application layers

### Public application

The `app/` routes provide the public-facing pages, including incident discovery and the anonymous submission experience. Public users do not receive staff administration privileges.

### API boundary

API routes validate incoming requests and delegate persistence or moderation to the existing application/database contract. The anonymous incident path uses the project's existing database workflow rather than introducing a second schema or persistence model.

### Staff administration

The `app/admin/` area contains staff-facing pages for administration, incidents, reports, verification, categories, analytics, activity, and staff management. Staff actions require the project's authenticated staff boundary.

### Database

Supabase/PostgreSQL is the source of truth for the incident lifecycle, authorization rules, reference data, revisions, reports, and moderation actions. The application must not create a parallel database contract.

## Data boundaries

The architecture deliberately separates:

1. **Submission** — a public visitor provides incident information without a public account.
2. **Moderation** — authorized staff review and act on the incident.
3. **Publication** — an approved incident can enter the public incident surface according to the existing database rules.

This separation is a core architectural property, not merely a UI convention.

## Database contract

The frozen application schema contains eight core tables:

- `categories`
- `divisions`
- `districts`
- `admin_users`
- `incidents`
- `incident_revisions`
- `incident_reports`
- `moderation_actions`

The database also contains PostgreSQL enums, functions, triggers, RLS policies, grants, and public-safe views that form part of the deployed contract. See [DATABASE.md](DATABASE.md).

## Deployment architecture

The production web application is hosted on Vercel. Repository quality checks run through GitHub Actions. The deployment environment supplies the required runtime configuration; secrets are never part of the repository documentation or source tree.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the operational deployment boundary.