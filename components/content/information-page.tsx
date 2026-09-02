import { getTranslations } from "next-intl/server";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { IncidentLedgerSidebar } from "@/components/incident/incident-ledger-sidebar";
import { getHomeLedgerData } from "@/features/home/get-home-ledgers";

const sectionKeys = ["section1", "section2", "section3", "section4"] as const;

type InformationPageProps = {
    namespace: string;
};

export async function InformationPage({ namespace }: InformationPageProps) {
    const t = await getTranslations(`sitePages.${namespace}`);
    const tc = await getTranslations("common");
    const ledgers = await getHomeLedgerData();

    return (
        <main className="flex-1 bg-stone-50 text-zinc-950">
            <section className="border-b border-zinc-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
                    <Breadcrumbs items={[{ label: t("title") }]} />
                </div>
            </section>

            <section>
                <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                        <div>
                            <div className="mb-8">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{t("eyebrow")}</p>
                                <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">{t("title")}</h1>
                                <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600 sm:text-xl">{t("intro")}</p>
                            </div>

                            <div className="divide-y divide-zinc-200 overflow-hidden border border-zinc-200 bg-white shadow-sm">
                                {sectionKeys.map((key) => (
                                    <article key={key} className="p-6 sm:p-8 lg:p-10">
                                        <h2 className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">{t(`${key}Title`)}</h2>
                                        <p className="mt-4 text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8">{t(`${key}Body`)}</p>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div aria-label={tc("incidentLedger")}>
                            <IncidentLedgerSidebar ledgers={ledgers} />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
