import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createClient } from "@/lib/supabase/server";

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

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
    const divisionId = Number(body.divisionId);
    const districtId = Number(body.districtId);
    const incidentDate = typeof body.incidentDate === "string" ? body.incidentDate : "";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (
      title.length < 5 ||
      title.length > 200 ||
      description.length < 20 ||
      description.length > 10000 ||
      !categoryId ||
      !Number.isInteger(divisionId) ||
      !Number.isInteger(districtId) ||
      !incidentDate ||
      reason.length < 3
    ) {
      return NextResponse.json(
        { message: "Please complete all fields with a valid edit reason." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("edit_incident", {
      p_public_id: public_id,
      p_title: title,
      p_description: description,
      p_category_id: categoryId,
      p_division_id: divisionId,
      p_district_id: districtId,
      p_incident_date: incidentDate,
      p_reason: reason,
    });

    if (error) {
      console.error("Failed to edit incident via RPC", error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Incident edit route error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
