# Security Policy

## Reporting a vulnerability

Please do not disclose security vulnerabilities in a public issue or pull request.

Report security-sensitive findings privately to the project maintainer through the repository's configured private contact channel. Include:

- A clear description of the vulnerability.
- Affected route, component, or workflow.
- Reproduction steps or a minimal proof of concept.
- Security impact.
- Any suggested mitigation, if known.

Do not include passwords, API keys, service-role keys, personal data, or other secrets in a report.

## Security principles

RukheDao treats the following as security boundaries:

- Public incident submission is anonymous and must not require a reporter account.
- Public users must not receive administrative capabilities.
- The Supabase service-role key is server-side only and must never be exposed to browser code.
- Public visibility is separate from submission: an incident must pass the existing moderation/publication workflow before appearing publicly.
- Application code must preserve the existing frozen database security contract, including its RLS, functions, triggers, and permissions.

## Secrets

Never commit `.env` files, Supabase service-role keys, private tokens, credentials, or production secrets. Use the repository's environment-variable template and deployment platform secret storage.

If a secret is accidentally exposed, revoke or rotate it immediately and then remove it from the repository history where appropriate.

## Scope

Security reports may cover the web application, API routes, authentication/authorization boundaries, public/private data exposure, incident submission workflow, deployment configuration, and integrations used by RukheDao.
