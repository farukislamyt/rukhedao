import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = { title: "প্রশাসনিক লগইন | রুখেদাও" };
export default async function AdminLoginPage() {
  const staffSession = await getCurrentStaff(); if (staffSession) redirect("/admin");
  return <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-stone-50 px-6 py-12 dark:bg-zinc-950"><div className="w-full max-w-md space-y-8 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-xl font-bold text-white dark:bg-white dark:text-zinc-950">🛡️</div><h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">প্রশাসনিক লগইন</h1><p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">শুধু অনুমোদিত প্রশাসনিক ব্যবহারকারীদের জন্য।</p></div><AdminLoginForm /></div></main>;
}
