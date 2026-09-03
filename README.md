# RukheDao

RukheDao is a Bengali-only public incident-reporting web application. Visitors can submit incidents anonymously; submitted incidents enter the existing moderation workflow before they become publicly visible.

## Project status

The public-facing application, anonymous incident submission flow, and administrative moderation area are implemented. All application routes are served without a language prefix.

## Core principles

- **Bengali-only interface:** the application uses Bengali as its sole interface language.
- **Anonymous reporting:** public incident submission does not require a reporter account.
- **Moderation before publication:** a successful submission is not automatically public.
- **Frozen database:** the deployed database is a fixed contract. Application code must adapt to it.
- **Privacy and least privilege:** public users must not receive administrative access or database write privileges beyond the existing controlled submission path.

## Frozen database rule

**Do not modify the database.**

Do not create Supabase migrations or alter existing tables, columns, constraints, functions, triggers, views, RLS policies, or permissions. Do not add application tables as a workaround for an application-layer issue.

Read [`docs/DATABASE.md`](docs/DATABASE.md) before changing database-facing code.

## Technology

- Next.js 16
- TypeScript
- React
- Supabase / PostgreSQL
- next-intl (static Bengali message provider)
- Vercel

## Repository structure

```text
app/          Next.js routes and pages
components/   Reusable UI components
features/     Feature-specific application logic
lib/          Shared clients and utilities
types/        TypeScript/database types
supabase/     Existing database definitions

docs/         Project and engineering documentation
```

## Local development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Create local environment variables from `.env.example`. Never commit production secrets or a Supabase service-role key.

## Build verification

Before opening a pull request, run:

```bash
npm run build
```

Fix TypeScript and build errors before merging.

## Incident workflow

```text
Anonymous visitor
      ↓
Incident submission
      ↓
Pending
      ↓
Admin / moderation review
      ↓
Existing approval/publication rules
      ↓
Public incident
```

The public application must never treat submission success as equivalent to publication.

## Documentation

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — contribution and development rules
- [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) — community standards
- [`SECURITY.md`](SECURITY.md) — security policy and vulnerability reporting
- [`docs/DATABASE.md`](docs/DATABASE.md) — frozen database contract

Additional architecture, workflow, deployment, QA, API, and admin documentation should be added as those project areas become stable.

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE).
