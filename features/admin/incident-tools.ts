export type RevisionLike = {
  title: string;
  description?: string;
  category_id: string;
  division_id: number;
  district_id: number;
  incident_date: string;
};

export type RevisionDiff = {
  field: keyof RevisionLike;
  before: string;
  after: string;
};

const fields: Array<keyof RevisionLike> = [
  "title",
  "description",
  "category_id",
  "division_id",
  "district_id",
  "incident_date",
];

export function diffIncidentRevisions(before: RevisionLike | null, after: RevisionLike | null): RevisionDiff[] {
  if (!before || !after) return [];
  return fields
    .filter((field) => String(before[field] ?? "") !== String(after[field] ?? ""))
    .map((field) => ({
      field,
      before: String(before[field] ?? ""),
      after: String(after[field] ?? ""),
    }));
}

function tokens(value: string) {
  return new Set(
    value
      .toLocaleLowerCase("bn-BD")
      .split(/[^\p{L}\p{N}]+/u)
      .filter((token) => token.length >= 3),
  );
}

function titleOverlap(a: string, b: string) {
  const left = tokens(a);
  const right = tokens(b);
  if (!left.size || !right.size) return 0;
  let common = 0;
  for (const token of left) if (right.has(token)) common += 1;
  return Math.round((common / Math.max(left.size, right.size)) * 20);
}

export function similarityScore(a: RevisionLike, b: RevisionLike) {
  let score = 0;
  if (a.category_id === b.category_id) score += 50;
  if (a.district_id === b.district_id) score += 30;
  if (a.division_id === b.division_id) score += 15;

  const dayDelta = Math.abs(
    (Date.parse(`${a.incident_date}T00:00:00Z`) - Date.parse(`${b.incident_date}T00:00:00Z`)) /
      86_400_000,
  );
  if (dayDelta <= 7) score += 10;
  else if (dayDelta <= 30) score += 7;
  else if (dayDelta <= 90) score += 4;

  score += titleOverlap(a.title, b.title);
  return score;
}
