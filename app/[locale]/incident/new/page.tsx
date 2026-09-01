import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { NewIncidentForm } from "@/components/incident/new-incident-form";
import { createClient } from "@/lib/supabase/server";

type Category = { id: string; name: string };
type Division = { id: number; name: string };
type District = { id: number; division_id: number; name: string };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("report");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function NewIncidentPage() {
  const t = await getTranslations("report");
  const supabase = await createClient();

  const [categoriesResult, divisionsResult, districtsResult] = await Promise.all([
    supabase.from("public_categories").select("id,name").order("sort_order", { ascending: true }),
    supabase.from("public_divisions").select("id,name").order("sort_order", { ascending: true }),
    supabase
      .from("public_districts")
      .select("id,division_id,name")
      .order("division_id", { ascending: true })
      .order("sort_order", { ascending: true }),
  ]);

  const referenceError = categoriesResult.error || divisionsResult.error || districtsResult.error;

  if (referenceError) {
    console.error("Incident reference data failed to load", referenceError);
  }

  const categoryOptions: Category[] = (categoriesResult.data ?? []).flatMap((item) =>
    item.id && item.name ? [{ id: item.id, name: item.name }] : [],
  );
  const divisionOptions: Division[] = (divisionsResult.data ?? []).flatMap((item) =>
    item.id !== null && item.name ? [{ id: item.id, name: item.name }] : [],
  );
  const districtOptions: District[] = (districtsResult.data ?? []).flatMap((item) =>
    item.id !== null && item.division_id !== null && item.name
      ? [{ id: item.id, division_id: item.division_id, name: item.name }]
      : [],
  );

  return (
    <main className="flex-1 bg-stone-50 text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
            {t("description")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
          {referenceError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5" role="alert">
              <p className="text-sm font-semibold text-red-900">{t("error")}</p>
              <p className="mt-2 text-sm leading-6 text-red-800">
                {t("referenceErrorHelp")}
              </p>
            </div>
          ) : (
            <NewIncidentForm
              categories={categoryOptions}
              divisions={divisionOptions}
              districts={districtOptions}
              labels={{
                eyebrow: t("eyebrow"),
                title: t("title"),
                description: t("description"),
                privacyTitle: t("privacyTitle"),
                privacyDescription: t("privacyDescription"),
                titleLabel: t("incidentTitle"),
                titlePlaceholder: t("titlePlaceholder"),
                descriptionLabel: t("descriptionLabel"),
                descriptionPlaceholder: t("descriptionPlaceholder"),
                dateLabel: t("dateLabel"),
                categoryLabel: t("categoryLabel"),
                divisionLabel: t("divisionLabel"),
                districtLabel: t("districtLabel"),
                categoryPlaceholder: t("categoryPlaceholder"),
                divisionPlaceholder: t("divisionPlaceholder"),
                districtPlaceholder: t("districtPlaceholder"),
                guidanceTitle: t("beforeSubmitTitle"),
                guidanceOne: t("checkOne"),
                guidanceTwo: t("checkTwo"),
                guidanceThree: t("checkThree"),
                submit: t("submit"),
                submitting: t("submitting"),
                successTitle: t("successTitle"),
                successDescription: t("successDescription"),
                publicIdLabel: t("publicIdLabel"),
                startAnother: t("submit"),
                requiredError: t("error"),
                futureDateError: t("error"),
                invalidError: t("error"),
                referenceError: t("error"),
                submitError: t("error"),
              }}
            />
          )}
        </div>
      </section>
    </main>
  );
}
