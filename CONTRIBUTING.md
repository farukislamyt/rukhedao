# Contributing to RukheDao

Thank you for contributing to RukheDao.

## Before you start

Read the repository documentation and understand the public reporting workflow before making changes.

### Frozen database rule

The production database is a **frozen contract**.

- Do not create new Supabase migrations.
- Do not alter existing tables, columns, constraints, functions, triggers, views, RLS policies, or permissions.
- Do not add application tables to solve an application-layer problem.
- Adapt application code to the existing database contract.
- If a change appears to require a database modification, stop and document the incompatibility before proceeding.

## Development workflow

1. Create a focused feature or fix branch from `main`.
2. Inspect existing implementations and database contracts before changing behavior.
3. Keep changes scoped to the stated problem.
4. Never commit secrets, service-role keys, or production credentials.
5. Run the project's build and relevant tests before opening a pull request.
6. Review the diff for accidental migrations, schema changes, debug code, and unrelated changes.
7. Open a pull request with a concise explanation of the problem, solution, testing performed, and any known limitations.

## Incident workflow

Public incident submission is anonymous by design. New submissions enter the existing moderation workflow and are not public merely because they were submitted.

Changes to incident submission must preserve:

- no account requirement for public submission;
- the existing database contract;
- moderation before public publication;
- privacy of the reporter;
- existing revision and moderation behavior.

## Pull requests

A good pull request should include:

- What changed and why.
- Files or areas affected.
- How the change was tested.
- Any deployment considerations.
- Confirmation that the frozen database was not modified.

## Code quality

Prefer simple, explicit implementations that follow existing project patterns. Avoid bypassing existing validation, authorization, or database invariants merely to make a feature work.
