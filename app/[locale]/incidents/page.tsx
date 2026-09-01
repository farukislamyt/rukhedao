import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { IncidentFilters } from "@/components/incident/incident-filters";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type PublicIncident = Tables<"public_incidents">;
type Category = Tables<"public_categories">;
type Division = Tables<"public_divisions">;
type District = Tables<"public_districts">;

type SearchParams = Promise<{
    q?: string;
    category?: string;
    division?: string;
    district?: string;
    verification?: string;
    page?: string;
}>;

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
        timeZone: "Asia/Dhaka",
    }).format(new Date(`${value}T00:00:00+06:00`));
}

function verificationLabel(status: PublicIncident["verification_status"], t: (key: string) => string) {
    switch (status) {
        case "verified": return t("verified");
        case "partially_verified": return t("partiallyVerified");
        case "disputed": return t("disputed");
        default: return t("reported");
    }
}

function safeSearch(value: string) {
    return value.replace(/[(),]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

const PAGE_SIZE = 24;

export default async function IncidentsPage({ params, searchParams }: {
    params: Promise<{ locale: string }>;
    searchParams: SearchParams;
}) {
    const { locale } = await params;
    const filters = await searchParams;
    const t = await getTranslations("incidents");
    const supabase = await createClient();

    const page = Math.max(1, Number(filters.page) || 1);
    const q = safeSearch(filters.q?.trim() ?? "");

    const [categoriesResult, divisionsResult, districtsResult] = await Promise.all([
        supabase.from("public_categories").select("id,name,slug,description,sort_order").order("sort_order", { ascending: true }),
        supabase.from("public_divisions").select("id,name,slug,sort_order").order("sort_order", { ascending: true }),
        supabase.from("public_districts").select("id,name,slug,division_id,sort_order").order("sort_order", { ascending: true }),
    ]);

    if (categoriesResult.error || divisionsResult.error || districtsResult.error) {
        throw new Error("Unable to load incident filters.");
    }

    const categories = (categoriesResult.data ?? []) as Category[];
    const divisions = (divisionsResult.data ?? []) as Division[];
    const districts = (districtsResult.data ?? []) as District[];

    let query = supabase
        .from("public_incidents")
        .select("public_id,title,description,incident_date,category,category_slug,division,division_slug,district,district_slug,verification_status,published_at", { count: "exact" })
        .order("published_at", { ascending: false });

    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,public_id.ilike.%${q}%`);
    if (filters.category) query = query.eq("category_slug", filters.category);
    if (filters.division) query = query.eq("division_slug", filters.division);
    if (filters.district) query = query.eq("district_slug", filters.district);
    if (filters.verification) query = query.eq("verification_status", filters.verification);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error, count } = await query.range(from, to);

    if (error) throw new Error("Unable to load public incidents.");

    const incidents = (data ?? []) as PublicIncident[];
    const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

    const paramsForPage = (nextPage: number) => {
        const next = new URLSearchParams();
        if (q) next.set("q", q);
        if (filters.category) next.set("category", filters.category);
        if (filters.division) next.set("division", filters.division);
        if (filters.district) next.set("district", filters.district);
        if (filters.verification) next.set("verification", filters.verification);
        if (nextPage > 1) next.set("page", String(nextPage));
        return next.toString();
    };

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
                <form className="mb-4 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_auto]" method="get">
                    <input name="q" defaultValue={q} placeholder={t("searchPlaceholder")} className="h-11 rounded-xl border border-zinc-300 px-4 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" />
                    {filters.category && <input type="hidden" name="category" value={filters.category} />}
                    {filters.division && <input type="hidden" name="division" value={filters.division} />}
                    {filters.district && <input type="hidden" name="district" value={filters.district} />}
                    {filters.verification && <input type="hidden" name="verification" value={filters.verification} />}
                    <button className="h-11 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800" type="submit">{t("search")}</button>
                </form>

                <IncidentFilters
                    categories={categories}
                    divisions={divisions}
                    districts={districts}
                    values={{ category: filters.category ?? "", division: filters.division ?? "", district: filters.district ?? "", verification: filters.verification ?? "" }}
                    labels={{
                        category: t("category"), division: t("division"), district: t("district"), verification: t("verification"),
                        all: t("all"), verified: t("verified"), partiallyVerified: t("partiallyVerified"), disputed: t("disputed"), reported: t("reported"),
                        apply: t("apply"), clear: t("clear"),
                    }}
                />

                {incidents.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                        <h2 className="text-xl font-semibold">{t("emptyTitle")}</h2>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">{t("emptyDescription")}</p>
                    </div>
                ) : (
                    <>
                        <p className="mb-6 mt-8 text-sm text-zinc-500">{t("publishedCount", { count: count ?? incidents.length })}</p>
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {incidents.map((incident) => (
                                <Link key={incident.public_id} href={{ pathname: "/incidents/[public_id]", params: { public_id: incident.public_id ?? "" } }} className="group flex min-h-72 flex-col rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg">
                                    <div className="flex items-start justify-between gap-4">
                                        <span className="rounded-full border border-zinc-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">{incident.category ?? t("uncategorized")}</span>
                                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">{verificationLabel(incident.verification_status, t)}</span>
                                    </div>
                                    <h2 className="mt-7 line-clamp-3 text-xl font-semibold leading-7 tracking-[-0.02em] group-hover:underline group-hover:decoration-zinc-300 group-hover:underline-offset-4">{incident.title}</h2>
                                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500">{incident.description}</p>
                                    <div className="mt-auto grid grid-cols-2 gap-4 border-t border-zinc-200 pt-5">
                                        <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">{t("location")}</p><p className="mt-1 text-xs font-medium text-zinc-700">{[incident.district, incident.division].filter(Boolean).join(", ")}</p></div>
                                        <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">{t("date")}</p><p className="mt-1 text-xs font-medium text-zinc-700">{formatDate(incident.incident_date, locale)}</p></div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <nav className="mt-10 flex items-center justify-between" aria-label={t("pagination")}>
                                {page > 1 ? <Link href={`/incidents?${paramsForPage(page - 1)}`} className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold">{t("previous")}</Link> : <span />}
                                <span className="text-sm text-zinc-500">{t("pageOf", { page, totalPages })}</span>
                                {page < totalPages ? <Link href={`/incidents?${paramsForPage(page + 1)}`} className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold">{t("next")}</Link> : <span />}
                            </nav>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
