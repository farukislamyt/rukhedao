# Moderation

Moderation is the boundary between public submission and public publication in RukheDao.

## Staff access

The administration area is for authorized staff. Staff authentication is separate from the public reporting model and is backed by Supabase Auth plus the project's `admin_users` authorization record.

## Incident status model

The frozen incident status enum contains:

| Status | Meaning in the workflow |
| --- | --- |
| `pending` | Newly submitted and awaiting review |
| `under_review` | Actively being reviewed by staff |
| `needs_revision` | Requires further correction/review before a final decision |
| `approved` | Approved for the public publication state |
| `rejected` | Not approved for publication |
| `archived` | No longer in the normal public publication state |

The implemented transition contract is:

```text
pending        → under_review, rejected
under_review   → needs_revision, approved, rejected
needs_revision → under_review, rejected
approved       → archived
rejected       → (none)
archived       → approved
```

Do not assume that arbitrary status changes are valid. The application and database define the permitted transitions.

## Verification

Verification is independent from moderation status. Staff can use the verification workflow to record whether an incident is reported, partially verified, verified, or disputed.

## Revisions and audit history

Staff changes are represented through incident revisions and moderation actions. This preserves a historical trail instead of treating an edit as if it were the original submission.

## Public reports about incidents

The application supports reports from the public about incidents. Report reasons in the frozen contract include false or misleading information, privacy concerns, harmful content, duplicates, wrong location, wrong date, and other concerns. Staff review these reports through the administration area.

## Moderation principles

- Never treat submission success as publication.
- Preserve the anonymous reporter boundary.
- Use the existing database workflow as the source of truth.
- Keep staff-only actions behind the existing authorization boundary.
- Preserve revision and moderation history.
- Do not change the frozen database contract to make a moderation feature easier to implement.

For database-level details, see [DATABASE.md](DATABASE.md). For security reporting, see [SECURITY.md](../SECURITY.md).