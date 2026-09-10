import type { Metadata } from "next";

import { InformationPage } from "@/components/content/information-page";

export const metadata: Metadata = {
    title: "বিষয়বস্তু ব্যবহারের নিয়ম",
    description: "রুখেদাও-তে কী ধরনের বিষয়বস্তু গ্রহণযোগ্য, তা জানুন।",
    alternates: { canonical: "/content-policy" },
    robots: { index: true, follow: true },
    openGraph: { title: "বিষয়বস্তু ব্যবহারের নিয়ম", description: "রুখেদাও-তে কী ধরনের বিষয়বস্তু গ্রহণযোগ্য, তা জানুন।", type: "website", locale: "bn_BD", url: "/content-policy" },
};

export default function ContentPolicyPage() {
    return <InformationPage page="contentPolicy" />;
}
