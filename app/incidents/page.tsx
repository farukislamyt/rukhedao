import type { Metadata } from "next";
import Link from "next/link";
import { IncidentCard } from "@/components/incident/incident-card";
import { IncidentFilters } from "@/components/incident/incident-filters";
import { IncidentLedgerSidebar } from "@/components/incident/incident-ledger-sidebar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getHomeLedgerData } from "@/features/home/get-home-ledgers";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import type { Tables } from "@/types/database";

type PublicIncident = Tables<"public_incidents">;
type Category = Tables<"public_categories">;
type Division = Tables<"public_divisions">;
type District = Tables<"public_districts">;
type SearchParams = Promise<{ q?: string; category?: string; division?: string; district?: string; page?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
    const filters = await searchParams;
    const hasFilters = Boolean(filters.q || filters.category || filters.division || filters.district || (Number(filters.page) || 1) > 1);
    return {
        title: "প্রকাশিত ঘটনা",
        description: "রুখেদাও-তে পর্যালোচনা ও অনুমোদনের পর প্রকাশিত জনস্বার্থসংশ্লিষ্ট ঘটনাগুলোর নথি দেখুন।",
        alternates: { canonical: "/incidents" },
        robots: hasFilters ? { index: false, follow: true, googleBot: { index: false, follow: true } } : { index: true, follow: true },
    };
}

function safeSearch(value: string) {
    return value.replace(/[(),]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

const PAGE_SIZE = 24;

export default async function IncidentsPage({ searchParams }: { searchParams: SearchParams }) {
    const filters = await searchParams;
    const supabase = await createClient();
    const page = Math.max(1, Number(filters.page) || 1);
    const q = safeSearch(filters.q?.trim() ?? "");
    const [categoriesResult, divisionsResult, districtsResult, ledgers] = await Promise.all([
        supabase.from("public_categories").select("id,name,slug,description,sort_order").order("sort_order", { ascending: true }),
        supabase.from("public_divisions").select("id,name,slug,sort_order").order("sort_order", { ascending: true }),
        supabase.from("public_districts").select("id,name,slug,sort_order,division_id").order("sort_order", { ascending: true }),
        getHomeLedgerData(),
    ]);
    if (categoriesResult.error || divisionsResult.error || districtsResult.error) throw new Error("Unable to load incident filters.");
    const categories = (categoriesResult.data ?? []).filter((item): item is Category => item.id !== null && item.name !== null);
    const divisions = (divisionsResult.data ?? []).filter((item): item is Division => item.id !== null && item.name !== null);
    const districts = (districtsResult.data ?? []).filter((item): item is District => item.id !== null && item.name !== null && item.division_id !== null);

    let query = supabase.from("public_incidents").select("public_id,title,description,incident_date,category,category_slug,division,division_slug,district,district_slug,verification_status,published_at", { count: "exact" }).order("published_at", { ascending: false });
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,public_id.ilike.%${q}%`);
    if (filters.category) query = query.eq("category_slug", filters.category);
    if (filters.division) query = query.eq("division_slug", filters.division);
    if (filters.district) query = query.eq("district_slug", filters.district);

    const from = (page - 1) * PAGE_SIZE;
    const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error("Unable to load public incidents.");
    const incidents = (data ?? []) as PublicIncident[];
    const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
    const hasActiveFilters = Boolean(q || filters.category || filters.division || filters.district);
    const paramsForPage = (nextPage: number) => {
        const next = new URLSearchParams();
        if (q) next.set("q", q);
        if (filters.category) next.set("category", filters.category);
        if (filters.division) next.set("division", filters.division);
        if (filters.district) next.set("district", filters.district);
        if (nextPage > 1) next.set("page", String(nextPage));
        return next.toString();
    };
    const breadcrumbJsonLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "প্রচ্ছদ", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "প্রকাশিত ঘটনা", item: absoluteUrl("/incidents") }] };
    const pageJsonLd = { "@context": "https://schema.org", "@type": "CollectionPage", name: "প্রকাশিত ঘটনা", description: SITE_DESCRIPTION, url: absoluteUrl("/incidents"), inLanguage: "bn-BD", isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") } };

    return (
        <main className="flex-1 bg-stone-50 text-zinc-950">
            <section className="border-b border-zinc-200 bg-white"><div className="mx-auto max-w-7xl px-6 py-5 lg:px-8"><Breadcrumbs items={[{ label: "প্রকাশিত ঘটনা" }]} homeLabel="প্রচ্ছদ" /></div></section>
            <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                    <div>
                        <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">জনসাধারণের নথি</p><h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">প্রকাশিত ঘটনা</h1><p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">পর্যালোচনা ও অনুমোদনের পর প্রকাশিত ঘটনাগুলোর নথি দেখুন।</p></div>
                        <form className="mb-4 grid gap-3 border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_auto]" method="get"><input name="q" defaultValue={q} placeholder="ঘটনা, বিবরণ বা পরিচিতি নম্বর দিয়ে খুঁজুন" aria-label="ঘটনা খুঁজুন" className="h-11 border border-zinc-300 px-4 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" />{filters.category && <input type="hidden" name="category" value={filters.category} />}{filters.division && <input type="hidden" name="division" value={filters.division} />}{filters.district && <input type="hidden" name="district" value={filters.district} />}<button className="h-11 bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800" type="submit">খুঁজুন</button></form>
                        <IncidentFilters categories={categories} divisions={divisions} districts={districts} values={{ category: filters.category ?? "", division: filters.division ?? "", district: filters.district ?? "" }} labels={{ category: "ঘটনার ধরন", division: "বিভাগ", district: "জেলা", all: "সব", apply: "প্রয়োগ করুন", clear: "মুছে ফেলুন" }} />
                        {incidents.length === 0 ? <div className="mt-8 border border-dashed border-zinc-300 bg-white px-6 py-16 text-center"><h2 className="text-xl font-semibold">{hasActiveFilters ? "এই অনুসন্ধানে কোনো ঘটনা পাওয়া যায়নি" : "এখনও কোনো প্রকাশিত ঘটনা নেই"}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">{hasActiveFilters ? "অনুসন্ধানের শব্দ বা ফিল্টার বদলে আবার চেষ্টা করুন।" : "অনুমোদিত ও প্রকাশিত ঘটনাগুলো এখানে দেখা যাবে।"}</p>{hasActiveFilters && <Link href="/incidents" className="mt-6 inline-flex h-10 items-center border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50">সব ফিল্টার মুছে ফেলুন</Link>}</div> : <><div className="mb-6 mt-8 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-zinc-500">{count ?? incidents.length}টি প্রকাশিত ঘটনা</p>{hasActiveFilters && <Link href="/incidents" className="text-sm font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900">ফিল্টার মুছে ফেলুন</Link>}</div><div className="grid gap-5 md:grid-cols-2">{incidents.map((incident) => <IncidentCard key={incident.public_id} incident={incident} />)}</div>{totalPages > 1 && <nav className="mt-10 flex items-center justify-between" aria-label="ঘটনার পৃষ্ঠা">{page > 1 ? <Link href={`/incidents?${paramsForPage(page - 1)}`} className="border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold">আগের</Link> : <span />}{<span className="text-sm text-zinc-500">পৃষ্ঠা {page} / {totalPages}</span>}{page < totalPages ? <Link href={`/incidents?${paramsForPage(page + 1)}`} className="border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold">পরের</Link> : <span />}</nav>}</>}
                    </div>
                    <IncidentLedgerSidebar ledgers={ledgers} />
                </div>
            </section>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
        </main>
    );
}
