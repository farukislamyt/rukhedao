import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: Request & { nextUrl: URL }) {
    const url = new URL(request.url);

    if (url.pathname === "/en" || url.pathname.startsWith("/en/")) {
        const targetPath = url.pathname.replace(/^\/en(?=\/|$)/, "/bn");
        url.pathname = targetPath || "/bn";
        return NextResponse.redirect(url, 308);
    }

    return handleI18nRouting(request);
}

export const config = {
    matcher: ["/", "/(bn|en)/:path*"],
};
