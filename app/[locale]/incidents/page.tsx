import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type PublicIncident = Tables<"public_incidents">;

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("incidents");
    return { title: t("metaTitle"), description: t("metaDescription") };
}

function formatDate(value: string | null, locale: string) {
    if (!value) return "";
    return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(`${value}T00:00:00`));
}

function verificationLabel(
    status: PublicIncident["verification_status"],
    t: (key: string) => string,
) {
    switch (status) {
        case "verified":
            return t("verified");
        case "partially_verified":
            return t("partiallyVerified");
        case "disputed":
            return t("disputed");
        default:
            return t("reported");
    }
}

export default async function IncidentsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations("incidents");
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("public_incidents")
        .select(
            "public_id,title,description,incident_date,category,category_slug,division,district,verification_status,published_at",
        )
        .order("published_at", { ascending: false })
        .limit(24);

    if (error) throw new Error("Unable to load public incidents.");

    const incidents = (data ?? []) as PublicIncident[];

    return (
        <main className="flex-1 bg-stone-50 text-zinc-950">
            <section className="border-b border-zinc-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{t("eyebrow")}</p>
                    <div className="mt-4 max-w-3xl">
                        <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{t("title")}</h1>
                        <p className="mt-5 text-base leading-7 text-zinc-600 sm:text-lg">{t("description")}</p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
                {incidents.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                        <h2 className="text-xl font-semibold">{t("emptyTitle")}</h2>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">{t("emptyDescription")}</p>
                    </div>
                ) : (
                    <>
                        <p className="mb-6 text-sm text-zinc-500">{t("publishedCount", { count: incidents.length })}</p>
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {incidents.map((incident) => (
                                <Link
                                    key={incident.public_id}
                                    href={{ pathname: "/incidents/[public_id]", params: { public_id: incident.public_id ?? "" } }}
                                    className="group flex min-h-72 flex-col rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <span className="rounded-full border border-zinc-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">{incident.category ?? t("uncategorized")}</span>
                                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">{verificationLabel(incident.verification_status, t)}</span>
                                    </div>
                                    <h2 className="mt-7 line-clamp-3 text-xl font-semibold leading-7 tracking-[-0.02em] group-hover:underline group-hover:decoration-zinc-300 group-hover:underline-offset-4">{incident.title}</h2>
                                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500">{incident.description}</p>
                                    <div className="mt-auto grid grid-cols-2 gap-4 border-t border-zinc-200 pt-5">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">{t("location")}</p>
                                            <p className="mt-1 text-xs font-medium text-zinc-700">{[incident.district, incident.division].filter(Boolean).join(", ")}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">{t("date")}</p>
                                            <p className="mt-1 text-xs font-medium text-zinc-700">{formatDate(incident.incident_date, locale)}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
