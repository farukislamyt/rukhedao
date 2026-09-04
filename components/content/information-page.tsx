import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { IncidentLedgerSidebar } from "@/components/incident/incident-ledger-sidebar";
import { getHomeLedgerData } from "@/features/home/get-home-ledgers";

type Page = "about" | "privacy" | "security" | "terms" | "contentPolicy" | "howItWorks";
type Content = { eyebrow: string; title: string; intro: string; sections: { title: string; body: string }[] };

const pages: Record<Page, Content> = {
    about: { eyebrow: "আমাদের সম্পর্কে", title: "রুখেদাও সম্পর্কে", intro: "রুখেদাও জনস্বার্থের গুরুত্বপূর্ণ ঘটনা জানানো ও নথিভুক্ত করার একটি কমিউনিটি-চালিত প্ল্যাটফর্ম। এখানে তথ্যদাতার পরিচয় গোপন রাখা হয়।", sections: [{ title: "রুখেদাও কেন তৈরি", body: "অনেক মানুষ এমন ঘটনা দেখেন, যার একটি পরিষ্কার জনসাধারণের নথি থাকা দরকার। কিন্তু সেই ঘটনার সঙ্গে নিজের পরিচয় যুক্ত করতে তারা স্বাচ্ছন্দ্যবোধ নাও করতে পারেন। রুখেদাও পরিচয় গোপন রেখে ঘটনা জানানোর সুযোগ তৈরি করেছে।" }, { title: "রুখেদাও কীভাবে কাজ করে", body: "একটি ঘটনা জানানোর পর সেটি পর্যালোচনা করা হয়। প্রয়োজন হলে তথ্য সংশোধন বা বাদ দেওয়া হতে পারে। অনুমোদিত ঘটনা পরে জনসাধারণের নথিতে প্রকাশ করা হয়।" }, { title: "তথ্যদাতার পরিচয়", body: "ঘটনা জানাতে কোনো অ্যাকাউন্ট, প্রোফাইল বা লগইন করার প্রয়োজন নেই। জনসাধারণের নথিতে তথ্যদাতার পরিচয় সংক্রান্ত তথ্য রাখা হয় না।" }, { title: "আমাদের লক্ষ্য", body: "সহজ, নির্ভরযোগ্য ও জনস্বার্থের একটি নথি তৈরি করা—যেখানে গুরুত্বপূর্ণ ঘটনাগুলো পরিচয় গোপন রেখে সংরক্ষণ ও যাচাই করা যায়।" }] },
    privacy: { eyebrow: "গোপনীয়তা", title: "গোপনীয়তা", intro: "রুখেদাও এমনভাবে তৈরি করা হয়েছে যাতে ঘটনা জানানোর সময় তথ্যদাতার পরিচয় প্রকাশ না করতে হয়।", sections: [{ title: "কোনো অ্যাকাউন্ট নেই", body: "ঘটনা জানাতে সাধারণ ব্যবহারকারীর অ্যাকাউন্ট বা প্রোফাইল তৈরি করতে হয় না।" }, { title: "জনসাধারণের নথিতে পরিচয় নেই", body: "প্রকাশিত ঘটনার নথিতে তথ্যদাতার নাম, প্রোফাইল বা পরিচয় প্রকাশ করা হয় না।" }, { title: "যে তথ্য দরকার, সেটুকুই", body: "ঘটনাটি বোঝা, যাচাই করা এবং জনসাধারণের জন্য নথিভুক্ত করার কাজে প্রয়োজনীয় তথ্যকেই গুরুত্ব দেওয়া হয়।" }, { title: "আপনার দায়িত্ব", body: "ঘটনা জানানোর সময় নিজের বা অন্য কারও অপ্রয়োজনীয় ব্যক্তিগত তথ্য বিবরণে না দেওয়াই নিরাপদ।" }] },
    security: { eyebrow: "নিরাপত্তা", title: "নিরাপত্তা", intro: "রুখেদাও-এর নিরাপত্তা ব্যবস্থা মূলত পরিচয় গোপন রাখা, অনুমোদিত প্রশাসনিক কাজ আলাদা রাখা এবং প্রকাশের আগে পর্যালোচনার ওপর নির্ভর করে।", sections: [{ title: "অনুমোদিত প্রশাসনিক কাজ", body: "ঘটনা পর্যালোচনা, সম্পাদনা, যাচাই ও প্রকাশের কাজ কেবল অনুমোদিত প্রশাসনিক ব্যবহারকারীরা করতে পারেন।" }, { title: "প্রকাশের আগে পর্যালোচনা", body: "জনসাধারণের নথিতে কোনো ঘটনা প্রকাশের আগে সেটি প্রশাসনিক পর্যালোচনার মধ্য দিয়ে যায়।" }, { title: "তথ্য যাচাই", body: "ঘটনার যাচাইয়ের অবস্থা আলাদাভাবে দেখানো হয়, যাতে পাঠক নথিটির অবস্থান বুঝতে পারেন।" }, { title: "নিরাপদ ব্যবহার", body: "ঘটনা জানানোর সময় পাসওয়ার্ড, ব্যক্তিগত যোগাযোগের তথ্য বা অপ্রয়োজনীয় সংবেদনশীল তথ্য লিখবেন না।" }] },
    terms: { eyebrow: "ব্যবহারের শর্ত", title: "ব্যবহারের শর্ত", intro: "রুখেদাও ব্যবহার করে ঘটনা জানানোর সময় কিছু মৌলিক নিয়ম ও দায়িত্ব মেনে চলতে হবে।", sections: [{ title: "সত্য ও জনস্বার্থের তথ্য দিন", body: "ইচ্ছাকৃতভাবে মিথ্যা, বিভ্রান্তিকর বা প্রতারণামূলক তথ্য জমা দেবেন না।" }, { title: "ব্যক্তিগত তথ্য এড়িয়ে চলুন", body: "ঘটনার জন্য যতটা দরকার তার বেশি ব্যক্তিগত বা পরিচয় শনাক্তকারী তথ্য দেবেন না।" }, { title: "পর্যালোচনা ও পরিবর্তন", body: "প্রয়োজনে প্রশাসক কোনো তথ্য সংশোধন, ব্যক্তিগত তথ্য বাদ দেওয়া, প্রকাশ স্থগিত বা নথি সরিয়ে দিতে পারেন।" }, { title: "জনস্বার্থকে অগ্রাধিকার", body: "রুখেদাও-এর নথি জনস্বার্থে ব্যবহারের জন্য। অন্যকে হয়রানি, হুমকি বা ক্ষতি করার উদ্দেশ্যে এটি ব্যবহার করা যাবে না।" }] },
    contentPolicy: { eyebrow: "বিষয়বস্তু ব্যবহারের নিয়ম", title: "বিষয়বস্তু ব্যবহারের নিয়ম", intro: "রুখেদাও-তে প্রকাশিত তথ্য যেন জনস্বার্থে, প্রাসঙ্গিক এবং দায়িত্বশীলভাবে ব্যবহার করা হয়—এই নিয়মগুলো সেই উদ্দেশ্যে।", sections: [{ title: "গ্রহণযোগ্য বিষয়বস্তু", body: "জনস্বার্থের গুরুত্বপূর্ণ ঘটনা, যাচাইযোগ্য তথ্য এবং ঘটনাটি বোঝার জন্য প্রয়োজনীয় প্রাসঙ্গিক বিবরণ দিন।" }, { title: "যা দেওয়া উচিত নয়", body: "হুমকি, ঘৃণা, হয়রানি, অশ্লীলতা, ইচ্ছাকৃত মিথ্যা তথ্য বা অপ্রয়োজনীয় ব্যক্তিগত তথ্য জমা দেবেন না।" }, { title: "সম্পাদনা ও পর্যালোচনা", body: "নিয়ম ভঙ্গ করে এমন বা অপ্রয়োজনীয় তথ্য প্রশাসনিক পর্যালোচনায় সংশোধন বা বাদ দেওয়া হতে পারে।" }, { title: "প্রকাশের সিদ্ধান্ত", body: "সব জমা দেওয়া ঘটনা প্রকাশ করা হয় না। জনস্বার্থ, তথ্যের মান, নিরাপত্তা ও নীতিমালা বিবেচনা করে প্রকাশের সিদ্ধান্ত নেওয়া হয়।" }] },
    howItWorks: { eyebrow: "যেভাবে কাজ করে", title: "একটি ঘটনা কীভাবে নথিতে আসে", intro: "রুখেদাও-তে একটি ঘটনা জানানোর পর সেটি পর্যালোচনা, প্রয়োজনে যাচাই এবং অনুমোদনের পর জনসাধারণের নথিতে প্রকাশ করা হয়।", sections: [{ title: "১. ঘটনা জানান", body: "কোনো অ্যাকাউন্ট না খুলেই ঘটনাটি বোঝার জন্য দরকারি তথ্য দিন। আপনার পরিচয় দেওয়ার প্রয়োজন নেই।" }, { title: "২. পর্যালোচনা", body: "জমা দেওয়া তথ্য প্রশাসনিকভাবে পর্যালোচনা করা হয়। প্রয়োজনে ভুল বা অপ্রয়োজনীয় তথ্য সংশোধন বা বাদ দেওয়া হতে পারে।" }, { title: "৩. যাচাই", body: "ঘটনাটি কতটা যাচাই করা হয়েছে, তা আলাদা যাচাইয়ের অবস্থার মাধ্যমে জানানো হয়।" }, { title: "৪. প্রকাশ", body: "অনুমোদিত ঘটনা জনসাধারণের নথিতে প্রকাশিত হতে পারে। পরে কোনো পরিবর্তন হলে তার ইতিহাসও রাখা হয়।" }] },
};

export async function InformationPage({ page }: { page: Page }) {
    const content = pages[page];
    const ledgers = await getHomeLedgerData();

    return (
        <main className="flex-1 bg-stone-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
            <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
                    <Breadcrumbs items={[{ label: content.title }]} homeLabel="প্রচ্ছদ" />
                </div>
            </section>
            <section>
                <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                        <div>
                            <div className="mb-8">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">{content.eyebrow}</p>
                                <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">{content.title}</h1>
                                <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-400 sm:text-xl">{content.intro}</p>
                            </div>
                            <div className="divide-y divide-zinc-200 border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                                {content.sections.map((section) => (
                                    <article key={section.title} className="p-6 sm:p-8 lg:p-10">
                                        <h2 className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">{section.title}</h2>
                                        <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg sm:leading-8">{section.body}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                        <IncidentLedgerSidebar ledgers={ledgers} />
                    </div>
                </div>
            </section>
        </main>
    );
}
