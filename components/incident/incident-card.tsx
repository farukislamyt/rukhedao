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

const dateFormatter = new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
});

function formatDate(value: string | null) {
    if (!value) return "";
    return dateFormatter.format(new Date(`${value}T00:00:00+06:00`));
}

export function IncidentCard({ incident }: IncidentCardProps) {
    const href = `/incidents/${encodeURIComponent(incident.public_id ?? "")}`;
    const location = [incident.district, incident.division].filter(Boolean).join(", ");

    return (
        <Link
            href={href}
            className="group flex min-h-[16rem] flex-col border border-zinc-200/90 bg-white p-4 transition-all hover:-translate-y-1 hover:border-zinc-950 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-200"
        >
            <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2.5 dark:border-zinc-800/80">
                <span className="max-w-[70%] truncate border border-emerald-200 bg-emerald-50/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {incident.category ?? "ঘটনার ধরন"}
                </span>
                <span className="shrink-0 font-mono text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                    {incident.public_id}
                </span>
            </div>

            <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
                {incident.title ?? "প্রকাশিত ঘটনার নথি"}
            </h3>

            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {incident.description ?? ""}
            </p>

            <div className="mt-auto grid grid-cols-2 gap-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800/80">
                <div className="min-w-0">
                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        <span className="inline-block h-3 w-3 shrink-0" aria-hidden="true">
                            <span className="relative mx-auto mt-0.5 block h-2.5 w-2.5 rounded-full border-[1.5px] border-current">
                                <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
                            </span>
                        </span>
                        স্থান
                    </p>
                    <p className="mt-1 truncate font-semibold text-zinc-800 dark:text-zinc-200">{location || "স্থান উল্লেখ নেই"}</p>
                </div>
                <div>
                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        <span className="inline-block h-3 w-3 shrink-0" aria-hidden="true">
                            <span className="relative block h-3 w-3 rounded-[2px] border-[1.5px] border-current">
                                <span className="absolute inset-x-0 top-2 border-t border-current" />
                                <span className="absolute left-1.5 top-0 h-1 w-px bg-current" />
                                <span className="absolute right-1.5 top-0 h-1 w-px bg-current" />
                            </span>
                        </span>
                        তারিখ
                    </p>
                    <p className="mt-1 font-semibold text-zinc-800 dark:text-zinc-200">{formatDate(incident.incident_date)}</p>
                </div>
            </div>
        </Link>
    );
}
