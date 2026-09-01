import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { AdminNavbar } from "@/components/admin/admin-navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staffSession = await getCurrentStaff();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-zinc-950 dark:text-white flex flex-col">
      {staffSession && <AdminNavbar staff={staffSession.staff} />}
      <div className="flex-1">{children}</div>
    </div>
  );
}
