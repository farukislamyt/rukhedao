import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { getHomeLedgerData } from "@/features/home/get-home-ledgers";
import { getRecentPublishedIncidents } from "@/features/home/get-recent-incidents";

function formatIncidentDate(value: string | null) {
    if (!value) return "";
    return new Intl.DateTimeFormat("bn-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Dhaka",
    }).format(new Date(`${value}T00:00:00+06:00`));
}

export default async function HomePage() {
    const t = await getTranslations("home");
    const ti = await getTranslations("incidents");
    const [incidents, ledgers] = await Promise.all([
        getRecentPublishedIncidents(20),
        getHomeLedgerData(),
    ]);

    return (
        <main className="flex-1 bg-stone-50 text-zinc-950">
            <section className="relative overflow-hidden border-b border-zinc-200 bg-stone-50">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
                <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:py-24">
                    <div className="max-w-3xl">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600 backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />{t("badge")}</div>
                        <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">{t("title")}</h1>
                        <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl">{t("description")}</p>
                        <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/incident/new" className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2">{t("reportIncident")}</Link><Link href="/incidents" className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2">{t("viewIncidents")}</Link></div>
                    </div>
                    <div className="relative mx-auto w-full max-w-lg lg:justify-self-end"><div className="rounded-[2rem] border border-zinc-300 bg-white p-3 shadow-[0_24px_70px_rgba(24,24,27,0.12)]"><div className="rounded-[1.5rem] border border-zinc-200 bg-stone-50 p-6 sm:p-8"><div className="flex items-center justify-between border-b border-zinc-200 pb-5"><span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{t("recordLabel")}</span><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{t("published")}</span></div><div className="mt-7 space-y-6"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">{t("recordId")}</p><p className="mt-2 font-mono text-sm text-zinc-700">RK-XXXXXXXXXXXX</p></div><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">{t("recordTitle")}</p><div className="mt-2 h-3 w-11/12 rounded bg-zinc-200" /><div className="mt-2 h-3 w-8/12 rounded bg-zinc-200" /></div><div className="grid grid-cols-2 gap-5 border-t border-zinc-200 pt-5"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">{t("location")}</p><p className="mt-2 text-sm font-medium text-zinc-800">{t("sampleLocation")}</p></div><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">{t("verification")}</p><p className="mt-2 text-sm font-medium text-zinc-800">{t("sampleVerification")}</p></div></div></div></div></div><div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-zinc-300 bg-white px-4 py-3 shadow-lg sm:block"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">{t("anonymousLabel")}</p><p className="mt-1 text-sm font-semibold text-zinc-800">{t("anonymousValue")}</p></div></div>
                </div>
            </section>

            <section className="border-b border-zinc-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{t("recentLabel")}</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{t("recentTitle")}</h2></div>
                        <Link href="/incidents" className="text-sm font-semibold text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900">{t("viewAll")}</Link>
                    </div>
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                        <div>{incidents.length > 0 ? <div className="grid gap-5 md:grid-cols-2">{incidents.map((incident) => <Link key={incident.public_id} href={`/incidents/${incident.public_id}`} className="group rounded-2xl border border-zinc-200 bg-stone-50 p-6 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white hover:shadow-lg"><div className="flex items-center justify-between gap-4"><span className="truncate rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-600">{incident.category ?? t("sampleCategory")}</span><span className="shrink-0 font-mono text-[10px] text-zinc-400">{incident.public_id}</span></div><h3 className="mt-7 line-clamp-3 text-lg font-semibold leading-7 group-hover:underline group-hover:decoration-zinc-300 group-hover:underline-offset-4">{incident.title ?? t("sampleIncidentTitle")}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">{incident.description ?? ""}</p><div className="mt-8 flex items-center justify-between border-t border-zinc-200 pt-4 text-xs text-zinc-500"><span>{[incident.district, incident.division].filter(Boolean).join(", ")}</span><span>{formatIncidentDate(incident.incident_date)}</span></div></Link>)}</div> : <div className="border border-dashed border-zinc-300 bg-stone-50 px-6 py-14 text-center"><p className="text-sm text-zinc-500">{t("noRecentIncidents")}</p></div>}</div>
                        <aside className="space-y-8 lg:sticky lg:top-24">
                            <div><div className="border-b border-zinc-200 pb-4"><h3 className="text-xl font-semibold tracking-[-0.02em]">{ti("division")}</h3></div><div className="divide-y divide-zinc-200 border-b border-zinc-200">{ledgers.divisions.map((item) => <div key={item.name} className="flex items-center justify-between gap-4 py-3"><span className="min-w-0 truncate text-sm font-medium text-zinc-800">{item.name}</span><span className="shrink-0 font-mono text-sm text-zinc-500">{item.count}</span></div>)}</div></div>
                            <div><div className="border-b border-zinc-200 pb-4"><h3 className="text-xl font-semibold tracking-[-0.02em]">{ti("category")}</h3></div><div className="divide-y divide-zinc-200 border-b border-zinc-200">{ledgers.categories.map((item) => <div key={item.name} className="flex items-center justify-between gap-4 py-3"><span className="min-w-0 truncate text-sm font-medium text-zinc-800">{item.name}</span><span className="shrink-0 font-mono text-sm text-zinc-500">{item.count}</span></div>)}</div></div>
                        </aside>
                    </div>
                </div>
            </section>
        </main>
    );
}
