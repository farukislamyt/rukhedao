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
    const { public_id } = await params;
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

    if (error || !data) notFound();

    const incident = data as PublicIncident;
    const location = [incident.district, incident.division].filter(Boolean).join(", ");

    return (
        <main className="flex-1 bg-stone-50 text-zinc-950">
            <section className="border-b border-zinc-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
                    <nav aria-label={tc("incidents")} className="text-sm">
                        <ol className="flex items-center gap-2 text-zinc-500">
                            <li><Link href="/" className="hover:text-zinc-950 hover:underline hover:underline-offset-4">{tc("home")}</Link></li>
                            <li aria-hidden="true">/</li>
                            <li><Link href="/incidents" className="hover:text-zinc-950 hover:underline hover:underline-offset-4">{tc("incidents")}</Link></li>
                            <li aria-hidden="true">/</li>
                            <li aria-current="page" className="font-medium text-zinc-950">{incident.public_id}</li>
                        </ol>
                    </nav>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                    <div>
                        <article className="overflow-hidden border border-zinc-200 bg-white shadow-sm">
                            <header className="border-b border-zinc-200 px-6 py-8 sm:px-10 sm:py-10">
                                <div className="flex flex-wrap items-center gap-2">
                                    {incident.category && (
                                        <span className="border border-zinc-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-zinc-600">
                                            {incident.category}
                                        </span>
                                    )}
                                </div>

                                <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">
                                    {incident.title}
                                </h1>

                                <div className="mt-7 grid gap-5 border-t border-zinc-200 pt-6 sm:grid-cols-3">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">{t("publicId")}</p>
                                        <p className="mt-1 break-all font-mono text-xs text-zinc-700">{incident.public_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">{t("incidentDate")}</p>
                                        <p className="mt-1 text-sm font-medium text-zinc-700">{formatDate(incident.incident_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">{t("location")}</p>
                                        <p className="mt-1 text-sm font-medium text-zinc-700">{location}</p>
                                    </div>
                                </div>
                            </header>

                            <div className="px-6 py-8 sm:px-10 sm:py-10">
                                <p className="whitespace-pre-wrap text-base leading-8 text-zinc-700 sm:text-lg">
                                    {incident.description}
                                </p>
                            </div>

                            <footer className="border-t border-zinc-200 bg-stone-50 px-6 py-6 sm:px-10">
                                <div className="flex flex-col gap-3 text-xs leading-5 text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
                                    <p>{t("publicRecord")}</p>
                                    <p>{t("publishedAt", { date: formatDate(incident.published_at?.slice(0, 10) ?? null) })}</p>
                                </div>
                            </footer>
                        </article>

                        <section className="mt-8 border border-zinc-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="report-record-heading">
                            <div className="mb-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{t("reportEyebrow")}</p>
                                <h2 id="report-record-heading" className="mt-3 text-2xl font-semibold tracking-[-0.02em]">{t("reportTitle")}</h2>
                                <p className="mt-2 text-sm leading-6 text-zinc-500">{t("reportDescription")}</p>
                            </div>
                            <ReportIncidentForm
                                publicId={incident.public_id ?? public_id}
                                labels={{
                                    title: t("reportTitle"),
                                    description: t("reportDetails"),
                                    reason: t("reportReason"),
                                    reasonPlaceholder: t("reportReasonPlaceholder"),
                                    descriptionPlaceholder: t("reportDetailsPlaceholder"),
                                    submit: t("reportSubmit"),
                                    submitting: t("reportSubmitting"),
                                    success: t("reportSuccess"),
                                    error: t("reportError"),
                                    reasons: {
                                        false_or_misleading: t("reasonFalseOrMisleading"),
                                        privacy_concern: t("reasonPrivacyConcern"),
                                        harmful_content: t("reasonHarmfulContent"),
                                        duplicate: t("reasonDuplicate"),
                                        wrong_location: t("reasonWrongLocation"),
                                        wrong_date: t("reasonWrongDate"),
                                        other: t("reasonOther"),
                                    },
                                }}
                            />
                        </section>
                    </div>

                    <IncidentLedgerSidebar ledgers={ledgers} />
                </div>
            </section>
        </main>
    );
}
