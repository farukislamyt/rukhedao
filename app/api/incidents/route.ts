import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

type SubmissionBody = {
  title?: unknown;
  description?: unknown;
  incidentDate?: unknown;
  categoryId?: unknown;
  divisionId?: unknown;
  districtId?: unknown;
};

const MAX_BODY_BYTES = 16_384;
const dhakaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dhaka",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function url() {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!v) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing.");
  return v;
}

function reader() {
  const k = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!k) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing.");
  return createClient<Database>(url(), k, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

function today() {
  const p = dhakaDateFormatter.formatToParts(new Date());
  const v = Object.fromEntries(p.map((x) => [x.type, x.value]));
  return `${v.year}-${v.month}-${v.day}`;
}

function validDate(v: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

function makePublicId() {
  return `RK-${randomBytes(6).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`submit:${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "অনেকবার জমা দেওয়ার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
        { status: 429 }
      );
    }

    const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
    if (contentType !== "application/json") {
      return NextResponse.json({ message: "অনুরোধের ধরন সঠিক নয়।" }, { status: 415 });
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && Number.isFinite(Number(contentLength)) && Number(contentLength) > MAX_BODY_BYTES) {
      return NextResponse.json({ message: "জমা দেওয়া ঘটনার আকার অনেক বড়।" }, { status: 413 });
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ message: "জমা দেওয়া ঘটনার আকার অনেক বড়।" }, { status: 413 });
    }

    let body: SubmissionBody;
    try {
      body = JSON.parse(rawBody) as SubmissionBody;
    } catch {
      return NextResponse.json({ message: "অনুরোধের তথ্য সঠিক নয়।" }, { status: 400 });
    }

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
      return NextResponse.json({ message: "প্রয়োজনীয় সব তথ্য পূরণ করুন।" }, { status: 400 });
    }

    if (!validDate(incidentDate)) {
      return NextResponse.json({ message: "সঠিক ঘটনার তারিখ দিন।" }, { status: 400 });
    }

    if (incidentDate > today()) {
      return NextResponse.json({ message: "ভবিষ্যতের তারিখ দেওয়া যাবে না।" }, { status: 400 });
    }

    const read = reader();
    const [category, division, district] = await Promise.all([
      read.from("public_categories").select("id").eq("id", categoryId).maybeSingle(),
      read.from("public_divisions").select("id").eq("id", divisionId).maybeSingle(),
      read.from("public_districts").select("id,division_id").eq("id", districtId).eq("division_id", divisionId).maybeSingle(),
    ]);

    if (category.error || division.error || district.error) {
      console.error("Incident reference lookup failed", { category: category.error, division: division.error, district: district.error });
      return NextResponse.json({ message: "তথ্য এই মুহূর্তে পাওয়া যাচ্ছে না। পৃষ্ঠাটি রিফ্রেশ করে আবার চেষ্টা করুন।" }, { status: 503 });
    }

    if (!category.data || !division.data || !district.data) {
      return NextResponse.json({ message: "বেছে নেওয়া তথ্যটি আর পাওয়া যাচ্ছে না। পৃষ্ঠাটি রিফ্রেশ করে আবার চেষ্টা করুন।" }, { status: 400 });
    }

    const serviceRole = createServiceRoleClient();
    if (serviceRole) {
      const publicId = makePublicId();
      const { data, error } = await serviceRole
        .from("incidents")
        .insert({
          public_id: publicId,
          title,
          description,
          category_id: categoryId,
          division_id: divisionId,
          district_id: districtId,
          incident_date: incidentDate,
        })
        .select("public_id")
        .single();

      if (!error && data?.public_id) {
        return NextResponse.json({ publicId: data.public_id }, { status: 201 });
      }

      console.error("Anonymous incident server-side insert failed", {
        code: error?.code,
        message: error?.message,
      });

      // A timeout does not prove that the insert failed: the database may have
      // committed successfully before the response was lost. Verify the same
      // generated public_id before telling the user to submit again, avoiding
      // both duplicate submissions and unnecessary write retries.
      const { data: committed, error: verificationError } = await serviceRole
        .from("incidents")
        .select("public_id")
        .eq("public_id", publicId)
        .maybeSingle();

      if (!verificationError && committed?.public_id === publicId) {
        return NextResponse.json({ publicId: committed.public_id }, { status: 201 });
      }

      if (verificationError) {
        console.error("Anonymous incident insert verification failed", {
          code: verificationError.code,
          message: verificationError.message,
        });
      }

      // The existing anonymous RPC is not a safe fallback when the database
      // function itself is unavailable. Keep the API on the service-role path
      // when configured instead of making a second failing write call.
      return NextResponse.json({ message: "এই মুহূর্তে ঘটনা জমা দেওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।" }, { status: 503 });
    }

    // Preserve the existing RPC path only for environments where the server-role
    // credential is intentionally unavailable.
    const rpcResult = await read.rpc("create_anonymous_incident", {
      p_title: title,
      p_description: description,
      p_category_id: categoryId,
      p_division_id: divisionId,
      p_district_id: districtId,
      p_incident_date: incidentDate,
    });

    if (!rpcResult.error && rpcResult.data) {
      return NextResponse.json({ publicId: rpcResult.data }, { status: 201 });
    }

    console.error("Anonymous incident RPC failed", {
      code: rpcResult.error?.code,
      message: rpcResult.error?.message,
    });

    return NextResponse.json({ message: "এই মুহূর্তে ঘটনা জমা দেওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।" }, { status: 503 });
  } catch (error) {
    console.error("Anonymous incident submission route failed", error);
    return NextResponse.json({ message: "এই মুহূর্তে ঘটনা জমা দেওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।" }, { status: 500 });
  }
}
