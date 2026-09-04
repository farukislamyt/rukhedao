import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IncidentCard } from "@/components/incident/incident-card";
import { IncidentLedgerSidebar } from "@/components/incident/incident-ledger-sidebar";
import { ReportIncidentForm } from "@/components/incident/report-incident-form";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getRelatedPublishedIncidents } from "@/features/incidents/get-related-incidents";
import { getHomeLedgerData } from "@/features/home/get-home-ledgers";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl, cleanDescription, SITE_NAME } from "@/lib/seo";
import type { Tables } from "@/types/database";

type PublicIncident = Tables<"public_incidents">;

function formatDate(value: string | null) {
    if (!value) return "";
    return new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" }).format(new Date(`${value}T00:00:00+06:00`));
}

const getPublicIncident = cache(async (public_id: string): Promise<PublicIncident | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("public_incidents")
        .select("public_id,title,description,incident_date,category,category_slug,division,division_slug,district,district_slug,verification_status,published_at")
        .eq("public_id", public_id)
        .maybeSingle();

    if (error || !data) return null;
    return data as PublicIncident;
});

export async function generateMetadata({ params }: { params: Promise<{ public_id: string }> }): Promise<Metadata> {
    const { public_id } = await params;
    const data = await getPublicIncident(public_id);
    if (!data) return { title: SITE_NAME };

    const location = [data.district, data.division].filter(Boolean).join(", ");
    const date = formatDate(data.incident_date);
    const details = [location, date].filter(Boolean).join(" · ");
    const baseTitle = data.title ?? "ঘটনা";
    const title = details ? `${baseTitle} — ${details}` : baseTitle;
    const description = cleanDescription(data.description);
    const path = `/incidents/${encodeURIComponent(public_id)}`;
    return {
        title,
        description,
        alternates: { canonical: path },
        robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
        openGraph: { title, description, type: "article", locale: "bn_BD", url: absoluteUrl(path), siteName: SITE_NAME, publishedTime: data.published_at ?? undefined },
        twitter: { card: "summary", title, description },
    };
}

