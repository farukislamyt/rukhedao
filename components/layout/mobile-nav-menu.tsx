"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Props = { homeLabel: string; incidentsLabel: string; reportLabel: string };

export function MobileNavMenu({ homeLabel, incidentsLabel, reportLabel }: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <div className="sm:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white dark:focus-visible:ring-white"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "নেভিগেশন মেনু বন্ধ করুন" : "নেভিগেশন মেনু খুলুন"}
      >
        {open ? (
          <span className="relative h-5 w-5" aria-hidden="true">
            <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
            <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
          </span>
        ) : (
          <span className="flex h-4 w-5 flex-col justify-center gap-1" aria-hidden="true">
            <span className="h-px w-5 bg-current" />
            <span className="h-px w-5 bg-current" />
            <span className="h-px w-5 bg-current" />
          </span>
        )}
      </button>

      {open && (
        <div id="mobile-navigation" className="absolute inset-x-0 top-full border-b border-zinc-200 bg-white px-4 pb-4 pt-2 dark:border-zinc-800 dark:bg-zinc-950">
          <nav aria-label="মোবাইল নেভিগেশন" className="mx-auto flex w-full max-w-[96rem] flex-col gap-0.5">
            <Link href="/" onClick={closeMenu} className="px-3 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:ring-white">
              {homeLabel}
            </Link>
            <Link href="/incidents" onClick={closeMenu} className="px-3 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:ring-white">
              {incidentsLabel}
            </Link>
            <Link href="/incident/new" onClick={closeMenu} className="mt-2 inline-flex min-h-10 items-center justify-center bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-white">
              {reportLabel}
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
