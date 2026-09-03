import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
    const locale = "bn";
    const baseMessages = (await import("../messages/bn.json")).default;
    const pageMessages = (await import("../messages/bn-pages.json")).default;

    return {
        locale,
        messages: {
            ...baseMessages,
            ...pageMessages,
        },
    };
});
