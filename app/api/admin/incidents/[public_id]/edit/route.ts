import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { readJsonBody } from "@/lib/security/request";
import { createClient } from "@/lib/supabase/server";

type EditBody = {
  title?: unknown;
  description?: unknown;
  categoryId?: unknown;
  divisionId?: unknown;
  districtId?: unknown;
  incidentDate?: unknown;
  reason?: unknown;
};

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

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

    const parsed = await readJsonBody<EditBody>(request);
    if (!parsed.ok) return parsed.response;

    const title = typeof parsed.body.title === "string" ? parsed.body.title.trim() : "";
    const description = typeof parsed.body.description === "string" ? parsed.body.description.trim() : "";
    const categoryId = typeof parsed.body.categoryId === "string" ? parsed.body.categoryId : "";
    const divisionId = Number(parsed.body.divisionId);
    const districtId = Number(parsed.body.districtId);
    const incidentDate = typeof parsed.body.incidentDate === "string" ? parsed.body.incidentDate : "";
    const reason = typeof parsed.body.reason === "string" ? parsed.body.reason.trim() : "";

    if (
      title.length < 5 ||
      title.length > 200 ||
      description.length < 20 ||
      description.length > 10000 ||
      !categoryId ||
      !Number.isInteger(divisionId) ||
      !Number.isInteger(districtId) ||
      !validDate(incidentDate) ||
      reason.length < 3 ||
      reason.length > 2000
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
      console.error("Failed to edit incident via RPC", {
        code: error.code,
        message: error.message,
      });
      return NextResponse.json({ message: "Unable to edit incident." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Incident edit route error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
