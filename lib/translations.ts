import bn from "@/messages/bn.json";
import bnPages from "@/messages/bn-pages.json";

const messages = {
    ...bn,
    ...bnPages,
} as const;

type Messages = typeof messages;

function resolve(namespace: string, key: string): unknown {
    const value = namespace.split(".").reduce<unknown>((current, part) => {
        if (current && typeof current === "object" && part in current) {
            return (current as Record<string, unknown>)[part];
        }
        return undefined;
    }, messages as unknown);

    return key.split(".").reduce<unknown>((current, part) => {
        if (current && typeof current === "object" && part in current) {
            return (current as Record<string, unknown>)[part];
        }
        return undefined;
    }, value);
}

function interpolate(value: string, values?: Record<string, string | number>): string {
    if (!values) return value;
    return value.replace(/\{([^}]+)\}/g, (match, key: string) =>
        key in values ? String(values[key]) : match,
    );
}

export function translate(namespace: string, key: string, values?: Record<string, string | number>): string {
    const value = resolve(namespace, key);
    if (typeof value !== "string") {
        throw new Error(`Missing Bengali translation: ${namespace}.${key}`);
    }
    return interpolate(value, values);
}

export function useTranslations(namespace: string) {
    return (key: string, values?: Record<string, string | number>) => translate(namespace, key, values);
}

export async function getTranslations(namespace: string) {
    return (key: string, values?: Record<string, string | number>) => translate(namespace, key, values);
}

export type BengaliMessages = Messages;
