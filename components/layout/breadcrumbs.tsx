import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

type BreadcrumbItem = {
    label: string;
    href?: string;
};

type BreadcrumbsProps = {
    items: BreadcrumbItem[];
    ariaLabel?: string;
};

export async function Breadcrumbs({ items, ariaLabel }: BreadcrumbsProps) {
    const t = await getTranslations("common");

    return (
        <nav aria-label={ariaLabel ?? t("breadcrumbs")} className="text-sm">
            <ol className="flex flex-wrap items-center gap-2 text-zinc-500">
                <li>
                    <Link href="/" className="hover:text-zinc-950 hover:underline hover:underline-offset-4">
                        {t("home")}
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
