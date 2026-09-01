"use client";

import { useMemo, useRef, useState } from "react";

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
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function NewIncidentForm({ categories, divisions, districts, labels: t }: Props) {
  const [divisionId, setDivisionId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const locked = useRef(false);

  const availableDistricts = useMemo(
    () => districts.filter((district) => String(district.division_id) === divisionId),
    [districts, divisionId],
  );

  function resetForm() {
    setDivisionId("");
    setCategoryId("");
    setDistrictId("");
    setError("");
    setResult(null);
    locked.current = false;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const incidentDate = String(data.get("incident_date") ?? "");
    const division = Number(divisionId);
    const district = Number(districtId);

    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(incidentDate);
    const parsedDate = validDate ? new Date(`${incidentDate}T00:00:00.000Z`) : null;
    const normalizedDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString().slice(0, 10) : "";
    const validCategory = categories.some((item) => item.id === categoryId);
    const validDivision = divisions.some((item) => item.id === division);
    const validDistrict = availableDistricts.some((item) => item.id === district);

    if (!title || !description || !categoryId || !divisionId || !districtId || !incidentDate) {
      setError(t.requiredError);
      return;
    }

    if (title.length < 5 || title.length > 200 || description.length < 20 || description.length > 10000 || normalizedDate !== incidentDate) {
      setError(t.invalidError);
      return;
    }

    if (incidentDate > todayInDhaka()) {
      setError(t.futureDateError);
      return;
    }

    if (!validCategory || !validDivision || !validDistrict) {
      setError(t.referenceError);
      return;
    }

    locked.current = true;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          title,
          description,
          incidentDate,
          categoryId,
          divisionId: division,
          districtId: district,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || typeof payload?.publicId !== "string" || !payload.publicId.trim()) {
        console.error("Incident submission failed", payload);
        setError(typeof payload?.message === "string" ? payload.message : t.submitError);
        setSubmitting(false);
        locked.current = false;
        return;
      }

      setResult(payload.publicId.trim());
      setSubmitting(false);
    } catch (submissionError) {
      console.error("Unexpected incident submission error", submissionError);
      setError(t.submitError);
      setSubmitting(false);
      locked.current = false;
    }
  }

  if (result) {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-10" role="status" aria-live="polite">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">✓</div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{t.successTitle}</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">{t.successDescription}</h2>
        <div className="mt-7 rounded-2xl border border-emerald-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">{t.publicIdLabel}</p>
          <p className="mt-2 break-all font-mono text-lg font-semibold text-zinc-950">{result}</p>
        </div>
        <button type="button" onClick={resetForm} className="mt-6 h-11 rounded-full border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100">
          {t.startAnother}
        </button>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{t.eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">{t.title}</h1>
        <p className="mt-3 text-sm leading-6 text-emerald-950/75">{t.description}</p>
        <div className="mt-5 border-t border-emerald-200/70 pt-5">
          <h2 className="text-sm font-semibold text-emerald-950">{t.privacyTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-950/70">{t.privacyDescription}</p>
        </div>
      </div>

      <div className="grid gap-7">
        <div>
          <label htmlFor="incident-title" className="text-sm font-semibold text-zinc-900">{t.titleLabel}</label>
          <input id="incident-title" name="title" required minLength={5} maxLength={200} autoComplete="off" className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" placeholder={t.titlePlaceholder} />
        </div>

        <div>
          <label htmlFor="incident-description" className="text-sm font-semibold text-zinc-900">{t.descriptionLabel}</label>
          <textarea id="incident-description" name="description" required minLength={20} maxLength={10000} rows={8} className="mt-2 w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" placeholder={t.descriptionPlaceholder} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="incident-date" className="text-sm font-semibold text-zinc-900">{t.dateLabel}</label>
          <input id="incident-date" name="incident_date" type="date" max={todayInDhaka()} required className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" />
        </div>
        <div>
          <label htmlFor="incident-category" className="text-sm font-semibold text-zinc-900">{t.categoryLabel}</label>
          <select id="incident-category" required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10">
            <option value="">{t.categoryPlaceholder}</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="incident-division" className="text-sm font-semibold text-zinc-900">{t.divisionLabel}</label>
          <select id="incident-division" required value={divisionId} onChange={(event) => { setDivisionId(event.target.value); setDistrictId(""); }} className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10">
            <option value="">{t.divisionPlaceholder}</option>
            {divisions.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="incident-district" className="text-sm font-semibold text-zinc-900">{t.districtLabel}</label>
          <select id="incident-district" required value={districtId} onChange={(event) => setDistrictId(event.target.value)} disabled={!divisionId} className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100">
            <option value="">{t.districtPlaceholder}</option>
            {availableDistricts.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-stone-50 p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-950">{t.guidanceTitle}</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600">
          <li>• {t.guidanceOne}</li>
          <li>• {t.guidanceTwo}</li>
          <li>• {t.guidanceThree}</li>
        </ul>
      </div>

      {error && <p role="alert" aria-live="assertive" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</p>}

      <button type="submit" disabled={submitting || !categoryId || !divisionId || !districtId} className="h-12 w-full rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500">
        {submitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
