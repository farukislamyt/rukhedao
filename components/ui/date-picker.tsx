"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

/** Returns "YYYY-MM-DD" in Asia/Dhaka timezone. */
function todayInDhaka(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${v.year}-${v.month}-${v.day}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0 = Sunday
}

function parseYMD(value: string): [number, number, number] | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  return [y, m - 1, d]; // month is 0-indexed
}

function toYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type Props = {
  /** Input name forwarded to the hidden <input> for form submission. */
  name: string;
  /** Controlled value in "YYYY-MM-DD" format. */
  value: string;
  /** Called whenever user picks a date. */
  onChange: (value: string) => void;
  /** Placeholder shown in the trigger when no date is selected. */
  placeholder?: string;
  /** Optional aria-label for the trigger button. */
  label?: string;
};

export function DatePicker({ name, value, onChange, placeholder = "Select date", label }: Props) {
  const today = todayInDhaka();
  const parsedToday = parseYMD(today) ?? [new Date().getFullYear(), new Date().getMonth(), 1];
  const todayYear = parsedToday[0];
  const todayMonth = parsedToday[1];

  const parsed = parseYMD(value);
  const [viewYear, setViewYear] = useState(parsed ? parsed[0] : todayYear);
  const [viewMonth, setViewMonth] = useState(parsed ? parsed[1] : todayMonth);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewYear === todayYear && viewMonth === todayMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function selectDay(day: number) {
    const selected = toYMD(viewYear, viewMonth, day);
    if (selected > today) return;
    onChange(selected);
    setOpen(false);
  }

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startOffset = firstDayOfMonth(viewYear, viewMonth);

  const cells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const canGoNext = !(viewYear === todayYear && viewMonth === todayMonth);

  let displayValue = placeholder;
  if (value) {
    const p = parseYMD(value);
    if (p) displayValue = `${MONTH_NAMES[p[1]]} ${p[2]}, ${p[0]}`;
  }

  const [selYear, selMonth, selDay] = parseYMD(value) ?? [null, null, null];

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} />

      {/* Trigger button */}
      <button
        type="button"
        id={`${name}-trigger`}
        aria-label={label ?? placeholder}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={[
          "mt-2 flex h-12 w-full items-center justify-between border px-4 text-sm outline-none transition",
          "focus:ring-2 focus:ring-zinc-950/10 dark:focus:ring-white/10",
          value
            ? "border-zinc-300 bg-white text-zinc-900 focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
            : "border-zinc-300 bg-white text-zinc-400 focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-500 dark:focus:border-white",
        ].join(" ")}
      >
        <span>{displayValue}</span>
        <CalendarDays className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
      </button>

      {/* Calendar panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Date picker calendar"
          className="absolute left-0 top-full z-50 mt-1 w-72 border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        >
          {/* Month / Year header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              disabled={!canGoNext}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Day-of-week labels */}
          <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5 p-2">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} />;

              const cellValue = toYMD(viewYear, viewMonth, day);
              const isFuture = cellValue > today;
              const isToday = cellValue === today;
              const isSelected =
                selYear === viewYear && selMonth === viewMonth && selDay === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  disabled={isFuture}
                  aria-label={cellValue}
                  aria-pressed={isSelected}
                  className={[
                    "flex h-8 w-full items-center justify-center text-sm transition",
                    isFuture
                      ? "cursor-not-allowed text-zinc-300 dark:text-zinc-700"
                      : isSelected
                      ? "bg-zinc-950 font-semibold text-white dark:bg-white dark:text-zinc-950"
                      : isToday
                      ? "bg-zinc-100 font-semibold text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="border-t border-zinc-100 px-3 py-2 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                const p = parseYMD(today);
                if (p) { setViewYear(p[0]); setViewMonth(p[1]); }
                onChange(today);
                setOpen(false);
              }}
              className="text-xs font-semibold text-zinc-500 underline-offset-2 transition hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-white"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
