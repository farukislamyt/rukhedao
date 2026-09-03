import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { readJsonBody } from "@/lib/security/request";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type IncidentStatus = Database["public"]["Enums"]["incident_status"];
type StatusBody = { toStatus?: unknown; reason?: unknown };
const INCIDENT_STATUSES = [
  "pending",
  "under_review",
  "needs_revision",
  "approved",
  "rejected",
  "archived",
] as const satisfies readonly IncidentStatus[];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ public_id: string }> },
) {
  try {
    const staffSession = await getCurrentStaff();
    if (!staffSession) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { public_id } = await params;
    if (!public_id || public_id.length > 128) {
      return NextResponse.json({ message: "Invalid incident identifier." }, { status: 400 });
    }

    const parsed = await readJsonBody<StatusBody>(request);
    if (!parsed.ok) return parsed.response;

    const toStatus = typeof parsed.body.toStatus === "string" ? parsed.body.toStatus : "";
    const reason = typeof parsed.body.reason === "string" ? parsed.body.reason.trim() : undefined;

    if (!INCIDENT_STATUSES.includes(toStatus as IncidentStatus)) {
      return NextResponse.json({ message: "Invalid target status." }, { status: 400 });
    }

    if (reason && reason.length > 2000) {
      return NextResponse.json({ message: "The moderation reason is too long." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("moderate_incident_status", {
      p_public_id: public_id,
      p_to_status: toStatus as IncidentStatus,
      p_reason: reason,
    });

    if (error) {
      console.error("Failed to moderate incident status", {
        code: error.code,
        message: error.message,
      });
      return NextResponse.json({ message: "Unable to update incident status." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status moderation route error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
