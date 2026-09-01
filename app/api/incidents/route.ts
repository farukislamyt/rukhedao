import { randomBytes } from "node:crypto";
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

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Server-side Supabase service role configuration is missing.");
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

function makePublicId() {
  return `RK-${randomBytes(6).toString("hex").toUpperCase()}`;
}

function isValidCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function todayInDhaka() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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

    // Reference validation uses the public-safe views, not the service-role client.
    // This avoids turning a permissions problem on raw reference tables into a
    // misleading "reference data" submission failure.
    const publicClient = getPublicClient();
    const [{ data: category, error: categoryError }, { data: division, error: divisionError }, { data: district, error: districtError }] = await Promise.all([
      publicClient.from("public_categories").select("id").eq("id", categoryId).maybeSingle(),
      publicClient.from("public_divisions").select("id").eq("id", divisionId).maybeSingle(),
      publicClient.from("public_districts").select("id").eq("id", districtId).eq("division_id", divisionId).maybeSingle(),
    ]);

    if (categoryError || divisionError || districtError) {
      console.error("Incident public reference lookup failed", {
        categoryError,
        divisionError,
        districtError,
      });
      return NextResponse.json({ message: "Unable to load incident reference data. Please refresh and try again." }, { status: 500 });
    }

    if (!category || !division || !district) {
      return NextResponse.json({ message: "The selected incident category or location is no longer available. Please refresh the page." }, { status: 400 });
    }

    const supabase = getAdminClient();
    const publicId = makePublicId();

    // public_id is supplied by the server so the frozen database trigger does
    // not need to execute its legacy gen_random_bytes() fallback.
    const { data: incident, error: insertError } = await supabase
      .from("incidents")
      .insert({
        public_id: publicId,
        category_id: categoryId,
        division_id: divisionId,
        district_id: districtId,
        title,
        description,
        incident_date: incidentDate,
      })
      .select("public_id")
      .single();

    if (insertError || !incident?.public_id) {
      console.error("Anonymous incident insert failed", {
        code: insertError?.code,
        message: insertError?.message,
        details: insertError?.details,
        hint: insertError?.hint,
      });

      if (insertError?.code === "23505") {
        return NextResponse.json({ message: "A submission reference collision occurred. Please try again." }, { status: 409 });
      }

      if (insertError?.code === "23503") {
        return NextResponse.json({ message: "The selected incident reference is no longer available. Please refresh and try again." }, { status: 400 });
      }

      return NextResponse.json({ message: "Unable to submit the incident right now. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ publicId: incident.public_id }, { status: 201 });
  } catch (error) {
    console.error("Anonymous incident submission route failed", error);
    return NextResponse.json({ message: "Unable to submit the incident right now. Please try again." }, { status: 500 });
  }
}
