import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { IncidentLedgerSidebar } from "@/components/incident/incident-ledger-sidebar";
import { ReportIncidentForm } from "@/components/incident/report-incident-form";
import { getHomeLedgerData } from "@/features/home/get-home-ledgers";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type PublicIncident = Tables<"public_incidents">;

function formatDate(value: string | null) {
    if (!value) return "";
    return new Intl.DateTimeFormat("bn-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Dhaka",
    }).format(new Date(`${value}T00:00:00+06:00`));
}

function truncateDescription(value: string | null, maxLength = 160) {
    if (!value) return undefined;
    const normalized = value.replace(/\s+/g, " ").trim();
    return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1).trim()}…` : normalized;
}

function absoluteUrl(path: string) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rukhedao.vercel.app";
    return new URL(path, baseUrl).toString();
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; public_id: string }>;
}): Promise<Metadata> {
    const { public_id } = await params;
    const supabase = await createClient();
    const { data } = await supabase
        .from("public_incidents")
        .select("title,description,category,division,district,incident_date")
        .eq("public_id", public_id)
        .maybeSingle();

    if (!data) return { title: "রুখেদাও" };

    const location = [data.district, data.division].filter(Boolean).join(", ");
    const date = formatDate(data.incident_date);
    const details = [location, date].filter(Boolean).join(" · ");
    const baseTitle = data.title ?? "ঘটনা";
    const title = details ? `${baseTitle} — ${details}` : baseTitle;
    const description = truncateDescription(data.description);
    const path = `/bn/incidents/${public_id}`;

    return {
        title: `${title} | রুখেদাও`,
        description,
        alternates: {
            canonical: path,
        },
        openGraph: {
            title,
            description,
            type: "article",
            locale: "bn_BD",
            url: absoluteUrl(path),
        },
    };
}

export default async function IncidentDetailPage({
    params,
}: {
    params: Promise<{ locale: string; public_id: string }>;
}) {
    const { locale, public_id } = await params;
    const t = await getTranslations("incident");
    const tc = await getTranslations("common");
    const supabase = await createClient();

    const [{ data, error }, ledgers] = await Promise.all([
        supabase
            .from("public_incidents")
            .select(
                "public_id,title,description,incident_date,category,category_slug,division,division_slug,district,district_slug,published_at",
            )
            .eq("public_id", public_id)
            .maybeSingle(),
        getHomeLedgerData(),
    ]);
