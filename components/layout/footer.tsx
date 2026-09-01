import { Link } from "@/i18n/navigation";

export function Footer() {
    return (
        <footer className="border-t border-zinc-200 bg-white text-zinc-700">
            <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
                <div>
                    <Link href="/" className="text-lg font-bold tracking-tight text-zinc-950">RukheDao</Link>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">A public-interest platform for documenting important incidents while keeping public reporting anonymous.</p>
                </div>
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Explore</h2>
                    <div className="mt-4 space-y-3 text-sm">
                        <Link className="block hover:text-zinc-950" href="/incidents">Incidents</Link>
                        <Link className="block hover:text-zinc-950" href="/incident/new">Report an incident</Link>
                        <Link className="block hover:text-zinc-950" href="/how-it-works">How it works</Link>
                    </div>
                </div>
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">About</h2>
                    <div className="mt-4 space-y-3 text-sm">
                        <Link className="block hover:text-zinc-950" href="/about">About RukheDao</Link>
                        <Link className="block hover:text-zinc-950" href="/reporting-guidelines">Reporting guidelines</Link>
                        <Link className="block hover:text-zinc-950" href="/contact">Contact</Link>
                    </div>
                </div>
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Legal</h2>
                    <div className="mt-4 space-y-3 text-sm">
                        <Link className="block hover:text-zinc-950" href="/privacy">Privacy</Link>
                        <Link className="block hover:text-zinc-950" href="/terms">Terms</Link>
                    </div>
                </div>
            </div>
            <div className="border-t border-zinc-200">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                    <p>© {new Date().getFullYear()} RukheDao</p>
                    <p>Anonymous by design.</p>
                </div>
            </div>
        </footer>
    );
}
