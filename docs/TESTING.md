# Testing and verification

RukheDao uses several layers of repository verification. Contributors should run the checks relevant to their change before opening a pull request.

## Local checks

Install dependencies and run the development server as described in the root README.

The repository exposes these verification commands:

```bash
npm run lint
npm run test:unit
npm run build
```

The unit test command runs the incident workflow contract tests and anonymous-submission security tests.

## What the unit/security tests cover

The incident workflow tests verify the allowed status transitions against the frozen status contract. The anonymous-submission security tests verify JSON content-type handling, the 16 KiB application-layer request-body limit, and the expected opaque public incident identifier format.

These tests are intentionally narrow: they protect high-risk application invariants without replacing the database as the source of truth.

## Continuous integration

The `Quality` GitHub Actions workflow runs on pushes and pull requests targeting `main`. It performs:

1. `npm ci`
2. Type checking with `tsc --noEmit`
3. ESLint
4. Unit tests
5. Production build

A contribution should pass these checks before merge.

## End-to-end verification

The repository also contains a manually triggered Playwright workflow. It accepts an explicit `E2E_BASE_URL`, installs Chromium, and runs the read-only E2E suite against that approved deployment URL. Failure artifacts are retained through the Playwright HTML report configuration.

Do not point a read-only E2E run at an unapproved environment or introduce test behavior that mutates production data.

## Documentation changes

Documentation-only changes normally do not require application behavior changes, but contributors should still check Markdown links, commands, file paths, and claims against the current repository. If documentation describes a code path, verify that path before submitting the change.