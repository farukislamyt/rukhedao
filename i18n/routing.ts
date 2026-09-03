import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    locales: ["bn"],
    defaultLocale: "bn",
});

export type Locale = (typeof routing.locales)[number];
