export const SITE_URL = "https://rukhedao.vercel.app";
export const SITE_NAME = "রুখেদাও";
export const SITE_DESCRIPTION =
    "পরিচয় গোপন রেখে জনস্বার্থসংশ্লিষ্ট গুরুত্বপূর্ণ ঘটনা জানানো, যাচাই করা এবং জনসাধারণের জন্য নথিভুক্ত করার প্ল্যাটফর্ম।";

export function absoluteUrl(path = "/") {
    return new URL(path, SITE_URL).toString();
}

export function cleanDescription(value: string | null | undefined, maxLength = 160) {
    if (!value) return SITE_DESCRIPTION;
    const normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized) return SITE_DESCRIPTION;
    return normalized.length > maxLength
        ? `${normalized.slice(0, maxLength - 1).trim()}…`
        : normalized;
}
