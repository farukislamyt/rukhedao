import { createClient } from "@/lib/supabase/server";

type LedgerItem = {
    name: string;
    slug: string | null;
    count: number;
};

type HomeLedgerData = {
    divisions: LedgerItem[];
    categories: LedgerItem[];
};

export async function getHomeLedgerData(): Promise<HomeLedgerData> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("public_incidents")
        .select("division,division_slug,category,category_slug");

    if (error) {
        console.error("Failed to load home incident ledgers", error);
        return { divisions: [], categories: [] };
    }

    const divisionCounts = new Map<string, { slug: string | null; count: number }>();
    const categoryCounts = new Map<string, { slug: string | null; count: number }>();

    for (const incident of data ?? []) {
        if (incident.division) {
            const current = divisionCounts.get(incident.division);
            divisionCounts.set(incident.division, {
                slug: current?.slug ?? incident.division_slug,
                count: (current?.count ?? 0) + 1,
            });
        }

        if (incident.category) {
            const current = categoryCounts.get(incident.category);
            categoryCounts.set(incident.category, {
                slug: current?.slug ?? incident.category_slug,
                count: (current?.count ?? 0) + 1,
            });
        }
    }

    const toLedgerItems = (counts: Map<string, { slug: string | null; count: number }>) =>
        [...counts.entries()]
            .map(([name, value]) => ({ name, slug: value.slug, count: value.count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return {
        divisions: toLedgerItems(divisionCounts),
        categories: toLedgerItems(categoryCounts),
    };
}
