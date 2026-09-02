"use client";

import { useEffect, useRef, useState } from "react";

import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

type Props = {
  homeLabel: string;
  incidentsLabel: string;
  reportLabel: string;
  menuLabel: string;
  closeLabel: string;
};

export function MobileNavMenu({
  homeLabel,
  incidentsLabel,
  reportLabel,
  menuLabel,
  closeLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="sm:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-zinc-800 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-white"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? closeLabel : menuLabel}
      >
        {open ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12" />
            <path d="M18 6L6 18" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-b border-zinc-200 bg-white/98 px-4 pb-5 pt-3 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/98"
        >
          <nav aria-label="Mobile navigation" className="mx-auto flex w-full max-w-7xl flex-col gap-1">
            <Link href="/" onClick={closeMenu} className="rounded-xl px-4 py-3 text-base font-medium text-zinc-800 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-white">
              {homeLabel}
            </Link>
            <Link href="/incidents" onClick={closeMenu} className="rounded-xl px-4 py-3 text-base font-medium text-zinc-800 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-white">
              {incidentsLabel}
            </Link>
            <Link href="/incident/new" onClick={closeMenu} className="mt-2 inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-white">
              {reportLabel}
            </Link>
            <div className="mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-800">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
