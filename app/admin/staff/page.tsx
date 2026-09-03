import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createClient } from "@/lib/supabase/server";
import { StaffManagement } from "@/components/admin/staff-management";
import { CreateStaffForm } from "@/components/admin/create-staff-form";
import type { Database } from "@/types/database";
export const metadata: Metadata = { title: "স্টাফ ব্যবস্থাপনা | প্রশাসনিক প্যানেল" };
type Staff = Database["public"]["Tables"]["admin_users"]["Row"];
export default async function StaffPage() { const current = await getCurrentStaff(); if (!current) redirect("/admin/login"); if (current.staff.role !== "admin") redirect("/admin"); const supabase = await createClient(); const { data } = await supabase.from("admin_users").select("*").order("created_at", { ascending: false }); return <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8"><div className="mb-8"><Link href="/admin" className="text-xs font-semibold text-zinc-500">← ড্যাশবোর্ডে ফিরে যান</Link><h1 className="mt-4 text-3xl font-bold">স্টাফ ব্যবস্থাপনা</h1><p className="mt-1 text-sm text-zinc-500">অ্যাডমিন ও মডারেটরদের ভূমিকা এবং সক্রিয় অবস্থা পরিচালনা করুন।</p></div><CreateStaffForm /><StaffManagement staff={(data ?? []) as Staff[]} /></main>; }
