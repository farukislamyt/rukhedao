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
    const orConditions = [
        incident.category_slug ? `category_slug.eq.${incident.category_slug}` : null,
        incident.district_slug ? `district_slug.eq.${incident.district_slug}` : null,
        incident.division_slug ? `division_slug.eq.${incident.division_slug}` : null,
    ].filter(Boolean);

    let query = supabase
        .from("public_incidents")
        .select(RELATED_FIELDS)
        .neq("public_id", incident.public_id ?? "");

    if (orConditions.length > 0) {
        query = query.or(orConditions.join(","));
    }

    const { data, error } = await query
        .order("published_at", { ascending: false })
        .limit(36);

    if (error || !data) return [];

    return (data as RelatedIncident[])
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
