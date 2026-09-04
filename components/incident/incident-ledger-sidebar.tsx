import Link from "next/link";

type LedgerItem = { name: string; slug: string | null; count: number };
type Props = { ledgers: { divisions: LedgerItem[]; categories: LedgerItem[] } };

function LedgerLink({ type, item }: { type: "division" | "category"; item: LedgerItem }) {
    if (!item.slug) {
        return <span className="min-w-0 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.name}</span>;
    }

    const href = type === "division"
        ? `/incidents?division=${encodeURIComponent(item.slug)}`
        : `/incidents?category=${encodeURIComponent(item.slug)}`;

    return (
        <Link
            href={href}
            className="min-w-0 truncate text-sm font-semibold text-zinc-800 transition-colors hover:text-emerald-700 dark:text-zinc-200 dark:hover:text-emerald-400"
        >
            {item.name}
        </Link>
    );
}

function Ledger({ title, type, items }: { title: string; type: "division" | "category"; items: LedgerItem[] }) {
    return (
        <div className="border border-zinc-200/90 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 pb-3.5 dark:border-zinc-800">
                <h2 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">{title}</h2>
            </div>
            <div className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.length > 0 ? items.map((item) => (
                    <div key={`${type}-${item.name}`} className="flex items-center justify-between gap-4 py-2.5">
                        <LedgerLink type={type} item={item} />
                        <span className="shrink-0 border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                            {item.count}
                        </span>
                    </div>
                )) : <p className="py-4 text-sm text-zinc-500">কোনো তথ্য নেই</p>}
            </div>
        </div>
    );
}

export function IncidentLedgerSidebar({ ledgers }: Props) {
    return (
        <aside className="space-y-6 lg:sticky lg:top-24">
            <Ledger title="বিভাগ অনুযায়ী ঘটনা" type="division" items={ledgers.divisions} />
            <Ledger title="ঘটনার ধরন অনুযায়ী ঘটনা" type="category" items={ledgers.categories} />
        </aside>
    );
}
