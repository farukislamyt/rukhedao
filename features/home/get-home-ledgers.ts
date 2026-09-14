import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type LedgerItem = {
    name: string;
    slug: string | null;
    count: number;
};

type HomeLedgerData = {
    divisions: LedgerItem[];
    categories: LedgerItem[];
};

function getPublicClient() {
    return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
}

export const getHomeLedgerData = unstable_cache(
    async (): Promise<HomeLedgerData> => {
        const supabase = getPublicClient();

        const { data, error } = await supabase
            .from("public_incidents")
            .select("division,division_slug,category,category_slug");

        if (error) {
            console.error("Failed to load home incident ledgers", error);
            return { divisions: [], categories: [] };
        }

        // Aggregate in-place so large result sets do not create a new object
        // for every incident. This preserves the exact same output while
        // reducing server-side allocations and garbage-collection work.
        const divisionCounts = new Map<string, LedgerItem>();
        const categoryCounts = new Map<string, LedgerItem>();

        for (const incident of data ?? []) {
            if (incident.division) {
                const current = divisionCounts.get(incident.division);

                if (current) {
                    current.count += 1;
                } else {
                    divisionCounts.set(incident.division, {
                        name: incident.division,
                        slug: incident.division_slug,
                        count: 1,
                    });
                }
            }

            if (incident.category) {
                const current = categoryCounts.get(incident.category);

                if (current) {
                    current.count += 1;
                } else {
                    categoryCounts.set(incident.category, {
                        name: incident.category,
                        slug: incident.category_slug,
                        count: 1,
                    });
                }
            }
        }

        const toLedgerItems = (counts: Map<string, LedgerItem>) =>
            [...counts.values()].sort(
                (a, b) => b.count - a.count || a.name.localeCompare(b.name)
            );

        return {
            divisions: toLedgerItems(divisionCounts),
            categories: toLedgerItems(categoryCounts),
        };
    },
    ["home-ledger-data"],
    { revalidate: 300, tags: ["home-ledgers"] }
);
