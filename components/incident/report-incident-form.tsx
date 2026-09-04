"use client";

import { useRef, useState } from "react";

type Props = {
  publicId: string;
  labels: {
    title: string;
    description: string;
    reason: string;
    reasonPlaceholder: string;
    descriptionPlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
    reasons: Record<string, string>;
  };
};

const reasons = [
  "false_or_misleading",
  "privacy_concern",
  "harmful_content",
  "duplicate",
  "wrong_location",
  "wrong_date",
  "other",
] as const;

export function ReportIncidentForm({ publicId, labels: t }: Props) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<"success" | "error" | "">("");
  const locked = useRef(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    setSubmitting(true);
    setMessage("");

    const trimmedDescription = description.trim();
    if (!reasons.includes(reason as (typeof reasons)[number]) || (trimmedDescription && (trimmedDescription.length < 5 || trimmedDescription.length > 2000))) {
      setSubmitting(false);
      locked.current = false;
      setMessage("error");
      return;
    }

    try {
      const response = await fetch("/api/incidents/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicId,
          reason,
          description: trimmedDescription || undefined,
        }),
      });

      if (!response.ok) {
        setMessage("error");
        setSubmitting(false);
        locked.current = false;
        return;
      }

      setMessage("success");
      setReason("");
      setDescription("");
      setSubmitting(false);
    } catch {
      setMessage("error");
      setSubmitting(false);
      locked.current = false;
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="incident-report-reason" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t.reason}
        </label>
        <select
          id="incident-report-reason"
          required
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mt-2 h-12 w-full border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
        >
          <option value="">{t.reasonPlaceholder}</option>
          {reasons.map((value) => (
            <option key={value} value={value}>
              {t.reasons[value]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="incident-report-description" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t.description}
        </label>
        <textarea
          id="incident-report-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={2000}
          rows={5}
          className="mt-2 w-full resize-y border border-zinc-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
          placeholder={t.descriptionPlaceholder}
        />
      </div>

      {message === "success" && (
        <p role="status" aria-live="polite" className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {t.success}
        </p>
      )}
      {message === "error" && (
        <p role="alert" aria-live="assertive" className="border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {t.error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !reason}
        className="h-11 w-full border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-600"
      >
        {submitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
