"use client";

import { useMemo, useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";

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
  const [districtId, setDistrictId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [titleLength, setTitleLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);

  const [copied, setCopied] = useState(false);

  const availableDistricts = useMemo(() => {
    if (!divisionId) return [];
    return districts.filter((district) => district.division_id === Number(divisionId));
  }, [divisionId, districts]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const title = (formData.get("title") as string)?.trim() ?? "";
    const description = (formData.get("description") as string)?.trim() ?? "";
    const today = todayInDhaka();

    if (
      title.length < 5 ||
      title.length > 200 ||
      description.length < 20 ||
      description.length > 10000 ||
      !categoryId ||
      !divisionId ||
      !districtId ||
      !incidentDate
    ) {
      setError(t.requiredError);
      return;
    }

    if (!isValidCalendarDate(incidentDate)) {
      setError(t.invalidError);
      return;
    }

    if (incidentDate > today) {
      setError(t.futureDateError);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          incidentDate,
          categoryId,
          divisionId: Number(divisionId),
          districtId: Number(districtId),
        }),
      });

      const payload = (await response.json()) as { publicId?: string; message?: string };

      if (!response.ok || !payload.publicId) {
        setError(payload.message || t.submitError);
        setSubmitting(false);
        return;
      }

      setResult(payload.publicId);
      setSubmitting(false);
    } catch {
      setError(t.submitError);
      setSubmitting(false);
    }
  }

  function resetForm() {
    setDivisionId("");
    setDistrictId("");
    setCategoryId("");
    setIncidentDate("");
    setError(null);
    setResult(null);
    setTitleLength(0);
    setDescriptionLength(0);
    setCopied(false);
  }

  async function copyPublicId() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures.
    }
  }

  if (result) {
    return (
      <section className="border border-emerald-200 bg-emerald-50/70 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/30 sm:p-8" aria-live="polite">
        <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">✓</span>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{t.successTitle}</h2>
        </div>
        <p className="mt-4 text-sm leading-6 text-emerald-950 dark:text-emerald-200">{t.successDescription}</p>
        <div className="mt-6 border border-emerald-300 bg-white p-4 dark:border-emerald-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{t.publicIdLabel}</span>
            <button
              type="button"
              onClick={copyPublicId}
              className="border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              aria-label="পাবলিক আইডি কপি করুন"
            >
              {copied ? "কপি হয়েছে" : "কপি করুন"}
            </button>
          </div>
          <p className="mt-2 break-all font-mono text-lg font-bold tracking-wide text-zinc-950 dark:text-white">{result}</p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={resetForm}
            className="h-11 flex-1 bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {t.startAnother}
          </button>
          <a
            href="/"
            className="flex h-11 flex-1 items-center justify-center border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            হোমে ফিরুন
          </a>
        </div>
      </section>
    );
  }

  const today = todayInDhaka();
  const inputClass = "mt-2 h-12 w-full border border-zinc-300 bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-white";
  const selectClass = "mt-2 h-12 w-full border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-white dark:disabled:bg-zinc-900";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8" aria-describedby={error ? "incident-submit-error" : undefined}>
      <div className="border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">{t.eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-100 sm:text-3xl">{t.title}</h2>
        <p className="mt-3 text-sm leading-6 text-emerald-950/80 dark:text-emerald-200">{t.description}</p>
        <div className="mt-5 border-t border-emerald-200/70 pt-5 dark:border-emerald-900/50">
          <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">{t.privacyTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-emerald-950/70 dark:text-emerald-300/80">{t.privacyDescription}</p>
        </div>
      </div>

      <div className="space-y-7">
        <div>
          <div className="flex items-end justify-between gap-4">
            <label htmlFor="incident-title" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.titleLabel}</label>
            <span className="text-xs tabular-nums text-zinc-400">{titleLength}/200</span>
          </div>
          <input
            id="incident-title"
            name="title"
            required
            minLength={5}
            maxLength={200}
            autoComplete="off"
            onChange={(event) => setTitleLength(event.currentTarget.value.length)}
            className={inputClass}
            placeholder={t.titlePlaceholder}
          />
        </div>

        <div>
          <div className="flex items-end justify-between gap-4">
            <label htmlFor="incident-description" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.descriptionLabel}</label>
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
            className="mt-2 w-full resize-y border border-zinc-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
            placeholder={t.descriptionPlaceholder}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="incident_date-trigger" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.dateLabel}</label>
          <DatePicker
            name="incident_date"
            value={incidentDate}
            onChange={setIncidentDate}
            placeholder={t.dateLabel}
            label={t.dateLabel}
          />
        </div>

        <div>
          <label htmlFor="incident-category" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.categoryLabel}</label>
          <select
            id="incident-category"
            name="category_id"
            required
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className={selectClass}
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
          <label htmlFor="incident-division" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.divisionLabel}</label>
          <select
            id="incident-division"
            name="division_id"
            required
            value={divisionId}
            onChange={(event) => {
              setDivisionId(event.target.value);
              setDistrictId("");
            }}
            className={selectClass}
          >
            <option value="">{t.divisionPlaceholder}</option>
            {divisions.map((division) => (
              <option key={division.id} value={division.id}>{division.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="incident-district" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.districtLabel}</label>
          <select
            id="incident-district"
            name="district_id"
            required
            value={districtId}
            onChange={(event) => setDistrictId(event.target.value)}
            disabled={!divisionId}
            className={selectClass}
          >
            <option value="">{t.districtPlaceholder}</option>
            {availableDistricts.map((district) => (
              <option key={district.id} value={district.id}>{district.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border border-zinc-200 bg-stone-50 p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">{t.guidanceTitle}</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          <li>• {t.guidanceOne}</li>
          <li>• {t.guidanceTwo}</li>
          <li>• {t.guidanceThree}</li>
        </ul>
      </div>

      {error ? (
        <div id="incident-submit-error" role="alert" aria-live="assertive" className="border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting || !categoryId || !divisionId || !districtId}
        className="h-12 w-full bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
      >
        {submitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
