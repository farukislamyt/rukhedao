import { describe, expect, it } from "vitest";
import { diffIncidentRevisions, similarityScore } from "./incident-tools";

describe("admin incident tools", () => {
  it("returns only changed revision fields", () => {
    const before = { title: "আগের শিরোনাম", description: "একটি দীর্ঘ বিবরণ", category_id: "a", division_id: 1, district_id: 2, incident_date: "2026-01-01" } as never;
    const after = { ...before, title: "নতুন শিরোনাম" } as never;
    expect(diffIncidentRevisions(before, after)).toEqual([{ label: "শিরোনাম", before: "আগের শিরোনাম", after: "নতুন শিরোনাম" }]);
  });

  it("scores shared location and category strongly", () => {
    const a = { title: "একই বাজারে অনিয়ম", description: "বিবরণ", category_id: "a", division_id: 1, district_id: 2, incident_date: "2026-01-01" };
    const b = { title: "বাজারে অনিয়ম", description: "বিবরণ", category_id: "a", division_id: 1, district_id: 2, incident_date: "2026-01-03" };
    expect(similarityScore(a, b)).toBeGreaterThanOrEqual(95);
  });
});
