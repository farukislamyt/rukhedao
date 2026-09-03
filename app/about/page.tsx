import type { Metadata } from "next";

import { InformationPage } from "@/components/content/information-page";

export const metadata: Metadata = {
    title: "রুখেদাও সম্পর্কে",
    description: "রুখেদাও জনস্বার্থের গুরুত্বপূর্ণ ঘটনা জানানো ও নথিভুক্ত করার একটি কমিউনিটি-চালিত প্ল্যাটফর্ম।",
};

export default function AboutPage() {
    return <InformationPage page="about" />;
}
