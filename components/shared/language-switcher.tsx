"use client";

import { useLocale } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const nextLocale: Locale = locale === "bn" ? "en" : "bn";

    function handleLocaleChange() {
        router.replace(pathname, { locale: nextLocale });
    }

    return (
        <button
            type="button"
            onClick={handleLocaleChange}
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label={
                locale === "bn"
                    ? "Switch to English"
                    : "বাংলায় পরিবর্তন করুন"
            }
        >
            {locale === "bn" ? "English" : "বাংলা"}
        </button>
    );
}