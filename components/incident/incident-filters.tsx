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

    const selectClass = "h-11 border border-zinc-300 bg-white px-3 text-sm font-normal text-zinc-900 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-white";

    return (
        <form className="grid gap-3 border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2 lg:grid-cols-5" method="get">
            <label className="grid gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                {labels.category}
                <select name="category" defaultValue={values.category} className={selectClass}>
                    <option value="">{labels.all}</option>
                    {categories.map((item) => <option key={item.slug ?? String(item.id)} value={item.slug ?? ""}>{item.name}</option>)}
                </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                {labels.division}
                <select
                    name="division"
                    value={division}
                    onChange={(event) => {
                        setDivision(event.target.value);
                        setDistrict("");
                    }}
                    className={selectClass}
                >
                    <option value="">{labels.all}</option>
                    {divisions.map((item) => <option key={item.slug ?? String(item.id)} value={item.slug ?? ""}>{item.name}</option>)}
                </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                {labels.district}
                <select name="district" value={district} onChange={(event) => setDistrict(event.target.value)} className={selectClass}>
                    <option value="">{labels.all}</option>
                    {visibleDistricts.map((item) => <option key={item.slug ?? String(item.id)} value={item.slug ?? ""}>{item.name}</option>)}
                </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                {labels.sort ?? "সাজানোর ক্রম"}
                <select name="sort" defaultValue={values.sort ?? "published_desc"} className={selectClass}>
                    <option value="published_desc">নতুন প্রকাশিত আগে</option>
                    <option value="published_asc">পুরোনো প্রকাশিত আগে</option>
                    <option value="incident_desc">ঘটনার তারিখ (নতুন আগে)</option>
                </select>
            </label>

            <div className="flex items-end gap-2">
                <button className="h-11 flex-1 bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200" type="submit">
                    {labels.apply}
                </button>
                <a href="." className="inline-flex h-11 items-center justify-center border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                    {labels.clear}
                </a>
            </div>
        </form>
    );
}
