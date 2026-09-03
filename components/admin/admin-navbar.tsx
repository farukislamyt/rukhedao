"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AdminUser } from "@/lib/auth/get-current-staff";

type Props = { staff: AdminUser };

export function AdminNavbar({ staff }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
            <span>রুখেদাও</span>
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {staff.role === "admin" ? "অ্যাডমিন" : "মডারেটর"}
            </span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 md:flex" aria-label="অ্যাডমিন নেভিগেশন">
            <Link href="/admin" className="transition hover:text-zinc-950 dark:hover:text-white">ঘটনা</Link>
            <Link href="/admin/reports" className="transition hover:text-zinc-950 dark:hover:text-white">অভিযোগ</Link>
            <Link href="/admin/verification" className="transition hover:text-zinc-950 dark:hover:text-white">যাচাই</Link>
            {staff.role === "admin" && <Link href="/admin/staff" className="transition hover:text-zinc-950 dark:hover:text-white">স্টাফ</Link>}
            <Link href="/incidents" target="_blank" className="text-xs text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-300">↗ পাবলিক সাইট</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{staff.display_name}</p>
          </div>
          <button type="button" onClick={handleSignOut} className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white">সাইন আউট</button>
        </div>
      </div>
    </header>
  );
}
