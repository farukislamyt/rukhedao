import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

type LedgerItem = {
    name: string;
    count: number;
};

type HomeLedgerData = {
    divisions: LedgerItem[];
    categories: LedgerItem[];
};

type LedgerRow = {
    division: string | null;
    category: string | null;
};

const getCachedLedgerRows = unstable_cache(
    async (): Promise<LedgerRow[]> => {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        );

        const { data, error } = await supabase
            .from("public_incidents")
            .select("division, category");

        if (error) {
            throw error;
        }

        return data ?? [];
    },
    ["home-incident-ledger"],
    { revalidate: 60 },
);

export async function getHomeLedgerData(): Promise<HomeLedgerData> {
    let data: LedgerRow[];

    try {
        data = await getCachedLedgerRows();
    } catch (error) {
        console.error("Failed to load home incident ledgers", error);
        return { divisions: [], categories: [] };
    }

    const divisionCounts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();

    for (const incident of data) {
        if (incident.division) {
            divisionCounts.set(incident.division, (divisionCounts.get(incident.division) ?? 0) + 1);
        }

        if (incident.category) {
            categoryCounts.set(incident.category, (categoryCounts.get(incident.category) ?? 0) + 1);
        }
    }

    const toLedgerItems = (counts: Map<string, number>) =>
        [...counts.entries()]
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return {
        divisions: toLedgerItems(divisionCounts),
        categories: toLedgerItems(categoryCounts),
    };
}
