# Reporting workflow

RukheDao separates anonymous reporting from public publication.

## Lifecycle

```text
Anonymous submission
        ↓
     pending
        ↓
   under_review
      ↙      ↘
needs_revision  approved
    ↓             ↓
under_review   public publication
    │
    └──→ rejected

approved ↔ archived
```

The exact allowed transitions are enforced by the application's workflow logic and the frozen database contract.

## Anonymous submission

A public visitor can submit an incident without a public account or reporter profile. The submission boundary accepts JSON requests and applies an application-layer request-body limit before database access.

The incident-creation path uses the existing `create_anonymous_incident` database operation. Contributors must not introduce a new reporter identity model or bypass the established database workflow.

## What happens after submission

A new incident starts in `pending`. Authorized staff can move it through the review lifecycle. An incident is not treated as public merely because it was successfully submitted.

Staff may request revisions, reject an incident, approve it, or perform other permitted moderation actions. Approved incidents can be published according to the existing database publication rules.

## Revisions

Incident revisions preserve the historical record of changes. The first revision represents the original submission; later revisions record staff-side changes such as editing, redaction, location correction, category correction, date correction, content correction, or restoration.

## Verification

Verification is a separate incident property from moderation status. The database contract supports `reported`, `partially_verified`, `verified`, and `disputed` verification states.

## Public identifiers

Public incident identifiers use the project's opaque `RK-XXXXXXXXXXXX` format. The public identifier is not a reporter identity.

## Contributor guidance

Changes to reporting behavior are security- and privacy-sensitive. Before changing the submission path, validation, publication rules, or workflow transitions, inspect the existing API implementation, workflow logic, tests, and frozen SQL together. Update documentation and tests when behavior changes.