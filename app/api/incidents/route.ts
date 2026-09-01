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

function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Public Supabase configuration is missing.");
  }

  return createClient<Database>(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

function isValidCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
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
      title.length < 5 || title.length > 200 ||
      description.length < 20 || description.length > 10000 ||
      !Number.isInteger(divisionId) || !Number.isInteger(districtId) ||
      !categoryId
    ) {
      return NextResponse.json({ message: "Invalid incident submission." }, { status: 400 });
    }

    if (!isValidCalendarDate(incidentDate)) {
      return NextResponse.json({ message: "Invalid incident date." }, { status: 400 });
    }

    if (incidentDate > todayInDhaka()) {
      return NextResponse.json({ message: "The incident date cannot be in the future." }, { status: 400 });
    }

    const supabase = getPublicClient();

    // The frozen database contract exposes anonymous submission as a
    // SECURITY DEFINER RPC granted to anon. Use that canonical path instead
    // of attempting a direct table INSERT from an API role. This keeps the
    // database-side validation, public-ID generation, and initial revision
    // creation inside the frozen database contract and does not require the
    // service-role key for public incident submission.
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

      if (error?.code === "23505") {
        return NextResponse.json({ message: "A submission reference collision occurred. Please try again." }, { status: 409 });
      }

      if (error?.code === "23503") {
        return NextResponse.json({ message: "The selected incident reference is no longer available. Please refresh and try again." }, { status: 400 });
      }

      const message = error?.message?.toLowerCase() ?? "";
      if (message.includes("future")) {
        return NextResponse.json({ message: "The incident date cannot be in the future." }, { status: 400 });
      }

      if (message.includes("category")) {
        return NextResponse.json({ message: "The selected incident category is no longer available. Please refresh and try again." }, { status: 400 });
      }

      if (message.includes("division")) {
        return NextResponse.json({ message: "The selected division is no longer available. Please refresh and try again." }, { status: 400 });
      }

      if (message.includes("district")) {
        return NextResponse.json({ message: "The selected district is no longer available. Please refresh and try again." }, { status: 400 });
      }

      return NextResponse.json({ message: "Unable to submit the incident right now. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ publicId: publicId.trim() }, { status: 201 });
  } catch (error) {
    console.error("Anonymous incident submission route failed", error);
    return NextResponse.json({ message: "Unable to submit the incident right now. Please try again." }, { status: 500 });
  }
}
