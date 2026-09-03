import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { readJsonBody } from "@/lib/security/request";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Action = Database["public"]["Enums"]["moderation_action_type"];
const ACTIONS = ["report_reviewed", "report_dismissed", "report_action_taken"] as const satisfies readonly Action[];

type Body = { action?: unknown; reason?: unknown };

export async function POST(request: Request, { params }: { params: Promise<{ report_id: string }> }) {
  try {
    const staff = await getCurrentStaff();
    if (!staff) return NextResponse.json({ message: "অনুমতি নেই।" }, { status: 401 });
    const { report_id } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(report_id)) return NextResponse.json({ message: "অভিযোগের নম্বর সঠিক নয়।" }, { status: 400 });
    const parsed = await readJsonBody<Body>(request);
    if (!parsed.ok) return parsed.response;
    const action = typeof parsed.body.action === "string" ? parsed.body.action : "";
    const reason = typeof parsed.body.reason === "string" ? parsed.body.reason.trim() : undefined;
    if (!ACTIONS.includes(action as Action)) return NextResponse.json({ message: "কাজটি সঠিক নয়।" }, { status: 400 });
    if (reason && reason.length > 2000) return NextResponse.json({ message: "কারণটি খুব বড়।" }, { status: 400 });
    const supabase = await createClient();
    const { error } = await supabase.rpc("moderate_incident_report", { p_report_id: report_id, p_action: action as Action, p_reason: reason });
    if (error) {
      console.error("Failed to moderate incident report", { code: error.code, message: error.message });
      return NextResponse.json({ message: "অভিযোগটি সংরক্ষণ করা যায়নি।" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Report moderation route error", error);
    return NextResponse.json({ message: "সার্ভারে সমস্যা হয়েছে।" }, { status: 500 });
  }
}
