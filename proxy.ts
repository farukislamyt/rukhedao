import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
    const url = request.nextUrl.clone();

    if (url.pathname === "/en" || url.pathname.startsWith("/en/")) {
        url.pathname = url.pathname.replace(/^\/en(?=\/|$)/, "/bn");
        return NextResponse.redirect(url, 308);
    }

    return handleI18nRouting(request);
}

export const config = {
    matcher: ["/", "/(bn|en)/:path*"],
};
