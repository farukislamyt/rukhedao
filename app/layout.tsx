import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

import "./globals.css";

const siteUrl = "https://rukhedao.vercel.app";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: "রুখেদাও",
    description:
        "বেনামী রিপোর্টিং ও পর্যালোচনার মাধ্যমে জনস্বার্থসংশ্লিষ্ট গুরুত্বপূর্ণ ঘটনাগুলো নথিভুক্ত করার একটি প্ল্যাটফর্ম।",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="bn"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                <Navbar />
                {children}
                <Footer />
            </body>
        </html>
    );
}
