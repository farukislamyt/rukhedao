import type { Metadata } from "next";

import { InformationPage } from "@/components/content/information-page";

export const metadata: Metadata = {
    title: "গোপনীয়তা",
    description: "রুখেদাও কীভাবে তথ্য ও গোপনীয়তা রক্ষা করে তা জানুন।",
    alternates: { canonical: "/privacy" },
    robots: { index: true, follow: true },
    openGraph: { title: "গোপনীয়তা", description: "রুখেদাও কীভাবে তথ্য ও গোপনীয়তা রক্ষা করে তা জানুন।", type: "website", locale: "bn_BD", url: "/privacy" },
};

export default function PrivacyPage() {
    return <InformationPage page="privacy" />;
}
