"use client";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Category = { id: string; name: string };
type Division = { id: number; name: string };
type District = { id: number; division_id: number; name: string };

type Props = {
    categories: Category[];
    divisions: Division[];
    districts: District[];
    labels: {
        incidentTitle: string; titlePlaceholder: string; descriptionLabel: string; descriptionPlaceholder: string;
        dateLabel: string; categoryLabel: string; divisionLabel: string; districtLabel: string;
        categoryPlaceholder: string; divisionPlaceholder: string; districtPlaceholder: string;
        beforeSubmitTitle: string; checkOne: string; checkTwo: string; checkThree: string;
        submit: string; submitting: string; successTitle: string; successDescription: string; publicIdLabel: string; error: string;
    };
};

export function AnonymousReportForm({ categories, divisions, districts, labels: t }: Props) {
    const [divisionId, setDivisionId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [districtId, setDistrictId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<string | null>(null);
    const submissionLocked = useRef(false);

    const availableDistricts = useMemo(
        () => districts.filter((district) => String(district.division_id) === divisionId),
        [districts, divisionId],
    );

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submissionLocked.current) return;

        submissionLocked.current = true;
        setSubmitting(true);
        setError("");

        const formData = new FormData(event.currentTarget);
        const title = String(formData.get("title") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();
        const incidentDate = String(formData.get("incident_date") ?? "");
        const division = Number(divisionId);
        const district = Number(districtId);

        const validCategory = categories.some((category) => category.id === categoryId);
        const validDivision = divisions.some((item) => item.id === division);
        const validDistrict = availableDistricts.some((item) => item.id === district);

        if (
            title.length < 5 ||
            title.length > 200 ||
            description.length < 20 ||
            description.length > 10000 ||
            !/^\d{4}-\d{2}-\d{2}$/.test(incidentDate) ||
            !validCategory ||
            !validDivision ||
            !validDistrict
        ) {
            setError(t.error);
            setSubmitting(false);
            submissionLocked.current = false;
            return;
        }

        try {
            const supabase = createClient();
            const { data, error: rpcError } = await supabase.rpc("create_anonymous_incident", {
                p_title: title,
                p_description: description,
                p_category_id: categoryId,
                p_division_id: division,
                p_district_id: district,
                p_incident_date: incidentDate,
            });

            if (rpcError) {
                console.error("Anonymous incident submission failed", rpcError);
                setError(t.error);
                setSubmitting(false);
                submissionLocked.current = false;
                return;
            }

            if (typeof data !== "string" || !data.trim()) {
                console.error("Anonymous incident submission returned no public ID", data);
                setError(t.error);
                setSubmitting(false);
                submissionLocked.current = false;
                return;
            }

            setResult(data.trim());
            setSubmitting(false);
        } catch (submissionError) {
            console.error("Anonymous incident submission threw", submissionError);
            setError(t.error);
            setSubmitting(false);
            submissionLocked.current = false;
        }
    }

    if (result) return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8" role="status" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{t.successTitle}</p>
            <h2 className="mt-3 text-2xl font-semibold text-emerald-950">{t.successDescription}</h2>
            <div className="mt-6 rounded-xl border border-emerald-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">{t.publicIdLabel}</p>
                <p className="mt-2 break-all font-mono text-sm font-semibold text-zinc-900">{result}</p>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-7">
            <div>
                <label htmlFor="title" className="text-sm font-semibold text-zinc-900">{t.incidentTitle}</label>
                <input id="title" name="title" required minLength={5} maxLength={200} autoComplete="off" className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" placeholder={t.titlePlaceholder} />
            </div>
            <div>
                <label htmlFor="description" className="text-sm font-semibold text-zinc-900">{t.descriptionLabel}</label>
                <textarea id="description" name="description" required minLength={20} maxLength={10000} rows={8} className="mt-2 w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm leading-6 outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" placeholder={t.descriptionPlaceholder} />
            </div>
            <div className="grid gap-7 sm:grid-cols-2">
                <div>
                    <label htmlFor="category" className="text-sm font-semibold text-zinc-900">{t.categoryLabel}</label>
                    <select id="category" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10">
                        <option value="">{t.categoryPlaceholder}</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="incident-date" className="text-sm font-semibold text-zinc-900">{t.dateLabel}</label>
                    <input id="incident-date" name="incident_date" type="date" required className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" />
                </div>
            </div>
            <div className="grid gap-7 sm:grid-cols-2">
                <div>
                    <label htmlFor="division" className="text-sm font-semibold text-zinc-900">{t.divisionLabel}</label>
                    <select id="division" required value={divisionId} onChange={(e) => { setDivisionId(e.target.value); setDistrictId(""); }} className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10">
                        <option value="">{t.divisionPlaceholder}</option>
                        {divisions.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="district" className="text-sm font-semibold text-zinc-900">{t.districtLabel}</label>
                    <select id="district" required value={districtId} onChange={(e) => setDistrictId(e.target.value)} disabled={!divisionId} className="mt-2 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10">
                        <option value="">{t.districtPlaceholder}</option>
                        {availableDistricts.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-stone-50 p-5">
                <h2 className="text-sm font-semibold">{t.beforeSubmitTitle}</h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600"><li>• {t.checkOne}</li><li>• {t.checkTwo}</li><li>• {t.checkThree}</li></ul>
            </div>
            {error && <p role="alert" aria-live="assertive" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{t.error}</p>}
            <button type="submit" disabled={submitting || !categoryId || !divisionId || !districtId} className="h-12 w-full rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500">{submitting ? t.submitting : t.submit}</button>
        </form>
    );
}
