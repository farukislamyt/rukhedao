import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";

const baseUrl = "https://rukhedao.vercel.app";
const publicRoutes = [
    "",
    "/incidents",
    "/report",
    "/about",
    "/how-it-works",
    "/privacy",
    "/content-policy",
    "/security",
    "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const localizedRoutes = publicRoutes.map((route) => ({
        url: `${baseUrl}/bn${route}`,
        changeFrequency: route === "/incidents" ? "daily" as const : "weekly" as const,
        priority:
            route === ""
                ? 1
                : route === "/incidents"
                  ? 0.9
                  : route === "/report"
                    ? 0.8
                    : 0.6,
    }));

    const supabase = await createClient();
    const { data } = await supabase
        .from("public_incidents")
        .select("public_id,published_at")
        .not("public_id", "is", null);

    const incidentRoutes = (data ?? []).map((incident) => ({
        url: `${baseUrl}/bn/incidents/${incident.public_id}`,
        lastModified: incident.published_at ? new Date(incident.published_at) : undefined,
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    return [...localizedRoutes, ...incidentRoutes];
}
