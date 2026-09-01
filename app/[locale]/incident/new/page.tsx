import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { NewIncidentForm } from "@/components/incident/new-incident-form";
import { createClient } from "@/lib/supabase/server";

type Category = { id: string; name: string };
type Division = { id: number; name: string };
type District = { id: number; division_id: number; name: string };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("incidentNew");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function NewIncidentPage() {
  const t = await getTranslations("incidentNew");
  const supabase = await createClient();

  const [categories, divisions, districts] = await Promise.all([
    supabase.from("public_categories").select("id,name").order("sort_order"),
    supabase.from("public_divisions").select("id,name").order("sort_order"),
    supabase.from("public_districts").select("id,division_id,name").order("division_id").order("sort_order"),
  ]);

  if (categories.error || divisions.error || districts.error) {
    throw new Error("Unable to load incident reference data.");
  }

  const categoryOptions: Category[] = (categories.data ?? []).filter(
    (item): item is Category => item.id !== null && item.name !== null,
  );
  const divisionOptions: Division[] = (divisions.data ?? []).filter(
    (item): item is Division => item.id !== null && item.name !== null,
  );
  const districtOptions: District[] = (districts.data ?? []).filter(
    (item): item is District => item.id !== null && item.division_id !== null && item.name !== null,
  );

  return (
    <main className="flex-1 bg-stone-50 text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{t("eyebrow")}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{t("title")}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">{t("description")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-8 lg:px-8 lg:py-12">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
          <NewIncidentForm
            categories={categoryOptions}
            divisions={divisionOptions}
            districts={districtOptions}
            labels={{
              eyebrow: t("formEyebrow"),
              title: t("formTitle"),
              description: t("formDescription"),
              privacyTitle: t("privacyTitle"),
              privacyDescription: t("privacyDescription"),
              titleLabel: t("titleLabel"),
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
              guidanceTitle: t("guidanceTitle"),
              guidanceOne: t("guidanceOne"),
              guidanceTwo: t("guidanceTwo"),
              guidanceThree: t("guidanceThree"),
              submit: t("submit"),
              submitting: t("submitting"),
              successTitle: t("successTitle"),
              successDescription: t("successDescription"),
              publicIdLabel: t("publicIdLabel"),
              startAnother: t("startAnother"),
              requiredError: t("requiredError"),
              futureDateError: t("futureDateError"),
              invalidError: t("invalidError"),
              referenceError: t("referenceError"),
              submitError: t("submitError"),
            }}
          />
        </div>
      </section>
    </main>
  );
}
