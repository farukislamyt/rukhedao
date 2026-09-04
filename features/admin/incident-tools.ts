import type { Database } from "@/types/database";

type Incident = Database["public"]["Tables"]["incidents"]["Row"];
type Revision = Database["public"]["Tables"]["incident_revisions"]["Row"];

export type IncidentFieldDiff = {
  label: string;
  before: string;
  after: string;
};

const dateValue = (value: string | null) => value ?? "—";

export function diffIncidentRevisions(before: Revision, after: Revision): IncidentFieldDiff[] {
  const fields: Array<[keyof Revision, string]> = [
    ["title", "শিরোনাম"],
    ["description", "বিবরণ"],
    ["category_id", "ঘটনার ধরন"],
    ["division_id", "বিভাগ"],
    ["district_id", "জেলা"],
    ["incident_date", "ঘটনার তারিখ"],
  ];

  return fields.flatMap(([field, label]) => {
    const beforeValue = dateValue(String(before[field] ?? ""));
    const afterValue = dateValue(String(after[field] ?? ""));
    return beforeValue === afterValue ? [] : [{ label, before: beforeValue, after: afterValue }];
  });
}

export function similarityScore(a: Pick<Incident, "title" | "description" | "category_id" | "division_id" | "district_id" | "incident_date">, b: Pick<Incident, "title" | "description" | "category_id" | "division_id" | "district_id" | "incident_date">) {
  let score = 0;
  if (a.category_id === b.category_id) score += 50;
  if (a.district_id === b.district_id) score += 30;
  if (a.division_id === b.division_id) score += 15;
  if (a.incident_date && b.incident_date) {
    const days = Math.round(Math.abs(new Date(`${a.incident_date}T00:00:00+06:00`).getTime() - new Date(`${b.incident_date}T00:00:00+06:00`).getTime()) / 86_400_000);
    if (days <= 7) score += 10;
    else if (days <= 30) score += 7;
    else if (days <= 90) score += 4;
  }
  const normalize = (value: string) => value.toLocaleLowerCase("bn-BD").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const tokens = new Set(normalize(a.title).split(/\s+/).filter(Boolean));
  const otherTokens = new Set(normalize(b.title).split(/\s+/).filter(Boolean));
  const overlap = [...tokens].filter((token) => otherTokens.has(token));
  if (tokens.size && otherTokens.size) score += Math.min(20, Math.round((overlap.length / Math.max(tokens.size, otherTokens.size)) * 20));
  return score;
}
