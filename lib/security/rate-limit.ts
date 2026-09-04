type RateLimitEntry = {
    count: number;
    resetTime: number;
};

const store = new Map<string, RateLimitEntry>();

function cleanUpExpired(now: number) {
    if (store.size < 500) return;
    for (const [key, entry] of store.entries()) {
        if (now > entry.resetTime) store.delete(key);
    }
}

export function checkRateLimit(
    identifier: string,
    limit = 5,
    windowMs = 15 * 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    cleanUpExpired(now);

    const existing = store.get(identifier);

    if (!existing || now > existing.resetTime) {
        const resetTime = now + windowMs;
        store.set(identifier, { count: 1, resetTime });
        return { allowed: true, remaining: limit - 1, resetTime };
    }

    if (existing.count >= limit) {
        return { allowed: false, remaining: 0, resetTime: existing.resetTime };
    }

    existing.count += 1;
    store.set(identifier, existing);
    return { allowed: true, remaining: limit - existing.count, resetTime: existing.resetTime };
}

export function getClientIp(request: Request): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "127.0.0.1"
    );
}
