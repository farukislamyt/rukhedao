import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Link } from "@/i18n/navigation";

export async function Navbar() {
    const t = await getTranslations("common");

    return (
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
            <nav
                className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 lg:px-8"
                aria-label="Main navigation"
            >
                <Link
                    href="/"
                    className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white"
                >
                    {t("appName")}
                </Link>

                <div className="flex items-center gap-4 sm:gap-6">
                    <Link
                        href="/"
                        className="hidden text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 sm:inline-block dark:text-zinc-300 dark:hover:text-white"
                    >
                        {t("home")}
                    </Link>

                    <Link
                        href="/incidents"
                        className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                    >
                        {t("incidents")}
                    </Link>

                    <Link
                        href="/incident/new"
                        className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-950 px-4 text-xs font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    >
                        {t("reportIncident")}
                    </Link>

                    <LanguageSwitcher />
                </div>
            </nav>
        </header>
    );
}