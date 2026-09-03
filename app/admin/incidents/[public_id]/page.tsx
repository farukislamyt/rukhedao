import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createClient } from "@/lib/supabase/server";
import { ModerationActionPanel } from "@/components/admin/moderation-action-panel";
import type { Database } from "@/types/database";

type Incident = Database["public"]["Tables"]["incidents"]["Row"];
type Revision = Database["public"]["Tables"]["incident_revisions"]["Row"];
type ModerationAction = Database["public"]["Tables"]["moderation_actions"]["Row"];
export async function generateMetadata({ params }: { params: Promise<{ public_id: string }> }): Promise<Metadata> { const { public_id } = await params; return { title: `পর্যালোচনা ${public_id} | স্টাফ পোর্টাল` }; }
function formatDate(value: string | null) { if (!value) return "—"; return new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" }).format(new Date(`${value}T00:00:00+06:00`)); }
function formatTimestamp(value: string | null) { if (!value) return "—"; return new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" }).format(new Date(value)); }

export default async function AdminIncidentDetailPage({ params }: { params: Promise<{ public_id: string }> }) {
  const { public_id } = await params;
  const staffSession = await getCurrentStaff();
  if (!staffSession) redirect("/admin/login");
  const t = await getTranslations("admin");
  const supabase = await createClient();
  const { data: incidentData, error: incidentError } = await supabase.from("incidents").select("*").eq("public_id", public_id).maybeSingle();
  if (incidentError || !incidentData) notFound();
  const incident = incidentData as Incident;
  const [categoriesRes, divisionsRes, districtsRes, revisionsRes, actionsRes] = await Promise.all([
    supabase.from("categories").select("id,name").order("sort_order", { ascending: true }),
    supabase.from("divisions").select("id,name").order("sort_order", { ascending: true }),
    supabase.from("districts").select("id,name,division_id").order("sort_order", { ascending: true }),
    supabase.from("incident_revisions").select("*").eq("incident_id", incident.id).order("revision_number", { ascending: false }),
    supabase.from("moderation_actions").select("*").eq("incident_id", incident.id).order("created_at", { ascending: false }),
  ]);
  const categories = categoriesRes.data ?? [];
  const divisions = divisionsRes.data ?? [];
  const districts = districtsRes.data ?? [];
  const revisions = (revisionsRes.data ?? []) as Revision[];
  const actions = (actionsRes.data ?? []) as ModerationAction[];
  const categoryName = categories.find((c) => c.id === incident.category_id)?.name || "—";
  const divisionName = divisions.find((d) => d.id === incident.division_id)?.name || "—";
  const districtName = districts.find((d) => d.id === incident.district_id)?.name || "—";
  const statusLabels: Record<Incident["status"], string> = { pending: "অপেক্ষমাণ", under_review: "পর্যালোচনাধীন", needs_revision: "সংশোধন প্রয়োজন", approved: "অনুমোদিত", rejected: "প্রত্যাখ্যাত", archived: "সংরক্ষিত" };
  return <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
    <div className="mb-6"><Link href="/admin" className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white">← মডারেশন সারিতে ফিরে যান</Link></div>
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-8">
        <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-5 dark:border-zinc-800"><div className="flex items-center gap-3"><span className="font-mono text-sm font-bold text-zinc-950 dark:text-white">{incident.public_id}</span><span className="rounded-full border border-zinc-200 bg-stone-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{categoryName}</span></div><div className="flex items-center gap-2"><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">অবস্থা: {statusLabels[incident.status]}</span><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">{incident.verification_status}</span></div></div><h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl dark:text-white">{incident.title}</h1><div className="mt-4 flex flex-wrap gap-6 text-xs text-zinc-500 dark:text-zinc-400"><p><strong className="text-zinc-700 dark:text-zinc-300">অবস্থান:</strong> {[districtName, divisionName].filter(Boolean).join(", ")}</p><p><strong className="text-zinc-700 dark:text-zinc-300">ঘটনার তারিখ:</strong> {formatDate(incident.incident_date)}</p><p><strong className="text-zinc-700 dark:text-zinc-300">জমা:</strong> {formatTimestamp(incident.created_at)}</p></div><div className="mt-6 rounded-2xl border border-zinc-100 bg-stone-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-950/50"><h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">জমা দেওয়া বিবরণ</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-800 dark:text-zinc-200">{incident.description}</p></div></article>
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"><h2 className="text-lg font-bold text-zinc-950 dark:text-white">{t("revisionHistory")} ({revisions.length})</h2><div className="mt-5 space-y-4">{revisions.map((rev) => <div key={rev.id} className="rounded-2xl border border-zinc-200 bg-stone-50 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-950"><div className="flex items-center justify-between text-zinc-500"><span className="font-semibold text-zinc-900 dark:text-zinc-100">সংশোধন #{rev.revision_number}</span><span>{formatTimestamp(rev.created_at)}</span></div><p className="mt-2 font-semibold text-zinc-800 dark:text-zinc-200">{rev.title}</p><p className="mt-1 line-clamp-3 text-zinc-600 dark:text-zinc-400">{rev.description}</p></div>)}</div></section>
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"><h2 className="text-lg font-bold text-zinc-950 dark:text-white">{t("auditTrail")} ({actions.length})</h2><div className="mt-5 space-y-3">{actions.length === 0 ? <p className="text-xs text-zinc-500">এখনও কোনো মডারেশন কার্যক্রম রেকর্ড হয়নি।</p> : actions.map((act) => <div key={act.id} className="flex flex-col gap-1 border-b border-zinc-100 pb-3 text-xs last:border-0 dark:border-zinc-800"><div className="flex items-center justify-between"><span className="font-semibold text-zinc-900 dark:text-zinc-100">{act.action}</span><span className="text-zinc-400">{formatTimestamp(act.created_at)}</span></div>{act.reason && <p className="text-zinc-600 dark:text-zinc-400 italic">কারণ: &quot;{act.reason}&quot;</p>}</div>)}</div></section>
      </div>
      <div><div className="sticky top-24"><ModerationActionPanel incident={incident} categories={categories} divisions={divisions} districts={districts} /></div></div>
    </div>
  </main>;
}
