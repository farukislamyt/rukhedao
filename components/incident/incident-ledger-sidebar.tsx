import { getTranslations } from "next-intl/server";

type LedgerItem = {
    name: string;
    count: number;
};

type Props = {
    ledgers: {
        divisions: LedgerItem[];
        categories: LedgerItem[];
    };
};

export async function IncidentLedgerSidebar({ ledgers }: Props) {
    const t = await getTranslations("incidents");

    return (
        <aside className="space-y-8 lg:sticky lg:top-24">
            <div>
                <div className="border-b border-zinc-200 pb-4">
                    <h2 className="text-xl font-semibold tracking-[-0.02em]">{t("division")}</h2>
                </div>
                <div className="divide-y divide-zinc-200 border-b border-zinc-200">
                    {ledgers.divisions.map((item) => (
                        <div key={item.name} className="flex items-center justify-between gap-4 py-3">
                            <span className="min-w-0 truncate text-sm font-medium text-zinc-800">{item.name}</span>
                            <span className="shrink-0 font-mono text-sm text-zinc-500">{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="border-b border-zinc-200 pb-4">
                    <h2 className="text-xl font-semibold tracking-[-0.02em]">{t("category")}</h2>
                </div>
                <div className="divide-y divide-zinc-200 border-b border-zinc-200">
                    {ledgers.categories.map((item) => (
                        <div key={item.name} className="flex items-center justify-between gap-4 py-3">
                            <span className="min-w-0 truncate text-sm font-medium text-zinc-800">{item.name}</span>
                            <span className="shrink-0 font-mono text-sm text-zinc-500">{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
