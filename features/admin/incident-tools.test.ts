import { describe, expect, it } from "vitest";
import { diffIncidentRevisions, similarityScore } from "./incident-tools";

const base = {
  title: "একই ঘটনার শিরোনাম",
  description: "একটি ঘটনার বিস্তারিত বিবরণ এখানে আছে।",
  category_id: "cat-1",
  division_id: 1,
  district_id: 10,
  incident_date: "2026-09-01",
};

describe("incident review tools", () => {
  it("detects changed revision fields", () => {
    const diff = diffIncidentRevisions(base, { ...base, title: "পরিবর্তিত শিরোনাম" });
    expect(diff).toEqual([
      { field: "title", before: "একই ঘটনার শিরোনাম", after: "পরিবর্তিত শিরোনাম" },
    ]);
  });

  it("scores incidents with matching context and title tokens higher", () => {
    const similar = { ...base, title: "একই ঘটনার শিরোনাম আবার" };
    const distant = { ...base, category_id: "cat-2", division_id: 2, district_id: 20, incident_date: "2025-01-01", title: "সম্পূর্ণ আলাদা বিষয়" };
    expect(similarityScore(base, similar)).toBeGreaterThan(similarityScore(base, distant));
  });
});
