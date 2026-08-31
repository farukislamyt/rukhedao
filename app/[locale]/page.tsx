import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function HomePage() {
    const t = await getTranslations("home");

    return (
        <main>
            {/* Hero */}
            <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center px-6 py-20">
                    <div className="max-w-3xl">
                        <div className="mb-6 inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                            {t("badge")}
                        </div>

                        <h1 className="text-5xl font-bold tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl dark:text-white">
                            {t("title")}
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl dark:text-zinc-400">
                            {t("description")}
                        </p>

                        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/report"
                                className="inline-flex h-12 items-center justify-center rounded-lg bg-zinc-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                            >
                                {t("reportIncident")}
                            </Link>

                            <Link
                                href="/incidents"
                                className="inline-flex h-12 items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900"
                            >
                                {t("viewIncidents")}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="bg-zinc-50 py-24 dark:bg-zinc-900/40">
                <div className="mx-auto w-full max-w-7xl px-6">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                            {t("howItWorksLabel")}
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
                            {t("howItWorksTitle")}
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        <article className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                            <span className="text-sm font-bold text-zinc-400">
                                01
                            </span>

                            <h3 className="mt-5 text-xl font-semibold text-zinc-950 dark:text-white">
                                {t("stepOneTitle")}
                            </h3>

                            <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
                                {t("stepOneDescription")}
                            </p>
                        </article>

                        <article className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                            <span className="text-sm font-bold text-zinc-400">
                                02
                            </span>

                            <h3 className="mt-5 text-xl font-semibold text-zinc-950 dark:text-white">
                                {t("stepTwoTitle")}
                            </h3>

                            <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
                                {t("stepTwoDescription")}
                            </p>
                        </article>

                        <article className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                            <span className="text-sm font-bold text-zinc-400">
                                03
                            </span>

                            <h3 className="mt-5 text-xl font-semibold text-zinc-950 dark:text-white">
                                {t("stepThreeTitle")}
                            </h3>

                            <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
                                {t("stepThreeDescription")}
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="border-t border-zinc-200 bg-white py-24 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
                        {t("ctaTitle")}
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                        {t("ctaDescription")}
                    </p>

                    <div className="mt-8">
                        <Link
                            href="/report"
                            className="inline-flex h-12 items-center justify-center rounded-lg bg-zinc-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                        >
                            {t("reportIncident")}
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}