"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

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
        className="inline-flex h-11 w-11 items-center justify-center text-zinc-800 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-white"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "নেভিগেশন মেনু বন্ধ করুন" : "নেভিগেশন মেনু খুলুন"}
      >
        {open
          ? <X className="h-5 w-5" aria-hidden="true" />
          : <Menu className="h-5 w-5" aria-hidden="true" />
        }
      </button>

      {open && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-b border-zinc-200 bg-white px-4 pb-5 pt-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
        >
          <nav aria-label="মোবাইল নেভিগেশন" className="mx-auto flex w-full max-w-7xl flex-col gap-1">
            <Link
              href="/"
              onClick={closeMenu}
              className="px-4 py-3 text-base font-medium text-zinc-800 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-white"
            >
              {homeLabel}
            </Link>
            <Link
              href="/incidents"
              onClick={closeMenu}
              className="px-4 py-3 text-base font-medium text-zinc-800 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-white"
            >
              {incidentsLabel}
            </Link>
            <Link
              href="/incident/new"
              onClick={closeMenu}
              className="mt-2 inline-flex min-h-11 items-center justify-center bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-white"
            >
              {reportLabel}
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
