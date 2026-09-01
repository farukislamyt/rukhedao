# Database Contract

> ## FROZEN DATABASE — DO NOT MODIFY
>
> The deployed RukheDao database is the source of truth for application development. **Do not create migrations or make database changes.**

## Non-negotiable rules

Application development must not:

- create new migrations;
- alter existing tables or columns;
- add or remove application tables;
- alter existing constraints;
- replace or modify existing database functions/RPCs;
- modify existing triggers;
- modify RLS policies;
- modify database permissions/grants;
- introduce a second database contract to work around an application bug.

If application behavior appears incompatible with the frozen database, audit the existing contract and adapt the application layer. Do not change the database as a first response.

## Core application tables

The frozen application schema contains eight core tables:

1. `categories`
2. `divisions`
3. `districts`
4. `admin_users`
5. `incidents`
6. `incident_revisions`
7. `incident_reports`
8. `moderation_actions`

## Public data boundary

Public-facing pages must use the existing public-safe database contract. Public visibility is not equivalent to submission.

An incident submitted by a visitor enters the moderation workflow. Only incidents that satisfy the existing approval/publication rules may appear on public incident surfaces.

## Anonymous submission boundary

Public incident submission is anonymous by design. A reporter account is not part of the incident submission contract.

The application must use the existing anonymous submission mechanism exposed by the frozen database. Do not add a reporter/user table or add reporter identity fields to the incident workflow to solve an application problem.

## Incident lifecycle

The intended conceptual lifecycle is:

```text
Anonymous submission
       ↓
Pending incident
       ↓
Admin/moderation review
       ↓
Approved / other existing moderation outcome
       ↓
Publication when existing publication rules are satisfied
       ↓
Public incident
```

The application must not make a pending submission publicly visible merely because it was successfully inserted.

## Revisions and moderation

The frozen schema includes `incident_revisions` and `moderation_actions`. Application code must preserve the existing database behavior around revision history and moderation/audit records rather than implementing competing history or moderation storage in application code.

## Reference data

`categories`, `divisions`, and `districts` are canonical reference data. Application code should validate and use their existing identifiers and relationships rather than duplicating reference data in another store.

## Database troubleshooting

When a database-related feature fails:

1. Capture the exact database error code, message, details, and hint.
2. Identify the exact application query/RPC that produced it.
3. Compare the query with the frozen database contract.
4. Check the existing grants/RLS/function/trigger behavior before proposing changes.
5. Prefer an application-layer fix when the frozen contract already supports the required behavior.
6. Never create a migration as an emergency workaround.

## Source of truth

The authoritative database definition is the frozen SQL already maintained in this repository. This document describes the contract and rules for working with it; it is not permission to modify that SQL.
