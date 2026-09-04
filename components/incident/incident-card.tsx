import Link from "next/link";
import type { Tables } from "@/types/database";
import { MapPin, CalendarDays } from "lucide-react";

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
            className="group flex min-h-[19rem] flex-col border border-zinc-200/90 bg-white p-6 transition-all hover:-translate-y-1 hover:border-zinc-950 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-200"
        >
            <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3.5 dark:border-zinc-800/80">
                <span className="max-w-[70%] truncate border border-emerald-200 bg-emerald-50/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {incident.category ?? "ঘটনার ধরন"}
                </span>
                <span className="shrink-0 font-mono text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                    {incident.public_id}
                </span>
            </div>

            <h3 className="mt-5 line-clamp-2 text-lg font-bold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
                {incident.title ?? "প্রকাশিত ঘটনার নথি"}
            </h3>

            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {incident.description ?? ""}
            </p>

            <div className="mt-auto grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4 text-xs text-zinc-500 dark:border-zinc-800/80">
                <div className="min-w-0">
                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                        স্থান
                    </p>
                    <p className="mt-1 truncate font-semibold text-zinc-800 dark:text-zinc-200">{location || "স্থান উল্লেখ নেই"}</p>
                </div>
                <div>
                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        <CalendarDays className="h-3 w-3 shrink-0" aria-hidden="true" />
                        তারিখ
                    </p>
                    <p className="mt-1 font-semibold text-zinc-800 dark:text-zinc-200">{formatDate(incident.incident_date)}</p>
                </div>
            </div>
        </Link>
    );
}
