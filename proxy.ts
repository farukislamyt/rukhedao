import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: Parameters<typeof handleI18nRouting>[0]) {
    const pathname = request.nextUrl.pathname;

    if (pathname === "/en" || pathname.startsWith("/en/")) {
        const nextUrl = request.nextUrl.clone();
        nextUrl.pathname = pathname.replace(/^\/en(?=\/|$)/, "/bn");
        return NextResponse.redirect(nextUrl);
    }

    return handleI18nRouting(request);
}

export const config = {
    matcher: ["/", "/(bn|en)/:path*"],
};
