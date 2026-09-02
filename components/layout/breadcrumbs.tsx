import { Link } from "@/i18n/navigation";

type BreadcrumbItem = {
    label: string;
    href?: string;
};

type BreadcrumbsProps = {
    items: BreadcrumbItem[];
    homeLabel: string;
    ariaLabel?: string;
};

export function Breadcrumbs({ items, homeLabel, ariaLabel = "Breadcrumb" }: BreadcrumbsProps) {
    return (
        <nav aria-label={ariaLabel} className="text-sm">
            <ol className="flex flex-wrap items-center gap-2 text-zinc-500">
                <li>
                    <Link href="/" className="hover:text-zinc-950 hover:underline hover:underline-offset-4">
                        {homeLabel}
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                        <span aria-hidden="true">/</span>
                        {item.href ? (
                            <Link href={item.href} className="hover:text-zinc-950 hover:underline hover:underline-offset-4">
                                {item.label}
                            </Link>
                        ) : (
                            <span aria-current="page" className="font-medium text-zinc-950">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
