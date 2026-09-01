import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function Footer() {
    const t = await getTranslations("footer");
    const tCommon = await getTranslations("common");

    return (
        <footer className="border-t border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr] lg:px-8">
                <div>
                    <Link
                        href="/"
                        className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white"
                    >
                        {tCommon("appName")}
                    </Link>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                        {t("tagline")}
                    </p>
                </div>
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                        {t("explore")}
                    </h2>
                    <div className="mt-4 space-y-3 text-sm">
                        <Link
                            className="block text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                            href="/incidents"
                        >
                            {t("incidents")}
                        </Link>
                        <Link
                            className="block text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                            href="/incident/new"
                        >
                            {t("reportIncident")}
                        </Link>
                    </div>
                </div>
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                        {tCommon("appName")}
                    </h2>
                    <div className="mt-4 space-y-3 text-sm">
                        <Link
                            className="block text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                            href="/#how-it-works"
                        >
                            {t("howItWorks")}
                        </Link>
                        <Link
                            className="block text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                            href="/#privacy"
                        >
                            {t("privacy")}
                        </Link>
                    </div>
                </div>
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-800">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                    <p>© {new Date().getFullYear()} {tCommon("appName")}. {t("allRightsReserved")}</p>
                    <p>{t("anonymousByDesign")}</p>
                </div>
            </div>
        </footer>
    );
}
