import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    locales: ["bn"],
    defaultLocale: "bn",
    localePrefix: "never",
});

export type Locale = (typeof routing.locales)[number];
