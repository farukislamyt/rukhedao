import type { Metadata } from "next";
import { InformationPage } from "@/components/content/information-page";

export const metadata: Metadata = { title: "যেভাবে কাজ করে", description: "রুখেদাও-তে একটি ঘটনা কীভাবে জানানো, পর্যালোচনা, যাচাই ও প্রকাশ করা হয় তা জানুন।" };

export default function HowItWorksPage() {
    return <InformationPage page="howItWorks" />;
}
