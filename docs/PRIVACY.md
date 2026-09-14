# Privacy model

RukheDao is designed around anonymous public-interest reporting. This document describes the project's application and database boundary; it is not a promise that anonymity can defeat every external observation or deployment-level logging system.

## Public reporting identity model

The frozen database contract does not define a public reporter account or reporter profile. Public incident submissions are intentionally not modeled with reporter identity fields such as:

- user ID
- reporter ID
- email address
- phone number
- IP address
- device identifier
- fingerprint
- tracking identifier

Internal staff authentication is separate and uses Supabase Auth together with the RukheDao staff authorization model.

## Submission vs. publication

Anonymous submission does not immediately expose the submitted material publicly. Incidents enter the moderation lifecycle first, and publication is controlled by the existing moderation/database rules.

## Data minimization boundary

Contributors must not add public reporter identity fields, a public registration system, or a parallel identity store without an explicit architectural decision that replaces the current privacy model.

When working on APIs or database access, preserve least privilege and use the existing public-safe data boundary. Do not expose internal staff information, moderation history, or other non-public records through public routes.

## Security limitations

An application-level anonymity model should not be described as absolute or untraceable. Hosting, infrastructure, browser behavior, network providers, operational logs, or external services may have their own data practices outside the application's database contract.

For security vulnerabilities, follow the private reporting process in the root [SECURITY.md](../SECURITY.md).