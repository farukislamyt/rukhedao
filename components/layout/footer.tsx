import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

const linkClassName =
    "block rounded-md px-2 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white dark:focus-visible:ring-white";

export async function Footer() {
    const t = await getTranslations("footer");
    const tCommon = await getTranslations("common");

    return (
        <footer className="border-t border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 sm:py-14 lg:grid-cols-[1.6fr_1fr_1.2fr] lg:px-8">
                <div>
                    <Link
                        href="/"
                        className="inline-block rounded-md px-2 py-1 text-lg font-bold tracking-tight text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:text-white dark:focus-visible:ring-white"
                    >
                        {tCommon("appName")}
                    </Link>
                    <p className="mt-4 max-w-sm px-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                        {t("tagline")}
                    </p>
                    <p className="mt-4 px-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {t("anonymousByDesign")}
                    </p>
                </div>

                <nav aria-labelledby="footer-explore" className="sm:pl-2">
                    <h2
                        id="footer-explore"
                        className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500"
                    >
                        {t("explore")}
                    </h2>
                    <div className="mt-3">
                        <Link className={linkClassName} href="/incidents">
                            {t("incidents")}
                        </Link>
                        <Link className={linkClassName} href="/incident/new">
                            {t("reportIncident")}
                        </Link>
                        <Link className={linkClassName} href="/how-it-works">
                            {t("howItWorks")}
                        </Link>
                    </div>
                </nav>

                <nav aria-labelledby="footer-trust" className="sm:pl-2">
                    <h2
                        id="footer-trust"
                        className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500"
                    >
                        {t("trust")}
                    </h2>
                    <div className="mt-3">
                        <Link className={linkClassName} href="/about">
                            {t("about")}
                        </Link>
                        <Link className={linkClassName} href="/privacy">
                            {t("privacy")}
                        </Link>
                        <Link className={linkClassName} href="/content-policy">
                            {t("contentPolicy")}
                        </Link>
                        <Link className={linkClassName} href="/security">
                            {t("security")}
                        </Link>
                        <Link className={linkClassName} href="/terms">
                            {t("terms")}
                        </Link>
                    </div>
                </nav>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <p>© {new Date().getFullYear()} {tCommon("appName")}. {t("allRightsReserved")}</p>
                </div>
            </div>
        </footer>
    );
}
