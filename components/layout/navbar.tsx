import Link from "next/link";
import { MobileNavMenu } from "@/components/layout/mobile-nav-menu";

export function Navbar() {
    return (
        <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/95">
            <nav className="mx-auto flex h-14 w-full max-w-[96rem] items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="প্রধান নেভিগেশন">
                <Link href="/" className="group flex items-center gap-2">
                    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex h-2 w-2 bg-emerald-600 dark:bg-emerald-400" />
                    </span>
                    <span
                        className="font-[family-name:var(--font-cinzel)] text-lg font-black tracking-[0.11em] text-zinc-950 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400"
                        lang="en"
                    >
                        RUKHEDAO
                    </span>
                </Link>
                <div className="hidden items-center gap-5 sm:flex">
                    <Link href="/" className="border-b-2 border-transparent py-1 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-white">
                        প্রচ্ছদ
                    </Link>
                    <Link href="/incidents" className="border-b-2 border-transparent py-1 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-white">
                        ঘটনাগুলো
                    </Link>
                    <Link href="/incident/new" className="inline-flex h-9 items-center justify-center bg-zinc-950 px-4 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
                        ঘটনা জানান
                    </Link>
                </div>
                <MobileNavMenu homeLabel="প্রচ্ছদ" incidentsLabel="ঘটনাগুলো" reportLabel="ঘটনা জানান" />
            </nav>
        </header>
    );
}
