import Link from "next/link";
import type { Tables } from "@/types/database";

type IncidentCardProps = {
    incident: Pick<
        Tables<"public_incidents">,
        | "public_id"
        | "title"
        | "description"
        | "incident_date"
        | "category"
        | "division"
        | "district"
    >;
};

function formatDate(value: string | null) {
    if (!value) return "";
    return new Intl.DateTimeFormat("bn-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Dhaka",
    }).format(new Date(`${value}T00:00:00+06:00`));
}

export function IncidentCard({ incident }: IncidentCardProps) {
    const href = `/incidents/${encodeURIComponent(incident.public_id ?? "")}`;
    const location = [incident.district, incident.division].filter(Boolean).join(", ");

    return (
        <Link
            href={href}
            className="group flex min-h-72 flex-col rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
        >
            <div className="flex items-start justify-between gap-4">
                <span className="max-w-[70%] truncate rounded-full border border-zinc-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
                    {incident.category ?? "ঘটনার ধরন"}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-zinc-400">
                    {incident.public_id}
                </span>
            </div>
            <h3 className="mt-7 line-clamp-3 text-lg font-semibold leading-7 tracking-[-0.02em] group-hover:underline group-hover:decoration-zinc-300 group-hover:underline-offset-4">
                {incident.title ?? "প্রকাশিত ঘটনার নথি"}
            </h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500">
                {incident.description ?? ""}
            </p>
            <div className="mt-auto grid grid-cols-2 gap-4 border-t border-zinc-200 pt-4 text-xs text-zinc-500">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">স্থান</p>
                    <p className="mt-1 truncate font-medium text-zinc-700">{location || "স্থান উল্লেখ নেই"}</p>
                </div>
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">তারিখ</p>
                    <p className="mt-1 font-medium text-zinc-700">{formatDate(incident.incident_date)}</p>
                </div>
            </div>
        </Link>
    );
}
