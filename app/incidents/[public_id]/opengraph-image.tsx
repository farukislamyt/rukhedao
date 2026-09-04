import { ImageResponse } from "next/og";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const runtime = "nodejs";
export const alt = "রুখেদাও — জনস্বার্থের ঘটনার নথি";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

function getPublicClient() {
    return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
}

export default async function Image({ params }: { params: Promise<{ public_id: string }> }) {
    const { public_id } = await params;
    const supabase = getPublicClient();

    const { data } = await supabase
        .from("public_incidents")
        .select("public_id,title,category,division,district,incident_date")
        .eq("public_id", public_id)
        .maybeSingle();

    const title = data?.title ?? "প্রকাশিত ঘটনার নথি";
    const category = data?.category ?? "জনস্বার্থসংশ্লিষ্ট ঘটনা";
    const location = [data?.district, data?.division].filter(Boolean).join(", ") || "বাংলাদেশ";
    const date = data?.incident_date ?? "";

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#fafaf9",
                    color: "#09090b",
                    padding: "60px",
                    fontFamily: "sans-serif",
                    border: "12px solid #18181b",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            backgroundColor: "#18181b",
                            color: "#ffffff",
                            padding: "8px 20px",
                            fontSize: "20px",
                            fontWeight: "bold",
                            letterSpacing: "2px",
                        }}
                    >
                        রুখেদাও | RukheDao
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#ecfdf5",
                            color: "#047857",
                            padding: "8px 16px",
                            fontSize: "18px",
                            fontWeight: "600",
                            border: "1px solid #a7f3d0",
                        }}
                    >
                        {category}
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "40px" }}>
                    <div style={{ fontSize: "18px", fontFamily: "monospace", color: "#71717a" }}>
                        পরিচিতি নম্বর: {public_id}
                    </div>
                    <div
                        style={{
                            fontSize: title.length > 60 ? "38px" : "48px",
                            fontWeight: "bold",
                            lineHeight: "1.2",
                            color: "#09090b",
                        }}
                    >
                        {title}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "2px solid #e4e4e7",
                        paddingTop: "24px",
                        fontSize: "20px",
                        color: "#52525b",
                    }}
                >
                    <div style={{ display: "flex", gap: "24px" }}>
                        <span>📍 স্থান: {location}</span>
                        {date && <span>📅 তারিখ: {date}</span>}
                    </div>
                    <div style={{ fontSize: "18px", color: "#a1a1aa" }}>rukhedao.org</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
