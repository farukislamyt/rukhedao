import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "বিশ্লেষণ | রুখেদাও" };
const statuses = ["pending", "under_review", "needs_revision", "approved", "rejected", "archived"] as const;
const statusLabels: Record<string, string> = { pending: "অপেক্ষমাণ", under_review: "পর্যালোচনাধীন", needs_revision: "সংশোধন দরকার", approved: "অনুমোদিত", rejected: "প্রত্যাখ্যাত", archived: "সংরক্ষিত" };
const verificationLabels: Record<string, string> = { reported: "জানানো", partially_verified: "আংশিক যাচাইকৃত", verified: "যাচাইকৃত", disputed: "বিতর্কিত" };
const reasonLabels: Record<string, string> = { false_or_misleading: "ভুল/বিভ্রান্তিকর", privacy_concern: "গোপনীয়তা", harmful_content: "ক্ষতিকর", duplicate: "একই ঘটনা", wrong_location: "ভুল স্থান", wrong_date: "ভুল তারিখ", other: "অন্য" };
function countBy<T extends string>(values: T[]) { return values.reduce<Record<string, number>>((m, v) => { m[v] = (m[v] ?? 0) + 1; return m; }, {}); }
function pct(value: number, total: number) { return total ? `${Math.round(value * 100 / total)}%` : "0%"; }
export default async function AdminAnalyticsPage() {
  const staff = await getCurrentStaff(); if (!staff) redirect("/admin/login");
  const supabase = await createClient();
  const [incidentsRes, reportsRes, actionsRes, categoriesRes, divisionsRes, districtsRes] = await Promise.all([
    supabase.from("incidents").select("id,status,verification_status,category_id,division_id,district_id,created_at,incident_date"),
    supabase.from("incident_reports").select("id,incident_id,reason,created_at"),
    supabase.from("moderation_actions").select("id,action,actor_id,created_at"),
    supabase.from("categories").select("id,name").order("sort_order"),
    supabase.from("divisions").select("id,name").order("sort_order"),
    supabase.from("districts").select("id,name").order("sort_order"),
  ]);
  const incidents = incidentsRes.data ?? [], reports = reportsRes.data ?? [], actions = actionsRes.data ?? [];
  const statusCounts = countBy(incidents.map(i => i.status));
  const verificationCounts = countBy(incidents.map(i => i.verification_status));
  const reasonCounts = countBy(reports.map(r => r.reason));
  const categoryCounts = countBy(incidents.map(i => i.category_id));
  const divisionCounts = countBy(incidents.map(i => String(i.division_id)));
  const categoryMap = new Map((categoriesRes.data ?? []).map(x => [x.id, x.name]));
  const divisionMap = new Map((divisionsRes.data ?? []).map(x => [String(x.id), x.name]));
  const districtMap = new Map((districtsRes.data ?? []).map(x => [String(x.id), x.name]));
  const districtCounts = countBy(incidents.map(i => String(i.district_id)));
  const reportIncidentIds = new Set(reports.map(r => r.incident_id));
  const unresolved = incidents.filter(i => i.status === "approved" && reportIncidentIds.has(i.id)).length;
  return <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
    <div className="flex items-start justify-between gap-4"><div><Link href="/admin" className="text-xs font-semibold text-zinc-500">← ড্যাশবোর্ড</Link><h1 className="mt-3 text-3xl font-bold">প্রশাসনিক বিশ্লেষণ</h1><p className="mt-1 text-sm text-zinc-500">বর্তমান frozen database-এর বিদ্যমান রেকর্ড থেকে তৈরি application-level পরিসংখ্যান।</p></div></div>
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4"><Metric label="মোট ঘটনা" value={incidents.length}/><Metric label="মোট অভিযোগ" value={reports.length}/><Metric label="মডারেশন কার্যক্রম" value={actions.length}/><Metric label="অভিযোগযুক্ত প্রকাশিত ঘটনা" value={unresolved}/></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-2"><Panel title="ঘটনার অবস্থা"><Bars items={statuses.map(k => [statusLabels[k], statusCounts[k] ?? 0])} total={incidents.length}/></Panel><Panel title="যাচাইয়ের অবস্থা"><Bars items={Object.entries(verificationCounts).map(([k,v]) => [verificationLabels[k] ?? k,v])} total={incidents.length}/></Panel><Panel title="অভিযোগের কারণ"><Bars items={Object.entries(reasonCounts).map(([k,v]) => [reasonLabels[k] ?? k,v])} total={reports.length}/></Panel><Panel title="ঘটনার ধরন"><Bars items={Object.entries(categoryCounts).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v]) => [categoryMap.get(k) ?? "অজানা",v])} total={incidents.length}/></Panel><Panel title="বিভাগ"><Bars items={Object.entries(divisionCounts).sort((a,b)=>b[1]-a[1]).map(([k,v]) => [divisionMap.get(k) ?? "অজানা",v])} total={incidents.length}/></Panel><Panel title="জেলা — শীর্ষ ১০"><Bars items={Object.entries(districtCounts).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v]) => [districtMap.get(k) ?? "অজানা",v])} total={incidents.length}/></Panel></div>
    <div className="mt-8 rounded-2xl border bg-white p-5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">শতাংশগুলো বর্তমান রেকর্ডের উপর গণনা করা। এখানে কোনো নতুন data storage, migration, RPC বা schema পরিবর্তন করা হয়নি।</div>
  </main>;
}
function Metric({label,value}:{label:string;value:number}){return <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{value.toLocaleString("bn-BD")}</p></div>}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><h2 className="font-bold">{title}</h2><div className="mt-4">{children}</div></section>}
function Bars({items,total}:{items:[string,number][];total:number}){if(!items.length)return <p className="text-sm text-zinc-500">কোনো তথ্য নেই।</p>;return <div className="space-y-3">{items.map(([label,value])=><div key={label}><div className="flex justify-between gap-4 text-xs"><span>{label}</span><span className="font-semibold">{value.toLocaleString("bn-BD")} · {pct(value,total)}</span></div><div className="mt-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800"><div className="h-2 rounded-full bg-zinc-900 dark:bg-zinc-200" style={{width:`${total?Math.max(2,value*100/total):0}%`}} /></div></div>)}</div>}
