import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type PublicIncident = Tables<"public_incidents">;

type RelatedIncident = Pick<
    PublicIncident,
    | "public_id"
    | "title"
    | "description"
    | "incident_date"
    | "category"
    | "category_slug"
    | "division"
    | "division_slug"
    | "district"
    | "district_slug"
    | "published_at"
>;

const RELATED_FIELDS = "public_id,title,description,incident_date,category,category_slug,division,division_slug,district,district_slug,published_at";

function dateDistanceDays(a: string | null, b: string | null) {
    if (!a || !b) return null;
    const first = new Date(`${a}T00:00:00+06:00`).getTime();
    const second = new Date(`${b}T00:00:00+06:00`).getTime();
    if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
    return Math.round(Math.abs(first - second) / 86_400_000);
}

function dateScore(days: number | null) {
    if (days === null) return 0;
    if (days <= 7) return 10;
    if (days <= 30) return 7;
    if (days <= 90) return 4;
    return 0;
}

export async function getRelatedPublishedIncidents(
    incident: Pick<
        PublicIncident,
        | "public_id"
        | "category_slug"
        | "district_slug"
        | "division_slug"
        | "incident_date"
    >,
    limit = 6,
): Promise<RelatedIncident[]> {
    const supabase = await createClient();
    const queries = [
        incident.category_slug
            ? supabase.from("public_incidents").select(RELATED_FIELDS).eq("category_slug", incident.category_slug).neq("public_id", incident.public_id ?? "").order("published_at", { ascending: false }).limit(18)
            : Promise.resolve({ data: [], error: null }),
        incident.district_slug
            ? supabase.from("public_incidents").select(RELATED_FIELDS).eq("district_slug", incident.district_slug).neq("public_id", incident.public_id ?? "").order("published_at", { ascending: false }).limit(18)
            : Promise.resolve({ data: [], error: null }),
        incident.division_slug
            ? supabase.from("public_incidents").select(RELATED_FIELDS).eq("division_slug", incident.division_slug).neq("public_id", incident.public_id ?? "").order("published_at", { ascending: false }).limit(18)
            : Promise.resolve({ data: [], error: null }),
        supabase.from("public_incidents").select(RELATED_FIELDS).neq("public_id", incident.public_id ?? "").order("published_at", { ascending: false }).limit(12),
    ];

    const results = await Promise.all(queries);
    const candidates = new Map<string, RelatedIncident>();
    for (const result of results) {
        if (result.error) continue;
        for (const item of (result.data ?? []) as RelatedIncident[]) {
            if (item.public_id && !candidates.has(item.public_id)) candidates.set(item.public_id, item);
        }
    }

    return [...candidates.values()]
        .map((item) => {
            let score = 0;
            if (incident.category_slug && item.category_slug === incident.category_slug) score += 50;
            if (incident.district_slug && item.district_slug === incident.district_slug) score += 30;
            if (incident.division_slug && item.division_slug === incident.division_slug) score += 15;
            score += dateScore(dateDistanceDays(incident.incident_date, item.incident_date));
            return { item, score };
        })
        .sort((a, b) => b.score - a.score || (b.item.published_at ?? "").localeCompare(a.item.published_at ?? ""))
        .slice(0, limit)
        .map(({ item }) => item);
}
