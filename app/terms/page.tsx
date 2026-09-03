import type { Metadata } from "next";

import { InformationPage } from "@/components/content/information-page";

export const metadata: Metadata = {
    title: "ব্যবহারের শর্ত",
    description: "রুখেদাও ব্যবহারের শর্ত ও দায়িত্ব সম্পর্কে জানুন।",
};

export default function TermsPage() {
    return <InformationPage page="terms" />;
}
