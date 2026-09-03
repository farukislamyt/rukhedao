import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/seo";

const publicRoutes = [
    "",
    "/incidents",
    "/about",
    "/how-it-works",
    "/privacy",
    "/content-policy",
    "/security",
    "/terms",
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const routes = publicRoutes.map((route) => ({
        url: absoluteUrl(route),
        changeFrequency: route === "/incidents" ? "daily" as const : "weekly" as const,
        priority:
            route === ""
                ? 1
                : route === "/incidents"
                  ? 0.9
                  : 0.6,
    }));

    const supabase = await createClient();
    const { data } = await supabase
        .from("public_incidents")
        .select("public_id,published_at")
        .not("public_id", "is", null)
        .order("published_at", { ascending: false });

    const incidentRoutes = (data ?? []).flatMap((incident) => {
        if (!incident.public_id) return [];
        const path = `/incidents/${encodeURIComponent(incident.public_id)}`;
        return [
            {
                url: absoluteUrl(path),
                lastModified: incident.published_at
                    ? new Date(incident.published_at)
                    : undefined,
                changeFrequency: "monthly" as const,
                priority: 0.8,
            },
        ];
    });

    return [...routes, ...incidentRoutes];
}
