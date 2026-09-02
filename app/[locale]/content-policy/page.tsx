import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { InformationPage } from "@/components/content/information-page";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("sitePages.contentPolicy");

    return {
        title: t("title"),
        description: t("intro"),
    };
}

export default function ContentPolicyPage() {
    return <InformationPage namespace="contentPolicy" />;
}
