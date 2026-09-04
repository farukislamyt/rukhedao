import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import type { Database } from "@/types/database";

function getPublicClient() {
    return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
}

function escapeXml(value: string | null | undefined): string {
    if (!value) return "";
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export async function GET() {
    const supabase = getPublicClient();
    const { data } = await supabase
        .from("public_incidents")
        .select("public_id,title,description,published_at,category,division,district")
        .order("published_at", { ascending: false })
        .limit(50);

    const items = (data ?? []).map((item) => {
        const url = absoluteUrl(`/incidents/${encodeURIComponent(item.public_id ?? "")}`);
        const pubDate = item.published_at ? new Date(item.published_at).toUTCString() : new Date().toUTCString();
        const location = [item.district, item.division].filter(Boolean).join(", ");
        const categoryTag = item.category ? `<category>${escapeXml(item.category)}</category>` : "";

        return `
    <item>
      <title>${escapeXml(item.title ?? "প্রকাশিত ঘটনার নথি")}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      ${categoryTag}
      <description>${escapeXml(item.description ? `${item.description.slice(0, 300)}... (${location})` : location)}</description>
    </item>`;
    }).join("");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} — জনস্বার্থের ঘটনার নথি</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>bn</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

    return new Response(rssXml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}
