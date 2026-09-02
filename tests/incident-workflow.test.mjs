import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const outDir = ".test-dist";
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

execFileSync(
  "npx",
  [
    "tsc",
    "lib/admin/incident-workflow.ts",
    "--outDir",
    outDir,
    "--module",
    "commonjs",
    "--target",
    "ES2020",
    "--skipLibCheck",
    "--esModuleInterop",
    "--baseUrl",
    ".",
  ],
  { stdio: "inherit" },
);

const { INCIDENT_STATUS_TRANSITIONS, getAllowedIncidentStatusTransitions } = await import(
  join(process.cwd(), outDir, "lib/admin/incident-workflow.js")
);

test("incident workflow matches the frozen status contract", () => {
  assert.deepEqual(INCIDENT_STATUS_TRANSITIONS.pending, ["under_review", "rejected"]);
  assert.deepEqual(INCIDENT_STATUS_TRANSITIONS.under_review, ["needs_revision", "approved", "rejected"]);
  assert.deepEqual(INCIDENT_STATUS_TRANSITIONS.needs_revision, ["under_review", "rejected"]);
  assert.deepEqual(INCIDENT_STATUS_TRANSITIONS.approved, ["archived"]);
  assert.deepEqual(INCIDENT_STATUS_TRANSITIONS.rejected, []);
  assert.deepEqual(INCIDENT_STATUS_TRANSITIONS.archived, ["approved"]);
});

test("workflow helper returns only allowed transitions", () => {
  assert.deepEqual(getAllowedIncidentStatusTransitions("pending"), ["under_review", "rejected"]);
  assert.deepEqual(getAllowedIncidentStatusTransitions("rejected"), []);
  assert.deepEqual(getAllowedIncidentStatusTransitions("archived"), ["approved"]);
});

rmSync(outDir, { recursive: true, force: true });
