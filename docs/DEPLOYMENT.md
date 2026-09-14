# Deployment

RukheDao is deployed as a Next.js application on Vercel, with source maintained in GitHub and data/services provided by Supabase/PostgreSQL.

## Production path

The normal production path is:

```text
GitHub main
    ↓
GitHub Actions quality checks
    ↓
Vercel production deployment
    ↓
Production verification
```

Repository quality checks run automatically for pushes and pull requests targeting `main`. Production deployment configuration is maintained outside the repository where appropriate.

## Runtime configuration

Local development uses the variables documented by `.env.example`. Production secrets and credentials must be configured in the deployment environment and must never be committed to Git.

In particular, do not commit Supabase service-role credentials, authentication secrets, API tokens, or other production credentials.

## Database constraint

Deployment does not authorize database changes. The production Supabase/PostgreSQL database remains the frozen RukheDao contract. Application deployments must remain compatible with the deployed schema and security rules.

## Verification after deployment

At minimum, verify that:

- the public application loads;
- public incident pages remain readable;
- the anonymous submission boundary behaves as expected;
- staff administration remains protected;
- the production build has passed CI;
- no deployment introduced an unexpected database or security-contract change.

For deeper read-only verification, the repository's Playwright workflow can target an explicitly supplied approved deployment URL.

## Rollback principle

If a deployment introduces a regression, prefer reverting the application deployment or code change rather than modifying the frozen database to accommodate the regression. Database changes require a separate architectural decision and are outside normal RukheDao contribution scope.