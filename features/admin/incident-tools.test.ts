import { describe, expect, it } from "vitest";
import { diffIncidentRevisions, similarityScore } from "./incident-tools";

const base = {
  title: "রাস্তার কাজের অনিয়ম",
  description: "একই প্রকল্পে কাজের মান নিয়ে অভিযোগ।",
  category_id: "cat-1",
  division_id: 1,
  district_id: 10,
  incident_date: "2026-08-20",
};

describe("incident tools", () => {
  it("finds changed revision fields", () => {
    const diff = diffIncidentRevisions(base, { ...base, title: "নতুন শিরোনাম" });
    expect(diff).toEqual([{ field: "title", before: base.title, after: "নতুন শিরোনাম" }]);
  });

  it("scores incidents higher when core context matches", () => {
    expect(similarityScore(base, { ...base, title: "রাস্তার কাজের অনিয়ম" })).toBeGreaterThanOrEqual(100);
    expect(similarityScore(base, { ...base, category_id: "cat-2", district_id: 99, division_id: 8, incident_date: "2025-01-01", title: "সম্পূর্ণ ভিন্ন ঘটনা" })).toBe(0);
  });
});
