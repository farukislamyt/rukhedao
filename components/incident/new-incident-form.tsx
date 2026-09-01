"use client";

import { useMemo, useState } from "react";

type Category = { id: string; name: string };
type Division = { id: number; name: string };
type District = { id: number; division_id: number; name: string };

type Props = {
  categories: Category[];
  divisions: Division[];
  districts: District[];
  labels: {
    eyebrow: string;
    title: string;
    description: string;
    privacyTitle: string;
    privacyDescription: string;
    titleLabel: string;
    titlePlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    dateLabel: string;
    categoryLabel: string;
    divisionLabel: string;
    districtLabel: string;
    categoryPlaceholder: string;
    divisionPlaceholder: string;
    districtPlaceholder: string;
    guidanceTitle: string;
    guidanceOne: string;
    guidanceTwo: string;
    guidanceThree: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successDescription: string;
    publicIdLabel: string;
    startAnother: string;
    requiredError: string;
    futureDateError: string;
    invalidError: string;
    referenceError: string;
    submitError: string;
  };
};

function todayInDhaka() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isValidCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function NewIncidentForm({ categories, divisions, districts, labels: t }: Props) {
  const [divisionId, setDivisionId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [titleLength, setTitleLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);

  const availableDistricts = useMemo(
    () => districts.filter((district) => String(district.division_id) === divisionId),
    [districts, divisionId],
  );

  function resetForm() {
    setDivisionId("");
    setCategoryId("");
    setDistrictId("");
    setSubmitting(false);
    setError("");
    setResult(null);
    setTitleLength(0);
    setDescriptionLength(0);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || result) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const incidentDate = String(data.get("incident_date") ?? "");
    const division = Number(data.get("division_id"));
    const district = Number(data.get("district_id"));
    const category = String(data.get("category_id") ?? "");

    setError("");

    if (!title || !description || !category || !Number.isInteger(division) || !Number.isInteger(district) || !incidentDate) {
      setError(t.requiredError);
      return;
    }

    if (title.length < 5 || title.length > 200 || description.length < 20 || description.length > 10000) {
      setError(t.invalidError);
      return;
    }

    if (!isValidCalendarDate(incidentDate)) {
      setError(t.invalidError);
      return;
    }

    if (incidentDate > todayInDhaka()) {
      setError(t.futureDateError);
      return;
    }

    const validCategory = categories.some((item) => item.id === category);
    const validDivision = divisions.some((item) => item.id === division);
    const validDistrict = availableDistricts.some((item) => item.id === district);

    if (!validCategory || !validDivision || !validDistrict) {
      setError(t.referenceError);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          title,
          description,
          incidentDate,
          categoryId: category,
          divisionId: division,
          districtId: district,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || typeof payload?.publicId !== "string" || !payload.publicId.trim()) {
        console.error("Incident submission failed", {
          status: response.status,
          payload,
        });
        setError(typeof payload?.message === "string" ? payload.message : t.submitError);
        setSubmitting(false);
        return;
      }

      setResult(payload.publicId.trim());
      setSubmitting(false);
    } catch (submissionError) {
      console.error("Unexpected incident submission error", submissionError);
      setError(t.submitError);
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-9" role="status" aria-live="polite">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-2xl font-semibold text-white" aria-hidden="true">
          ✓
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{t.successTitle}</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">{t.successDescription}</h2>
        <div className="mt-7 rounded-2xl border border-emerald-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{t.publicIdLabel}</p>
          <p className="mt-2 break-all font-mono text-lg font-semibold tracking-wide text-zinc-950">{result}</p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="mt-6 h-11 rounded-full border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950/20"
        >
          {t.startAnother}
        </button>
      </section>
    );
  }

  const today = todayInDhaka();

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8" aria-describedby={error ? "incident-submit-error" : undefined}>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{t.eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">{t.title}</h2>
        <p className="mt-3 text-sm leading-6 text-emerald-950/75">{t.description}</p>
        <div className="mt-5 border-t border-emerald-200/70 pt-5">
          <h3 className="text-sm font-semibold text-emerald-950">{t.privacyTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-emerald-950/70">{t.privacyDescription}</p>
        </div>
      </div>

      <div className="space-y-7">
        <div>
          <div className="flex items-end justify-between gap-4">
            <label htmlFor="incident-title" className="text-sm font-semibold text-zinc-900">{t.titleLabel}</label>
            <span className="text-xs tabular-nums text-zinc-400">{titleLength}/200</span>
          </div>
          <input
            id="incident-title"
            name="title"
            required
            minLength={5}
            maxLength={200}
            autoComplete="off"
            value={undefined}
            onChange={(event) => setTitleLength(event.currentTarget.value.length)}
            className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
            placeholder={t.titlePlaceholder}
          />
        </div>

        <div>
          <div className="flex items-end justify-between gap-4">
            <label htmlFor="incident-description" className="text-sm font-semibold text-zinc-900">{t.descriptionLabel}</label>
            <span className="text-xs tabular-nums text-zinc-400">{descriptionLength}/10000</span>
          </div>
          <textarea
            id="incident-description"
            name="description"
            required
            minLength={20}
            maxLength={10000}
            rows={9}
            onChange={(event) => setDescriptionLength(event.currentTarget.value.length)}
            className="mt-2 w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
            placeholder={t.descriptionPlaceholder}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="incident-date" className="text-sm font-semibold text-zinc-900">{t.dateLabel}</label>
          <input
            id="incident-date"
            name="incident_date"
            type="date"
            max={today}
            required
            className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
          />
        </div>

        <div>
          <label htmlFor="incident-category" className="text-sm font-semibold text-zinc-900">{t.categoryLabel}</label>
          <select
            id="incident-category"
            name="category_id"
            required
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
          >
            <option value="">{t.categoryPlaceholder}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="incident-division" className="text-sm font-semibold text-zinc-900">{t.divisionLabel}</label>
          <select
            id="incident-division"
            name="division_id"
            required
            value={divisionId}
            onChange={(event) => {
              setDivisionId(event.target.value);
              setDistrictId("");
            }}
            className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
          >
            <option value="">{t.divisionPlaceholder}</option>
            {divisions.map((division) => (
              <option key={division.id} value={division.id}>{division.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="incident-district" className="text-sm font-semibold text-zinc-900">{t.districtLabel}</label>
          <select
            id="incident-district"
            name="district_id"
            required
            value={districtId}
            onChange={(event) => setDistrictId(event.target.value)}
            disabled={!divisionId}
            className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
          >
            <option value="">{t.districtPlaceholder}</option>
            {availableDistricts.map((district) => (
              <option key={district.id} value={district.id}>{district.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-stone-50 p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-zinc-950">{t.guidanceTitle}</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600">
          <li>• {t.guidanceOne}</li>
          <li>• {t.guidanceTwo}</li>
          <li>• {t.guidanceThree}</li>
        </ul>
      </div>

      {error ? (
        <div id="incident-submit-error" role="alert" aria-live="assertive" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting || !categoryId || !divisionId || !districtId}
        className="h-12 w-full rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"
      >
        {submitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
