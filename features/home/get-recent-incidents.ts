import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type PublicIncident = Database["public"]["Views"]["public_incidents"]["Row"];

export async function getRecentPublishedIncidents(limit = 3): Promise<PublicIncident[]> {
    const supabase = await createClient();

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
}
