import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IncidentLedgerSidebar } from "@/components/incident/incident-ledger-sidebar";
import { ReportIncidentForm } from "@/components/incident/report-incident-form";
import { getHomeLedgerData } from "@/features/home/get-home-ledgers";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl, cleanDescription, SITE_NAME } from "@/lib/seo";
import type { Tables } from "@/types/database";

type PublicIncident = Tables<"public_incidents">;

function formatDate(value: string | null) {
    if (!value) return "";
    return new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" }).format(new Date(`${value}T00:00:00+06:00`));
}

export async function generateMetadata({ params }: { params: Promise<{ public_id: string }> }): Promise<Metadata> {
    const { public_id } = await params;
    const supabase = await createClient();
    const { data } = await supabase.from("public_incidents").select("title,description,category,division,district,incident_date,published_at").eq("public_id", public_id).maybeSingle();
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
    const supabase = await createClient();
    const [{ data, error }, ledgers] = await Promise.all([supabase.from("public_incidents").select("public_id,title,description,incident_date,category,category_slug,division,division_slug,district,district_slug,published_at").eq("public_id", public_id).maybeSingle(), getHomeLedgerData()]);
    if (error || !data) notFound();
    const incident = data as PublicIncident;
    const location = [incident.district, incident.division].filter(Boolean).join(", ");
    const path = `/incidents/${encodeURIComponent(incident.public_id ?? public_id)}`;
    const description = cleanDescription(incident.description);
    const breadcrumbJsonLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "প্রচ্ছদ", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "প্রকাশিত ঘটনা", item: absoluteUrl("/incidents") }, { "@type": "ListItem", position: 3, name: incident.title ?? incident.public_id ?? "ঘটনা", item: absoluteUrl(path) }] };
    const pageJsonLd = { "@context": "https://schema.org", "@type": "WebPage", name: incident.title ?? "ঘটনার নথি", description, url: absoluteUrl(path), inLanguage: "bn-BD", datePublished: incident.published_at ?? undefined, isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") }, about: { "@type": "Thing", name: incident.category ?? "জনস্বার্থসংশ্লিষ্ট ঘটনা" }, spatialCoverage: location ? { "@type": "Place", name: location } : undefined, identifier: incident.public_id ?? public_id };
    return <main className="flex-1 bg-stone-50 text-zinc-950"><section className="border-b border-zinc-200 bg-white"><div className="mx-auto max-w-7xl px-6 py-5 lg:px-8"><nav aria-label="ঘটনাগুলো" className="text-sm"><ol className="flex items-center gap-2 text-zinc-500"><li><Link href="/" className="hover:text-zinc-950 hover:underline hover:underline-offset-4">প্রচ্ছদ</Link></li><li aria-hidden="true">/</li><li><Link href="/incidents" className="hover:text-zinc-950 hover:underline hover:underline-offset-4">ঘটনাগুলো</Link></li><li aria-hidden="true">/</li><li aria-current="page" className="font-medium text-zinc-950">{incident.public_id}</li></ol></nav></div></section><section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14"><div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"><div><article className="overflow-hidden border border-zinc-200 bg-white shadow-sm"><header className="border-b border-zinc-200 px-6 py-8 sm:px-10 sm:py-10"><div className="flex flex-wrap items-center gap-2">{incident.category && <span className="border border-zinc-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-zinc-600">{incident.category}</span>}</div><h1 className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">{incident.title}</h1><div className="mt-7 grid gap-5 border-t border-zinc-200 pt-6 sm:grid-cols-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">পরিচিতি নম্বর</p><p className="mt-1 break-all font-mono text-xs text-zinc-700">{incident.public_id}</p></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">ঘটনার তারিখ</p><p className="mt-1 text-sm font-medium text-zinc-700">{formatDate(incident.incident_date)}</p></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">স্থান</p><p className="mt-1 text-sm font-medium text-zinc-700">{location}</p></div></div></header><div className="px-6 py-8 sm:px-10 sm:py-10"><p className="whitespace-pre-wrap text-base leading-8 text-zinc-700 sm:text-lg">{incident.description}</p></div><footer className="border-t border-zinc-200 bg-stone-50 px-6 py-6 sm:px-10"><div className="flex flex-col gap-3 text-xs leading-5 text-zinc-500 sm:flex-row sm:items-center sm:justify-between"><p>এটি জনসাধারণের জন্য প্রকাশিত একটি ঘটনার নথি।</p><p>প্রকাশিত হয়েছে {formatDate(incident.published_at?.slice(0, 10) ?? null)}</p></div></footer></article><section className="mt-8 border border-zinc-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="report-record-heading"><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">প্রতিক্রিয়া জানান</p><h2 id="report-record-heading" className="mt-3 text-2xl font-semibold tracking-[-0.02em]">এই নথিতে কোনো সমস্যা জানাতে চান?</h2><p className="mt-2 text-sm leading-6 text-zinc-500">ভুল তথ্য, একই ঘটনার পুনরাবৃত্তি বা অন্য কোনো সমস্যা জানাতে নিচের ফর্মটি ব্যবহার করুন।</p></div><ReportIncidentForm publicId={incident.public_id ?? public_id} labels={{ title: "এই নথিতে কোনো সমস্যা জানাতে চান?", description: "বিস্তারিত", reason: "কারণ", reasonPlaceholder: "কারণ বেছে নিন", descriptionPlaceholder: "সমস্যাটি সংক্ষেপে লিখুন", submit: "জমা দিন", submitting: "জমা দেওয়া হচ্ছে…", success: "আপনার প্রতিক্রিয়া জমা হয়েছে।", error: "তথ্য যাচাই করে আবার চেষ্টা করুন।", reasons: { false_or_misleading: "ভুল বা বিভ্রান্তিকর তথ্য", privacy_concern: "গোপনীয়তার সমস্যা", harmful_content: "ক্ষতিকর বিষয়বস্তু", duplicate: "একই ঘটনা আবার দেওয়া হয়েছে", wrong_location: "ভুল স্থান", wrong_date: "ভুল তারিখ", other: "অন্য কারণ" } }} /></section></div><IncidentLedgerSidebar ledgers={ledgers} /></div></section><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} /></main>;
}
