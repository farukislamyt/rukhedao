import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type VerificationStatus = Database["public"]["Enums"]["verification_status"];

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
    const body = await request.json();
    const toStatus = body.toStatus as VerificationStatus;
    const reason = typeof body.reason === "string" ? body.reason.trim() : undefined;

    if (!toStatus) {
      return NextResponse.json({ message: "Verification status is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("moderate_incident_verification", {
      p_public_id: public_id,
      p_to_status: toStatus,
      p_reason: reason,
    });

    if (error) {
      console.error("Failed to moderate incident verification", error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification moderation route error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
