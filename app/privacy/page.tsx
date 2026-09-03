import type { Metadata } from "next";

import { InformationPage } from "@/components/content/information-page";

export const metadata: Metadata = {
    title: "গোপনীয়তা",
    description: "রুখেদাও কীভাবে তথ্য ও গোপনীয়তা রক্ষা করে তা জানুন।",
};

export default function PrivacyPage() {
    return <InformationPage page="privacy" />;
}
