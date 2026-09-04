import Link from "next/link";
import { MobileNavMenu } from "@/components/layout/mobile-nav-menu";

export function Navbar() {
    return (
        <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90">
            <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="প্রধান নেভিগেশন">
                <Link href="/" className="group flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 bg-emerald-600" />
                    </span>
                    <span
                        className="font-[family-name:var(--font-cinzel)] text-xl font-black tracking-[0.12em] text-zinc-950 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400"
                        lang="en"
                    >
                        RUKHEDAO
                    </span>
                </Link>
                <div className="hidden items-center gap-6 sm:flex">
                    <Link
                        href="/"
                        className="text-sm font-semibold text-zinc-700 transition-colors hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                    >
                        প্রচ্ছদ
                    </Link>
                    <Link
                        href="/incidents"
                        className="text-sm font-semibold text-zinc-700 transition-colors hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                    >
                        ঘটনাগুলো
                    </Link>
                    <Link
                        href="/incident/new"
                        className="inline-flex h-10 items-center justify-center bg-zinc-950 px-5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    >
                        ঘটনা জানান
                    </Link>
                </div>
                <MobileNavMenu homeLabel="প্রচ্ছদ" incidentsLabel="ঘটনাগুলো" reportLabel="ঘটনা জানান" />
            </nav>
        </header>
    );
}
