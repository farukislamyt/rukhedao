import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Link } from "@/i18n/navigation";

export async function Navbar() {
    const t = await getTranslations("common");

    return (
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <nav
                className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6"
                aria-label="Main navigation"
            >
                <Link
                    href="/"
                    className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white"
                >
                    {t("appName")}
                </Link>

                <div className="flex items-center gap-6">
                    <Link
                        href="/"
                        className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                    >
                        {t("home")}
                    </Link>

                    <LanguageSwitcher />
                </div>
            </nav>
        </header>
    );
}