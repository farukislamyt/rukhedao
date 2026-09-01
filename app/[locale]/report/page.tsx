import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AnonymousReportForm } from "@/components/report/anonymous-report-form";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("report");
    return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ReportPage() {
    const t = await getTranslations("report");
    const supabase = await createClient();
    const [categories, divisions, districts] = await Promise.all([
        supabase.from("public_categories").select("id,name").order("sort_order"),
        supabase.from("public_divisions").select("id,name").order("sort_order"),
        supabase.from("public_districts").select("id,division_id,name").order("division_id").order("sort_order"),
    ]);

    if (categories.error || divisions.error || districts.error) {
        throw new Error("Unable to load reporting reference data.");
    }

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
                    <AnonymousReportForm
                        categories={categories.data ?? []}
                        divisions={divisions.data ?? []}
                        districts={districts.data ?? []}
                        labels={{
                            incidentTitle: t("incidentTitle"), titlePlaceholder: t("titlePlaceholder"), descriptionLabel: t("descriptionLabel"), descriptionPlaceholder: t("descriptionPlaceholder"),
                            dateLabel: t("dateLabel"), categoryLabel: t("categoryLabel"), divisionLabel: t("divisionLabel"), districtLabel: t("districtLabel"),
                            categoryPlaceholder: t("categoryPlaceholder"), divisionPlaceholder: t("divisionPlaceholder"), districtPlaceholder: t("districtPlaceholder"),
                            beforeSubmitTitle: t("beforeSubmitTitle"), checkOne: t("checkOne"), checkTwo: t("checkTwo"), checkThree: t("checkThree"),
                            submit: t("submit"), submitting: t("submitting"), successTitle: t("successTitle"), successDescription: t("successDescription"), publicIdLabel: t("publicIdLabel"), error: t("error"),
                        }}
                    />
                </div>
            </section>
        </main>
    );
}
