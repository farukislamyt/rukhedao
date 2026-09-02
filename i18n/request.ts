import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;

    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;

    const baseMessages = (await import(`../messages/${locale}.json`)).default;
    const pageMessages = (await import(`../messages/${locale}-pages.json`)).default;

    return {
        locale,
        messages: {
            ...baseMessages,
            ...pageMessages,
        },
    };
});
