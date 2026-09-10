import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "ঘটনার ধরন | রুখেদাও" };

export default async function AdminCategoriesPage() {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/admin/login");
  const supabase = await createClient();

  // Read-only: existing frozen contract exposes SELECT on categories + incidents to staff.
  // No insert/update/delete, no new RPC, no migration.
  const [catRes, incidentRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,slug,description,is_active,sort_order")
      .order("sort_order", { ascending: true }),
    supabase.from("incidents").select("id,category_id"),
  ]);

  const categories = catRes.data ?? [];
  const counts = new Map<string, number>();
  for (const incident of incidentRes.data ?? []) {
    counts.set(incident.category_id, (counts.get(incident.category_id) ?? 0) + 1);
  }

  return (
    <main className="mx-auto max-w-[96rem] px-6 py-10 lg:px-8">
      <div>
        <Link href="/admin" className="text-xs font-semibold text-zinc-500">← ড্যাশবোর্ড</Link>
        <h1 className="mt-3 text-3xl font-bold">ঘটনার ধরন</h1>
        <p className="mt-1 text-sm text-zinc-500">
          শুধু দেখার জন্য — frozen database-এ ধরন যোগ, পরিবর্তন বা নিষ্ক্রিয় করা যায় না। ঘটনার ধরন বদলাতে ঘটনার পর্যালোচনা পৃষ্ঠা থেকে বিদ্যমান ধরন বেছে নিন।
        </p>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-stone-50 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
              <tr>
                {["নাম", "স্লাগ", "বিবরণ", "ক্রম", "সক্রিয়", "ঘটনা", "কাজ"].map((h) => (
                  <th key={h} className="px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-4 font-medium">{c.name}</td>
                  <td className="px-5 py-4 font-mono text-xs text-zinc-500">{c.slug}</td>
                  <td className="max-w-xs truncate px-5 py-4 text-xs text-zinc-500">{c.description || "—"}</td>
                  <td className="px-5 py-4 text-xs tabular-nums">{c.sort_order}</td>
                  <td className="px-5 py-4 text-xs">{c.is_active ? "হ্যাঁ" : "না"}</td>
                  <td className="px-5 py-4 text-xs tabular-nums">{counts.get(c.id) ?? 0}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin?category=${encodeURIComponent(c.id)}`}
                        className="rounded-lg border px-3 py-1.5 text-xs font-semibold dark:border-zinc-700"
                      >
                        এই ধরনের ঘটনা
                      </Link>
                      {c.slug && (
                        <Link
                          href={`/incidents?category=${encodeURIComponent(c.slug)}`}
                          target="_blank"
                          className="rounded-lg border px-3 py-1.5 text-xs text-zinc-500 dark:border-zinc-700"
                        >
                          ↗ পাবলিক
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {categories.length === 0 && (
          <p className="p-12 text-center text-sm text-zinc-500">কোনো ধরন পাওয়া যায়নি।</p>
        )}
      </section>
    </main>
  );
}
