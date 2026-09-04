export type ReviewDiff = { label: string; before: string; after: string };

export function diffText(before: string | null, after: string | null, label: string): ReviewDiff | null {
  const left = before ?? "—";
  const right = after ?? "—";
  return left === right ? null : { label, before: left, after: right };
}

export function titleOverlapScore(a: string, b: string): number {
  const normalize = (value: string) => value.toLocaleLowerCase("bn-BD").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const left = new Set(normalize(a).split(/\s+/).filter(Boolean));
  const right = new Set(normalize(b).split(/\s+/).filter(Boolean));
  if (!left.size || !right.size) return 0;
  return Math.min(20, Math.round([...left].filter((token) => right.has(token)).length / Math.max(left.size, right.size) * 20));
}
