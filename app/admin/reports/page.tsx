import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createClient } from "@/lib/supabase/server";
import { ReportActionPanel } from "@/components/admin/report-action-panel";
import type { Database } from "@/types/database";

type Report = Database["public"]["Tables"]["incident_reports"]["Row"];
type Incident = Database["public"]["Tables"]["incidents"]["Row"];
const reasonLabel: Record<Report["reason"], string> = { false_or_misleading: "ভুল বা বিভ্রান্তিকর তথ্য", privacy_concern: "গোপনীয়তার সমস্যা", harmful_content: "ক্ষতিকর বিষয়বস্তু", duplicate: "একই ঘটনা", wrong_location: "ভুল স্থান", wrong_date: "ভুল তারিখ", other: "অন্য কারণ" };
const actionLabel: Record<string, string> = { report_reviewed: "পর্যালোচনা করা হয়েছে", report_dismissed: "অভিযোগ গ্রহণ করা হয়নি", report_action_taken: "ব্যবস্থা নেওয়া হয়েছে" };
export const metadata: Metadata = { title: "অভিযোগসমূহ | প্রশাসনিক প্যানেল" };

export default async function AdminReportsPage() {
  const staff = await getCurrentStaff(); if (!staff) redirect("/admin/login");
  const supabase = await createClient();
  const [{ data: reports }, { data: incidents }, { data: actions }] = await Promise.all([
    supabase.from("incident_reports").select("*").order("created_at", { ascending: false }),
    supabase.from("incidents").select("id,public_id,title,status"),
    supabase.from("moderation_actions").select("incident_report_id,action,created_at").not("incident_report_id", "is", null).order("created_at", { ascending: false }),
  ]);
  const incidentMap = new Map((incidents ?? []).map(i => [i.id, i as Pick<Incident, "id" | "public_id" | "title" | "status">]));
  const latestAction = new Map<string, { action: string; created_at: string }>();
  for (const a of actions ?? []) if (a.incident_report_id && !latestAction.has(a.incident_report_id)) latestAction.set(a.incident_report_id, { action: a.action, created_at: a.created_at });
  return <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8"><div className="mb-8"><Link href="/admin" className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white">← ড্যাশবোর্ডে ফিরে যান</Link><h1 className="mt-4 text-3xl font-bold">অভিযোগসমূহ</h1><p className="mt-1 text-sm text-zinc-500">প্রকাশিত ঘটনার বিরুদ্ধে পাঠানো অভিযোগগুলো দেখুন এবং সিদ্ধান্ত নিন।</p></div><div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3"><div className="rounded-2xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs text-zinc-500">মোট অভিযোগ</p><p className="mt-2 text-3xl font-bold">{reports?.length ?? 0}</p></div><div className="rounded-2xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs text-zinc-500">সিদ্ধান্ত বাকি</p><p className="mt-2 text-3xl font-bold">{(reports ?? []).filter(r => !latestAction.has(r.id)).length}</p></div></div><div className="space-y-5">{(reports ?? []).map(r => { const incident = incidentMap.get(r.incident_id); const action = latestAction.get(r.id); return <article key={r.id} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-xs font-bold">{incident?.public_id ?? "—"}</p><h2 className="mt-1 text-lg font-bold">{incident?.title ?? "ঘটনা পাওয়া যায়নি"}</h2><p className="mt-2 text-xs text-zinc-500">অভিযোগ: {reasonLabel[r.reason]}</p></div><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold dark:bg-zinc-800">{action ? actionLabel[action.action] ?? action.action : "সিদ্ধান্ত বাকি"}</span></div><div className="mt-5 rounded-2xl bg-stone-50 p-4 dark:bg-zinc-950"><p className="text-xs font-semibold text-zinc-500">অভিযোগের বিস্তারিত</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{r.description || "কোনো অতিরিক্ত বিবরণ দেওয়া হয়নি।"}</p></div><div className="mt-4 flex flex-wrap gap-3 text-xs"><Link href={`/admin/incidents/${incident?.public_id ?? ""}`} className="rounded-xl border border-zinc-300 px-3 py-2 font-semibold dark:border-zinc-700">ঘটনাটি দেখুন</Link>{!action && <ReportActionPanel reportId={r.id} />}</div></article> })}{(reports ?? []).length === 0 && <div className="rounded-3xl border border-dashed p-12 text-center text-sm text-zinc-500">এখনও কোনো অভিযোগ আসেনি।</div>}</div></main>;
}
