export type IncidentReviewRecord = {
  title: string;
  description: string;
  category_id: string;
  division_id: number;
  district_id: number;
  incident_date: string;
};

export type RevisionDiff = {
  field: keyof IncidentReviewRecord;
  before: string;
  after: string;
};

const fields: Array<keyof IncidentReviewRecord> = [
  "title",
  "description",
  "category_id",
  "division_id",
  "district_id",
  "incident_date",
];

export function diffIncidentRevisions(
  before: IncidentReviewRecord | null,
  after: IncidentReviewRecord | null,
): RevisionDiff[] {
  if (!before || !after) return [];
  return fields.flatMap((field) => {
    const previous = String(before[field] ?? "");
    const current = String(after[field] ?? "");
    return previous === current ? [] : [{ field, before: previous, after: current }];
  });
}

function titleTokens(value: string) {
  return new Set(
    value
      .toLocaleLowerCase("bn-BD")
      .normalize("NFKC")
      .split(/[^\p{L}\p{N}]+/u)
      .filter((token) => token.length >= 2),
  );
}

/** Heuristic review score, not a probability or percentage. */
export function similarityScore(a: IncidentReviewRecord, b: IncidentReviewRecord) {
  let score = 0;
  if (a.category_id === b.category_id) score += 50;
  if (a.district_id === b.district_id) score += 30;
  if (a.division_id === b.division_id) score += 15;

  const aDate = Date.parse(`${a.incident_date}T00:00:00Z`);
  const bDate = Date.parse(`${b.incident_date}T00:00:00Z`);
  if (Number.isFinite(aDate) && Number.isFinite(bDate)) {
    const days = Math.abs(aDate - bDate) / 86_400_000;
    if (days <= 7) score += 10;
    else if (days <= 30) score += 7;
    else if (days <= 90) score += 4;
  }

  const aTokens = titleTokens(a.title);
  const bTokens = titleTokens(b.title);
  const smaller = Math.min(aTokens.size, bTokens.size);
  if (smaller > 0) {
    const overlap = [...aTokens].filter((token) => bTokens.has(token)).length;
    score += Math.round((overlap / smaller) * 20);
  }

  return score;
}
