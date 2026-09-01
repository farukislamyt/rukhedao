import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("report");
    return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ReportPage() {
    const t = await getTranslations("report");

    return (
        <main className="flex-1 bg-stone-50 text-zinc-950">
            <section className="border-b border-zinc-200 bg-white">
                <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8 lg:py-20">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{t("eyebrow")}</p>
                    <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{t("title")}</h1>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">{t("description")}</p>
                </div>
            </section>
            <section className="mx-auto max-w-4xl px-6 py-10 lg:px-8 lg:py-14">
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
                    <div className="mb-9 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                        <h2 className="font-semibold text-emerald-950">{t("privacyTitle")}</h2>
                        <p className="mt-2 text-sm leading-6 text-emerald-900/75">{t("privacyDescription")}</p>
                    </div>
                    <form className="space-y-7">
                        <div>
                            <label htmlFor="title" className="text-sm font-semibold text-zinc-900">{t("incidentTitle")}</label>
                            <input id="title" name="title" required maxLength={200} className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" placeholder={t("titlePlaceholder")} />
                        </div>
                        <div>
                            <label htmlFor="description" className="text-sm font-semibold text-zinc-900">{t("descriptionLabel")}</label>
                            <textarea id="description" name="description" required rows={8} className="mt-2 w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" placeholder={t("descriptionPlaceholder")} />
                        </div>
                        <div className="grid gap-7 sm:grid-cols-2">
                            <div>
                                <label htmlFor="incident-date" className="text-sm font-semibold text-zinc-900">{t("dateLabel")}</label>
                                <input id="incident-date" name="incident_date" type="date" required className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" />
                            </div>
                            <div>
                                <label htmlFor="location" className="text-sm font-semibold text-zinc-900">{t("locationLabel")}</label>
                                <input id="location" name="location" required maxLength={200} className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" placeholder={t("locationPlaceholder")} />
                            </div>
                        </div>
                        <div className="rounded-2xl border border-zinc-200 bg-stone-50 p-5">
                            <h2 className="text-sm font-semibold">{t("beforeSubmitTitle")}</h2>
                            <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600">
                                <li>• {t("checkOne")}</li>
                                <li>• {t("checkTwo")}</li>
                                <li>• {t("checkThree")}</li>
                            </ul>
                        </div>
                        <button type="button" disabled className="h-12 w-full cursor-not-allowed rounded-full bg-zinc-300 px-6 text-sm font-semibold text-zinc-500">{t("submitComingSoon")}</button>
                    </form>
                </div>
            </section>
        </main>
    );
}
