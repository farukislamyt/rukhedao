# RukheDao (রুখে দাও)

RukheDao is a Bengali-focused, privacy-first public-interest incident-reporting web application. People can submit incident information anonymously, while publication remains behind an existing staff moderation workflow.

> **Project status:** The application is complete. The repository is open for maintenance, security, testing, accessibility, documentation, compatibility, and other focused improvements. Product development should not be assumed to be open unless maintainers explicitly reopen it.

## What RukheDao does

- Lets the public read published incidents.
- Accepts incident submissions without a public reporter account.
- Uses controlled categories and Bangladesh division/district reference data.
- Routes submissions through staff moderation before publication.
- Maintains incident revisions and moderation history.
- Supports public reports about incident content.
- Separates verification state from moderation status.

### Submission is not publication

A successful anonymous submission starts in the moderation lifecycle. It does **not** automatically make an incident public.

```text
Anonymous submission
        ↓
     pending
        ↓
   under_review
      ↙      ↘
needs_revision  approved
    ↓             ↓
under_review   publication
    │
    └──→ rejected
```

See [Reporting](docs/REPORTING.md) and [Moderation](docs/MODERATION.md) for the implemented workflow.

## Privacy and security model

The public reporting model is intentionally anonymous. The frozen application database does not define a public reporter identity system or reporter identity fields such as user ID, email, phone number, IP address, device identifier, fingerprint, or tracking identifier.

This is an application and database design boundary, not a claim of absolute or untraceable anonymity against every external infrastructure or network observation.

See [Privacy](docs/PRIVACY.md) and [Security](SECURITY.md).

## Frozen database contract

The deployed Supabase/PostgreSQL database is a **frozen contract**. Contributors must not:

- add or remove core tables;
- rename or repurpose core tables;
- change columns, constraints, relationships, functions, triggers, RLS policies, or grants;
- introduce a second database contract;
- add a public reporter identity model.

The application must adapt to the existing database contract. See [Database](docs/DATABASE.md).

## Technology

- Next.js 16
- React 19
- TypeScript
- Supabase / PostgreSQL
- Tailwind CSS
- Playwright
- GitHub Actions
- Vercel

## Local development

Requirements: Node.js and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the local URL shown by Next.js. Do not place production secrets in `.env.local` or commit them.

## Verification

Before submitting a change, run the checks relevant to the work:

```bash
npm run lint
npm run test:unit
npm run build
```

GitHub Actions also runs type checking, linting, unit tests, and the production build for pushes and pull requests targeting `main`.

Read-only Playwright E2E verification is available through the repository's manually triggered E2E workflow.

See [Testing](docs/TESTING.md).

## Contributing

Contributions are welcome when they preserve RukheDao's existing boundaries and are clearly scoped.

Good contribution areas include:

- bug fixes and compatibility maintenance;
- security improvements;
- accessibility improvements;
- tests and verification;
- documentation improvements;
- reliability and developer-experience improvements.

Start with [CONTRIBUTING.md](CONTRIBUTING.md), then read the relevant project documentation before changing a sensitive workflow.

## Documentation

- [Documentation index](docs/README.md)
- [Project overview](docs/PROJECT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Reporting workflow](docs/REPORTING.md)
- [Moderation](docs/MODERATION.md)
- [Privacy model](docs/PRIVACY.md)
- [Database contract](docs/DATABASE.md)
- [Testing](docs/TESTING.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Security hardening](docs/SECURITY_HARDENING.md)

Repository policies:

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security](SECURITY.md)
- [License](LICENSE)

## License

RukheDao is released under the [MIT License](LICENSE).