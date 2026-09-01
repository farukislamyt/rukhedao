import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type SubmissionBody = {
  title?: unknown;
  description?: unknown;
  incidentDate?: unknown;
  categoryId?: unknown;
  divisionId?: unknown;
  districtId?: unknown;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Public Supabase configuration is missing.");
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

function todayInDhaka() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isValidCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function databaseErrorMessage(error: { code?: string; message?: string } | null) {
  const code = error?.code ?? "";
  const message = error?.message?.toLowerCase() ?? "";

  if (code === "PGRST202" || message.includes("create_anonymous_incident")) {
    return "The incident submission database is not ready yet. Please deploy the latest database migration and try again.";
  }

  if (code === "42501" || message.includes("permission denied")) {
    return "Incident submission permissions are not configured correctly. Please deploy the latest database migration.";
  }

  if (code === "23505") {
    return "A submission reference collision occurred. Please try again.";
  }

  if (code === "22023") {
    if (message.includes("title")) return "Please enter a valid incident title.";
    if (message.includes("description")) return "Please enter a valid incident description.";
    if (message.includes("future")) return "The incident date cannot be in the future.";
    if (message.includes("date")) return "Please enter a valid incident date.";
  }

  if (code === "23503") {
    if (message.includes("category")) return "The selected incident category is no longer available. Please refresh and try again.";
    if (message.includes("division")) return "The selected division is no longer available. Please refresh and try again.";
    if (message.includes("district")) return "The selected district is no longer available. Please refresh and try again.";
    return "The selected incident reference is no longer available. Please refresh and try again.";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmissionBody;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const incidentDate = typeof body.incidentDate === "string" ? body.incidentDate : "";
    const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
    const divisionId = Number(body.divisionId);
    const districtId = Number(body.districtId);

    if (
      title.length < 5 ||
      title.length > 200 ||
      description.length < 20 ||
      description.length > 10000 ||
      !categoryId ||
      !Number.isInteger(divisionId) ||
      !Number.isInteger(districtId)
    ) {
      return NextResponse.json({ message: "Please complete all required incident fields." }, { status: 400 });
    }

    if (!isValidCalendarDate(incidentDate)) {
      return NextResponse.json({ message: "Please enter a valid incident date." }, { status: 400 });
    }

    if (incidentDate > todayInDhaka()) {
      return NextResponse.json({ message: "The incident date cannot be in the future." }, { status: 400 });
    }

    const supabase = getPublicClient();

    // Canonical anonymous write path. The database RPC performs the final
    // validation, generates the public reference, creates revision #1 and
    // writes the incident under SECURITY DEFINER privileges. The API role
    // never receives direct INSERT permission on the incidents table.
    const { data: publicId, error } = await supabase.rpc("create_anonymous_incident", {
      p_title: title,
      p_description: description,
      p_category_id: categoryId,
      p_division_id: divisionId,
      p_district_id: districtId,
      p_incident_date: incidentDate,
    });

    if (error || typeof publicId !== "string" || !publicId.trim()) {
      console.error("Anonymous incident RPC failed", {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
      });

      const mapped = databaseErrorMessage(error);
      return NextResponse.json(
        { message: mapped ?? "Unable to submit the incident right now. Please try again." },
        { status: mapped?.includes("not ready") || mapped?.includes("permissions") ? 503 : 500 },
      );
    }

    return NextResponse.json({ publicId: publicId.trim() }, { status: 201 });
  } catch (error) {
    console.error("Anonymous incident submission route failed", error);
    return NextResponse.json({ message: "Unable to submit the incident right now. Please try again." }, { status: 500 });
  }
}
