import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type PublicIncident = Database["public"]["Views"]["public_incidents"]["Row"];

function getPublicClient() {
    return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
}

export const getRecentPublishedIncidents = unstable_cache(
    async (limit = 3): Promise<PublicIncident[]> => {
        const supabase = getPublicClient();

        const { data, error } = await supabase
            .from("public_incidents")
            .select("public_id,title,description,incident_date,category,category_slug,division,division_slug,district,district_slug,verification_status,published_at")
            .order("published_at", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Failed to load recent public incidents", error);
            return [];
        }

        return (data ?? []) as PublicIncident[];
    },
    ["recent-published-incidents"],
    { revalidate: 300, tags: ["home-incidents"] }
);
