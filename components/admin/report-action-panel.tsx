"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { reportId: string };

type Action = "report_reviewed" | "report_dismissed" | "report_action_taken";

export function ReportActionPanel({ reportId }: Props) {
  const router = useRouter();
  const [action, setAction] = useState<Action>("report_reviewed");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    if (!reason.trim()) return setMessage("কারণ লিখুন।");
    setLoading(true); setMessage("");
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, reason: reason.trim() }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setMessage(data?.message || "কাজটি করা যায়নি।"); return; }
      setMessage("সফলভাবে সংরক্ষণ করা হয়েছে।");
      router.refresh();
    } catch { setMessage("সার্ভারে যোগাযোগ করা যায়নি।"); }
    finally { setLoading(false); }
  }

  return <div className="mt-5 rounded-2xl border border-zinc-200 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
    <label className="block text-xs font-semibold">অভিযোগের অবস্থা</label>
    <select value={action} onChange={e => setAction(e.target.value as Action)} className="mt-2 h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900">
      <option value="report_reviewed">পর্যালোচনা করা হয়েছে</option>
      <option value="report_dismissed">অভিযোগ গ্রহণ করা হয়নি</option>
      <option value="report_action_taken">ব্যবস্থা নেওয়া হয়েছে</option>
    </select>
    <label className="mt-4 block text-xs font-semibold">কারণ *</label>
    <input value={reason} maxLength={2000} onChange={e => setReason(e.target.value)} placeholder="কী সিদ্ধান্ত নেওয়া হলো এবং কেন লিখুন" className="mt-2 h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
    {message && <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">{message}</p>}
    <button type="button" disabled={loading} onClick={submit} className="mt-4 h-10 rounded-xl bg-zinc-950 px-4 text-xs font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-zinc-950">{loading ? "সংরক্ষণ করা হচ্ছে…" : "সিদ্ধান্ত সংরক্ষণ করুন"}</button>
  </div>;
}
