import Link from "next/link";

type LedgerItem = { name: string; slug: string | null; count: number };
type Props = { ledgers: { divisions: LedgerItem[]; categories: LedgerItem[] } };

function LedgerLink({ type, item }: { type: "division" | "category"; item: LedgerItem }) {
    if (!item.slug) {
        return <span className="min-w-0 truncate text-sm font-medium text-zinc-800">{item.name}</span>;
    }

    const href = type === "division"
        ? `/incidents?division=${encodeURIComponent(item.slug)}`
        : `/incidents?category=${encodeURIComponent(item.slug)}`;

    return (
        <Link
            href={href}
            className="min-w-0 truncate text-sm font-medium text-zinc-800 underline-offset-4 hover:text-zinc-950 hover:underline"
        >
            {item.name}
        </Link>
    );
}

function Ledger({ title, type, items }: { title: string; type: "division" | "category"; items: LedgerItem[] }) {
    return (
        <div>
            <div className="border-b border-zinc-200 pb-4"><h2 className="text-xl font-semibold tracking-[-0.02em]">{title}</h2></div>
            <div className="divide-y divide-zinc-200 border-b border-zinc-200">
                {items.length > 0 ? items.map((item) => (
                    <div key={`${type}-${item.name}`} className="flex items-center justify-between gap-4 py-3">
                        <LedgerLink type={type} item={item} />
                        <span className="shrink-0 font-mono text-sm text-zinc-500">{item.count}</span>
                    </div>
                )) : <p className="py-4 text-sm text-zinc-500">কোনো তথ্য নেই</p>}
            </div>
        </div>
    );
}

export function IncidentLedgerSidebar({ ledgers }: Props) {
    return (
        <aside className="space-y-8 lg:sticky lg:top-24">
            <Ledger title="বিভাগ" type="division" items={ledgers.divisions} />
            <Ledger title="ঘটনার ধরন" type="category" items={ledgers.categories} />
        </aside>
    );
}
