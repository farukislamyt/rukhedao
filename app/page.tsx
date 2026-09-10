import type { Metadata } from "next";
import Link from "next/link";

import { IncidentCard } from "@/components/incident/incident-card";
import { IncidentLedgerSidebar } from "@/components/incident/incident-ledger-sidebar";
import { getHomeLedgerData } from "@/features/home/get-home-ledgers";
import { getRecentPublishedIncidents } from "@/features/home/get-recent-incidents";
import { SITE_DESCRIPTION } from "@/lib/seo";

export const metadata: Metadata = {
    title: "রুখেদাও — যা ঘটেছে, তা নথিভুক্ত হোক",
    description: SITE_DESCRIPTION,
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
    openGraph: { title: "রুখেদাও — যা ঘটেছে, তা নথিভুক্ত হোক", description: SITE_DESCRIPTION, type: "website", locale: "bn_BD", url: "/" },
};

export default async function HomePage() {
    const [incidents, ledgers] = await Promise.all([getRecentPublishedIncidents(20), getHomeLedgerData()]);
    const latest = incidents[0] ?? null;
    const totalPublished = ledgers.categories.reduce((sum, item) => sum + item.count, 0);
    const topCategories = ledgers.categories.slice(0, 6);
    const latestLocation = latest ? [latest.district, latest.division].filter(Boolean).join(", ") : "";
    const latestHref = latest?.public_id ? `/incidents/${encodeURIComponent(latest.public_id)}` : "/incidents";

    return (
        <main className="flex-1 bg-stone-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
            <section className="relative overflow-hidden border-b border-zinc-200 bg-stone-50 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.035)_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)]" />
                <div className="relative mx-auto grid w-full max-w-[96rem] items-start gap-8 px-4 py-10 lg:grid-cols-[1.08fr_.92fr] lg:px-6 lg:py-14">
                    <div className="max-w-3xl">
                        <div className="mb-4 inline-flex items-center gap-2 border border-zinc-300 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
                            <span className="h-1.5 w-1.5 bg-emerald-600 dark:bg-emerald-400" />
                            পরিচয় গোপন রেখে জনস্বার্থের ঘটনা জানান
                        </div>
                        <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                            যা ঘটেছে, তা নথিভুক্ত হোক।
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400 sm:text-xl">
                            রুখেদাও পরিচয় গোপন রেখে গুরুত্বপূর্ণ ঘটনা জানানো, পর্যালোচনা, যাচাই এবং জনসাধারণের জন্য নথিভুক্ত করার সুযোগ দেয়।
                        </p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/incident/new"
                                className="inline-flex h-12 items-center justify-center bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                            >
                                ঘটনা জানান
                            </Link>
                            <Link
                                href="/incidents"
                                className="inline-flex h-12 items-center justify-center border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                            >
                                ঘটনাগুলো দেখুন
                            </Link>
                            <Link
                                href="/how-it-works"
                                className="inline-flex h-12 items-center justify-center px-4 text-sm font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-300 dark:decoration-zinc-700 dark:hover:decoration-white"
                            >
                                যেভাবে কাজ করে
                            </Link>
                        </div>
                        <dl className="mt-6 grid grid-cols-3 divide-x divide-zinc-200 border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="px-4 py-3">
                                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">প্রকাশিত নথি</dt>
                                <dd className="mt-1 text-xl font-bold tabular-nums">{totalPublished > 0 ? totalPublished.toLocaleString("bn-BD") : incidents.length.toLocaleString("bn-BD")}</dd>
                            </div>
                            <div className="px-4 py-3">
                                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">বিভাগ</dt>
                                <dd className="mt-1 text-xl font-bold tabular-nums">{ledgers.divisions.length.toLocaleString("bn-BD")}</dd>
                            </div>
                            <div className="px-4 py-3">
                                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">ঘটনার ধরন</dt>
                                <dd className="mt-1 text-xl font-bold tabular-nums">{ledgers.categories.length.toLocaleString("bn-BD")}</dd>
                            </div>
                        </dl>
                        <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                            পরিচয় গোপন থাকে · প্রকাশের আগে পর্যালোচনা হয় · যাচাইয়ের অবস্থা নথিতে দেখানো হয়
                        </p>
                    </div>

                    <div className="relative mx-auto w-full max-w-lg lg:justify-self-end">
                        <div className="border border-zinc-300 bg-white p-2 shadow-[0_24px_70px_rgba(24,24,27,0.12)] dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="border border-zinc-200 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
                                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
                                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">সর্বশেষ প্রকাশিত নথি</span>
                                    <span className="bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">প্রকাশিত</span>
                                </div>
                                {latest ? (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="max-w-[70%] truncate border border-emerald-200 bg-emerald-50/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                {latest.category ?? "ঘটনার ধরন"}
                                            </span>
                                            <span className="shrink-0 font-mono text-[11px] font-medium text-zinc-400 dark:text-zinc-500">{latest.public_id}</span>
                                        </div>
                                        <Link href={latestHref} className="mt-3 block text-lg font-bold leading-snug tracking-tight hover:text-emerald-700 dark:hover:text-emerald-400">
                                            <span className="line-clamp-2">{latest.title ?? "প্রকাশিত ঘটনার নথি"}</span>
                                        </Link>
                                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{latest.description ?? ""}</p>
                                        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                                            <div>
                                                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">স্থান</p>
                                                <p className="mt-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">{latestLocation || "স্থান উল্লেখ নেই"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">পরিচিতি</p>
                                                <p className="mt-1 font-mono text-sm font-medium text-zinc-800 dark:text-zinc-200">{latest.public_id}</p>
                                            </div>
                                        </div>
                                        <Link href={latestHref} className="mt-4 inline-flex h-10 items-center justify-center bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
                                            নথিটি দেখুন →
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="mt-4 border border-dashed border-zinc-300 px-4 py-8 text-center dark:border-zinc-700">
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">এখনও কোনো প্রকাশিত ঘটনা পাওয়া যায়নি।</p>
                                        <Link href="/incidents" className="mt-3 inline-block text-sm font-semibold underline underline-offset-4">ঘটনাগুলো দেখুন →</Link>
                                    </div>
                                )}
                                {topCategories.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                                        {topCategories.map((item) => (
                                            <Link
                                                key={item.slug ?? item.name}
                                                href={item.slug ? `/incidents?category=${encodeURIComponent(item.slug)}` : "/incidents"}
                                                className="border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:border-zinc-400 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-white"
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mx-auto max-w-[96rem] px-4 py-10 lg:px-6">
                    <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">জনসাধারণের নথি</p>
                            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">সাম্প্রতিক প্রকাশিত ঘটনা</h2>
                        </div>
                        <Link href="/incidents" className="text-sm font-semibold text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900 dark:text-white dark:decoration-zinc-700 dark:hover:decoration-white">
                            সব ঘটনা দেখুন →
                        </Link>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                        <div>
                            {incidents.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                    {incidents.map((incident) => (
                                        <IncidentCard key={incident.public_id} incident={incident} />
                                    ))}
                                </div>
                            ) : (
                                <div className="border border-dashed border-zinc-300 bg-stone-50 px-6 py-14 text-center dark:border-zinc-800 dark:bg-zinc-950">
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">এখনও কোনো প্রকাশিত ঘটনা পাওয়া যায়নি।</p>
                                </div>
                            )}
                        </div>
                        <IncidentLedgerSidebar ledgers={ledgers} />
                    </div>
                </div>
            </section>
        </main>
    );
}
