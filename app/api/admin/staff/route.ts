import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { readJsonBody } from "@/lib/security/request";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Role = Database["public"]["Enums"]["admin_role"];
type Body = { operation?: unknown; authUserId?: unknown; displayName?: unknown; role?: unknown };

export async function POST(request: Request) {
  try {
    const staff = await getCurrentStaff();
    if (!staff || staff.staff.role !== "admin") return NextResponse.json({ message: "শুধু অ্যাডমিন এই কাজটি করতে পারবেন।" }, { status: 403 });
    const parsed = await readJsonBody<Body>(request); if (!parsed.ok) return parsed.response;
    const operation = typeof parsed.body.operation === "string" ? parsed.body.operation : "";
    const authUserId = typeof parsed.body.authUserId === "string" ? parsed.body.authUserId.trim() : "";
    if (!/^[0-9a-f-]{36}$/i.test(authUserId)) return NextResponse.json({ message: "Auth user ID সঠিক নয়।" }, { status: 400 });
    const supabase = await createClient();
    if (operation === "deactivate") {
      const { error } = await supabase.rpc("admin_deactivate_staff", { p_auth_user_id: authUserId });
      if (error) return NextResponse.json({ message: "স্টাফ নিষ্ক্রিয় করা যায়নি।" }, { status: 400 });
      return NextResponse.json({ success: true });
    }
    if (operation === "role") {
      const role = parsed.body.role === "admin" || parsed.body.role === "moderator" ? parsed.body.role as Role : null;
      if (!role) return NextResponse.json({ message: "ভূমিকা সঠিক নয়।" }, { status: 400 });
      const { error } = await supabase.rpc("admin_change_staff_role", { p_auth_user_id: authUserId, p_role: role });
      if (error) return NextResponse.json({ message: "ভূমিকা পরিবর্তন করা যায়নি।" }, { status: 400 });
      return NextResponse.json({ success: true });
    }
    if (operation === "create") {
      const displayName = typeof parsed.body.displayName === "string" ? parsed.body.displayName.trim() : "";
      const role = parsed.body.role === "admin" || parsed.body.role === "moderator" ? parsed.body.role as Role : null;
      if (!displayName || displayName.length < 2 || displayName.length > 100 || !role) return NextResponse.json({ message: "স্টাফের তথ্য সঠিক নয়।" }, { status: 400 });
      const { error } = await supabase.rpc("admin_create_staff", { p_auth_user_id: authUserId, p_display_name: displayName, p_role: role });
      if (error) return NextResponse.json({ message: "স্টাফ যোগ করা যায়নি। নিশ্চিত করুন Auth user আগে থেকেই আছে।" }, { status: 400 });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ message: "কাজটি সঠিক নয়।" }, { status: 400 });
  } catch (error) { console.error("Staff management route error", error); return NextResponse.json({ message: "সার্ভারে সমস্যা হয়েছে।" }, { status: 500 }); }
}
