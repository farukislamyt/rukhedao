import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
    const baseMessages = (await import("../messages/bn.json")).default;
    const pageMessages = (await import("../messages/bn-pages.json")).default;

    return {
        locale: "bn",
        messages: {
            ...baseMessages,
            ...pageMessages,
        },
    };
});
