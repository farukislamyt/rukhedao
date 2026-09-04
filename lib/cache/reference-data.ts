import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/types/database";

type Category = Tables<"public_categories">;
type Division = Tables<"public_divisions">;
type District = Tables<"public_districts">;

function getPublicClient() {
    return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
}

export const getCachedCategories = unstable_cache(
    async () => {
        const supabase = getPublicClient();
        const { data, error } = await supabase
            .from("public_categories")
            .select("id,name,slug,description,sort_order")
            .order("sort_order", { ascending: true });

        if (error) {
            console.error("Failed to load cached categories", error);
            return [];
        }
        return (data ?? []).filter((item): item is Category => item.id !== null && item.name !== null);
    },
    ["public-categories"],
    { revalidate: 300, tags: ["reference-data"] }
);

export const getCachedDivisions = unstable_cache(
    async () => {
        const supabase = getPublicClient();
        const { data, error } = await supabase
            .from("public_divisions")
            .select("id,name,slug,sort_order")
            .order("sort_order", { ascending: true });

        if (error) {
            console.error("Failed to load cached divisions", error);
            return [];
        }
        return (data ?? []).filter((item): item is Division => item.id !== null && item.name !== null);
    },
    ["public-divisions"],
    { revalidate: 300, tags: ["reference-data"] }
);

export const getCachedDistricts = unstable_cache(
    async () => {
        const supabase = getPublicClient();
        const { data, error } = await supabase
            .from("public_districts")
            .select("id,name,slug,sort_order,division_id")
            .order("sort_order", { ascending: true });

        if (error) {
            console.error("Failed to load cached districts", error);
            return [];
        }
        return (data ?? []).filter((item): item is District => item.id !== null && item.name !== null && item.division_id !== null);
    },
    ["public-districts"],
    { revalidate: 300, tags: ["reference-data"] }
);
