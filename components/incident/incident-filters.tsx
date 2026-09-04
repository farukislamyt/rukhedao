"use client";

import { useMemo, useState } from "react";

type Option = {
    id: string | number | null;
    name: string | null;
    slug: string | null;
    division_id?: number | null;
};

type IncidentFiltersProps = {
    categories: Option[];
    divisions: Option[];
    districts: Option[];
    values: {
        category: string;
        division: string;
        district: string;
        sort?: string;
    };
    labels: {
        category: string;
        division: string;
        district: string;
        sort?: string;
        all: string;
        apply: string;
        clear: string;
    };
};

export function IncidentFilters({ categories, divisions, districts, values, labels }: IncidentFiltersProps) {
    const [division, setDivision] = useState(values.division);
    const [district, setDistrict] = useState(values.district);

    const selectedDivision = divisions.find((item) => item.slug === division);
    const visibleDistricts = useMemo(
        () => selectedDivision?.id == null
            ? districts
            : districts.filter((item) => item.division_id === Number(selectedDivision.id)),
        [districts, selectedDivision],
    );

    return (
        <form className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5" method="get">
            <label className="grid gap-1.5 text-xs font-semibold text-zinc-600">
                {labels.category}
                <select name="category" defaultValue={values.category} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-normal text-zinc-900 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10">
                    <option value="">{labels.all}</option>
                    {categories.map((item) => <option key={item.slug ?? String(item.id)} value={item.slug ?? ""}>{item.name}</option>)}
                </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-zinc-600">
                {labels.division}
                <select
                    name="division"
                    value={division}
                    onChange={(event) => {
                        setDivision(event.target.value);
                        setDistrict("");
                    }}
                    className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-normal text-zinc-900 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
                >
                    <option value="">{labels.all}</option>
                    {divisions.map((item) => <option key={item.slug ?? String(item.id)} value={item.slug ?? ""}>{item.name}</option>)}
                </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-zinc-600">
                {labels.district}
                <select name="district" value={district} onChange={(event) => setDistrict(event.target.value)} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-normal text-zinc-900 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10">
                    <option value="">{labels.all}</option>
                    {visibleDistricts.map((item) => <option key={item.slug ?? String(item.id)} value={item.slug ?? ""}>{item.name}</option>)}
                </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-zinc-600">
                {labels.sort ?? "সাজানোর ক্রম"}
                <select name="sort" defaultValue={values.sort ?? "published_desc"} className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-normal text-zinc-900 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10">
                    <option value="published_desc">নতুন প্রকাশিত আগে</option>
                    <option value="published_asc">পুরোনো প্রকাশিত আগে</option>
                    <option value="incident_desc">ঘটনার তারিখ (নতুন আগে)</option>
                </select>
            </label>

            <div className="flex items-end gap-2">
                <button className="h-11 flex-1 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800" type="submit">{labels.apply}</button>
                <a href="." className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">{labels.clear}</a>
            </div>
        </form>
    );
}
