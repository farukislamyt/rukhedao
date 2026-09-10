import type { Metadata } from "next";
import { InformationPage } from "@/components/content/information-page";

export const metadata: Metadata = { title: "যেভাবে কাজ করে", description: "রুখেদাও-তে একটি ঘটনা কীভাবে জানানো, পর্যালোচনা, যাচাই ও প্রকাশ করা হয় তা জানুন।", alternates: { canonical: "/how-it-works" }, robots: { index: true, follow: true }, openGraph: { title: "যেভাবে কাজ করে", description: "রুখেদাও-তে একটি ঘটনা কীভাবে জানানো, পর্যালোচনা, যাচাই ও প্রকাশ করা হয় তা জানুন।", type: "website", locale: "bn_BD", url: "/how-it-works" } };

export default function HowItWorksPage() {
    return <InformationPage page="howItWorks" />;
}
