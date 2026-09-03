import type { Metadata } from "next";

import { InformationPage } from "@/components/content/information-page";

export const metadata: Metadata = {
    title: "নিরাপত্তা",
    description: "রুখেদাও-এর নিরাপত্তা ব্যবস্থা সম্পর্কে জানুন।",
};

export default function SecurityPage() {
    return <InformationPage page="security" />;
}