export default async function IncidentDetailPage({ params }: { params: Promise<{ public_id: string }> }) {
    const { public_id } = await params;
    const [data, ledgers] = await Promise.all([
        getPublicIncident(public_id),
        getHomeLedgerData(),
    ]);

    if (!data) notFound();

    const incident = data;
    const relatedIncidents = await getRelatedPublishedIncidents(incident, 6);
    const location = [incident.district, incident.division].filter(Boolean).join(", ");
    const path = `/incidents/${encodeURIComponent(incident.public_id ?? public_id)}`;
    const description = cleanDescription(incident.description);
    const categoryHref = incident.category_slug ? `/incidents?category=${encodeURIComponent(incident.category_slug)}` : null;
    const districtHref = incident.district_slug ? `/incidents?district=${encodeURIComponent(incident.district_slug)}` : null;
    const divisionHref = incident.division_slug ? `/incidents?division=${encodeURIComponent(incident.division_slug)}` : null;
    const breadcrumbItems = [
        { label: "প্রকাশিত ঘটনা", href: "/incidents" },
        ...(incident.category && categoryHref ? [{ label: incident.category, href: categoryHref }] : []),
        ...(incident.district && districtHref ? [{ label: incident.district, href: districtHref }] : []),
        { label: incident.public_id ?? public_id },
    ];
    const breadcrumbJsonLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "প্রচ্ছদ", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "প্রকাশিত ঘটনা", item: absoluteUrl("/incidents") }, ...(incident.category && categoryHref ? [{ "@type": "ListItem", position: 3, name: incident.category, item: absoluteUrl(categoryHref) }] : []), ...(incident.district && districtHref ? [{ "@type": "ListItem", position: 4, name: incident.district, item: absoluteUrl(districtHref) }] : []), { "@type": "ListItem", position: 5, name: incident.title ?? incident.public_id ?? "ঘটনা", item: absoluteUrl(path) }] };
    const pageJsonLd = { "@context": "https://schema.org", "@type": "WebPage", name: incident.title ?? "ঘটনার নথি", description, url: absoluteUrl(path), inLanguage: "bn-BD", datePublished: incident.published_at ?? undefined, isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") }, about: { "@type": "Thing", name: incident.category ?? "জনস্বার্থসংশ্লিষ্ট ঘটনা" }, spatialCoverage: location ? { "@type": "Place", name: location } : undefined, identifier: incident.public_id ?? public_id };

    return (
        <main className="flex-1 bg-stone-50 text-zinc-950">
            <section className="border-b border-zinc-200 bg-white"><div className="mx-auto max-w-7xl px-6 py-5 lg:px-8"><Breadcrumbs items={breadcrumbItems} homeLabel="প্রচ্ছদ" ariaLabel="ঘটনার অবস্থান" /></div></section>
            <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                    <div>
                        <article className="overflow-hidden border border-zinc-200 bg-white shadow-sm">
                            <header className="border-b border-zinc-200 px-6 py-8 sm:px-10 sm:py-10">
                                <div className="flex flex-wrap items-center gap-2">
                                    {incident.category && categoryHref ? <Link href={categoryHref} className="border border-zinc-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-zinc-600 hover:border-zinc-300 hover:text-zinc-950">{incident.category}</Link> : incident.category && <span className="border border-zinc-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-zinc-600">{incident.category}</span>}
                                </div>
                                <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">{incident.title}</h1>
                                <div className="mt-7 grid gap-5 border-t border-zinc-200 pt-6 sm:grid-cols-3">
                                    <div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">পরিচিতি নম্বর</p><p className="mt-1 break-all font-mono text-xs text-zinc-700">{incident.public_id}</p></div>
                                    <div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">ঘটনার তারিখ</p><p className="mt-1 text-sm font-medium text-zinc-700">{formatDate(incident.incident_date)}</p></div>
                                    <div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">স্থান</p><p className="mt-1 text-sm font-medium text-zinc-700">{location}</p></div>
                                </div>
                            </header>
                            <div className="px-6 py-8 sm:px-10 sm:py-10"><p className="whitespace-pre-wrap text-base leading-8 text-zinc-700 sm:text-lg">{incident.description}</p></div>
                            <footer className="border-t border-zinc-200 bg-stone-50 px-6 py-6 sm:px-10">
                                <div className="flex flex-col gap-4 text-xs leading-5 text-zinc-500">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>এটি জনসাধারণের জন্য প্রকাশিত একটি ঘটনার নথি।</p><p>প্রকাশিত হয়েছে {formatDate(incident.published_at?.slice(0, 10) ?? null)}</p></div>
                                    <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-4">
                                        {incident.category && categoryHref && <Link href={categoryHref} className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 font-semibold text-zinc-700 hover:border-zinc-400">এই ধরনের আরও ঘটনা</Link>}
                                        {incident.district && districtHref && <Link href={districtHref} className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 font-semibold text-zinc-700 hover:border-zinc-400">এই জেলার আরও ঘটনা</Link>}
                                        {incident.division && divisionHref && <Link href={divisionHref} className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 font-semibold text-zinc-700 hover:border-zinc-400">এই বিভাগের আরও ঘটনা</Link>}
                                    </div>
                                </div>
                            </footer>
                        </article>

                        <section className="mt-8" aria-labelledby="related-incidents-heading">
                            <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">আরও নথি</p><h2 id="related-incidents-heading" className="mt-2 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">আরও সম্পর্কিত ঘটনা</h2><p className="mt-2 text-sm leading-6 text-zinc-500">একই ধরন, এলাকা ও কাছাকাছি সময়ের প্রকাশিত নথিগুলো।</p></div><Link href="/incidents" className="shrink-0 text-sm font-semibold text-zinc-800 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900">সব ঘটনা →</Link></div>
                            {relatedIncidents.length > 0 ? <div className="grid gap-5 md:grid-cols-2">{relatedIncidents.map((item) => <IncidentCard key={item.public_id} incident={item} />)}</div> : <div className="border border-dashed border-zinc-300 bg-white px-6 py-12 text-center"><p className="text-sm text-zinc-500">এই ঘটনার সঙ্গে মিল আছে এমন আরও প্রকাশিত নথি এখনো নেই।</p></div>}
                        </section>

                        <section className="mt-8 border border-zinc-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="report-record-heading"><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">প্রতিক্রিয়া জানান</p><h2 id="report-record-heading" className="mt-3 text-2xl font-semibold tracking-[-0.02em]">এই নথিতে কোনো সমস্যা জানাতে চান?</h2><p className="mt-2 text-sm leading-6 text-zinc-500">ভুল তথ্য, একই ঘটনার পুনরাবৃত্তি বা অন্য কোনো সমস্যা জানাতে নিচের ফর্মটি ব্যবহার করুন।</p></div><ReportIncidentForm publicId={incident.public_id ?? public_id} labels={{ title: "এই নথিতে কোনো সমস্যা জানাতে চান?", description: "বিস্তারিত", reason: "কারণ", reasonPlaceholder: "কারণ বেছে নিন", descriptionPlaceholder: "সমস্যাটি সংক্ষেপে লিখুন", submit: "জমা দিন", submitting: "জমা দেওয়া হচ্ছে…", success: "আপনার প্রতিক্রিয়া জমা হয়েছে।", error: "তথ্য যাচাই করে আবার চেষ্টা করুন।", reasons: { false_or_misleading: "ভুল বা বিভ্রান্তিকর তথ্য", privacy_concern: "গোপনীয়তার সমস্যা", harmful_content: "ক্ষতিকর বিষয়বস্তু", duplicate: "একই ঘটনা আবার দেওয়া হয়েছে", wrong_location: "ভুল স্থান", wrong_date: "ভুল তারিখ", other: "অন্য কারণ" } }} /></section>
                    </div>
                    <IncidentLedgerSidebar ledgers={ledgers} />
                </div>
            </section>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
        </main>
    );
}
