import Link from "next/link";

type BreadcrumbItem = { label: string; href?: string };
type BreadcrumbsProps = { items: BreadcrumbItem[]; homeLabel: string; ariaLabel?: string };

export function Breadcrumbs({ items, homeLabel, ariaLabel = "ব্রেডক্রাম্ব" }: BreadcrumbsProps) {
    return (
        <nav aria-label={ariaLabel} className="text-sm">
            <ol className="flex flex-wrap items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <li>
                    <Link href="/" className="hover:text-zinc-950 hover:underline hover:underline-offset-4 dark:hover:text-white">
                        {homeLabel}
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                        <span aria-hidden="true">/</span>
                        {item.href ? (
                            <Link href={item.href} className="hover:text-zinc-950 hover:underline hover:underline-offset-4 dark:hover:text-white">
                                {item.label}
                            </Link>
                        ) : (
                            <span aria-current="page" className="font-semibold text-zinc-950 dark:text-white">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
