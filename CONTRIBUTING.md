# Contributing to RukheDao

Thank you for helping improve RukheDao.

RukheDao is an open-source Bengali-focused public-interest reporting application. The product application is treated as complete; contributions should therefore be focused and compatible with the existing architecture unless maintainers explicitly reopen product development.

## Good contribution areas

Contributions are welcome in areas such as:

- bug fixes and compatibility maintenance;
- security hardening;
- accessibility;
- tests and verification;
- documentation;
- reliability and developer experience;
- maintenance of the existing Bengali public experience.

Before starting a larger change, open or comment on an issue so the scope can be agreed first.

## Important project constraints

### The database is frozen

The production Supabase/PostgreSQL database is a frozen contract. Do not:

- add or remove core tables;
- rename or repurpose tables;
- add migrations for ordinary application work;
- change columns, constraints, relationships, functions, triggers, RLS policies, or grants;
- introduce a second database contract;
- add a public reporter identity system.

When an application requirement conflicts with the frozen contract, stop and discuss the architectural implication rather than changing the database as a workaround.

See [docs/DATABASE.md](docs/DATABASE.md).

## Before coding

1. Read the [project overview](docs/PROJECT.md).
2. Read [architecture](docs/ARCHITECTURE.md) for the affected area.
3. Read the relevant reporting, moderation, privacy, or database document for sensitive workflows.
4. Inspect the existing implementation before introducing a new abstraction.
5. Confirm that the change does not alter the anonymous reporting boundary or the frozen database contract.

## Development workflow

1. Start from an up-to-date `main` branch.
2. Create a focused branch for the change.
3. Make the smallest coherent change that solves the issue.
4. Keep secrets and production credentials out of source control.
5. Update project documentation when behavior or contributor guidance changes.
6. Run the relevant verification commands.
7. Review the complete diff for accidental changes.
8. Open a pull request with a clear explanation and testing notes.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Do not copy production secrets into a public issue, pull request, commit, or documentation file.

## Verification

Run the checks relevant to your change:

```bash
npm run lint
npm run test:unit
npm run build
```

The `Quality` GitHub Actions workflow also performs TypeScript checking, linting, unit tests, and a production build for pushes and pull requests targeting `main`.

For details, see [docs/TESTING.md](docs/TESTING.md).

## Pull requests

A useful pull request should explain:

- **What** changed.
- **Why** the change is needed.
- Which files or areas were affected.
- How the change was tested.
- Any limitations or deployment considerations.
- Whether the frozen database contract was left unchanged.

Keep unrelated refactors out of focused maintenance pull requests.

## Security-sensitive changes

Do not publicly disclose a vulnerability while proposing a fix. Follow [SECURITY.md](SECURITY.md) for private vulnerability reporting.

## Code quality

Prefer simple, explicit changes that follow the patterns already used in the repository. Do not bypass validation, authorization, database invariants, or the anonymous reporting boundary to make a feature easier to implement.

## Documentation contributions

Documentation is part of the project. Keep it implementation-based: document behavior that exists, avoid speculative features, and remove outdated claims when code changes.

See [docs/README.md](docs/README.md) for the documentation map.
