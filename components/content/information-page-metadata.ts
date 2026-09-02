import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type InformationPageMetadataProps = {
    namespace: string;
};

export async function getInformationPageMetadata({ namespace }: InformationPageMetadataProps): Promise<Metadata> {
    const t = await getTranslations(`sitePages.${namespace}`);

    return {
        title: `${t("eyebrow")} | RukheDao`,
        description: t("intro"),
    };
}
