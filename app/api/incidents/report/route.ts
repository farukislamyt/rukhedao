import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

type ReportBody = {
  publicId?: unknown;
  reason?: unknown;
  description?: unknown;
};

const MAX_BODY_BYTES = 8_192;
const reasons = [
  "false_or_misleading",
  "privacy_concern",
  "harmful_content",
  "duplicate",
  "wrong_location",
  "wrong_date",
  "other",
] as const;

type ReportReason = (typeof reasons)[number];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reader() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`report:${ip}`, 10, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "অনেকবার জানানোর চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
        { status: 429 }
      );
    }

    const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
    if (contentType !== "application/json") {
      return NextResponse.json({ message: "অনুরোধের ধরন সঠিক নয়।" }, { status: 415 });
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && Number.isFinite(Number(contentLength)) && Number(contentLength) > MAX_BODY_BYTES) {
      return NextResponse.json({ message: "জমা দেওয়া প্রতিক্রিয়ার আকার অনেক বড়।" }, { status: 413 });
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ message: "জমা দেওয়া প্রতিক্রিয়ার আকার অনেক বড়।" }, { status: 413 });
    }

    let body: ReportBody;
    try {
      body = JSON.parse(rawBody) as ReportBody;
    } catch {
      return NextResponse.json({ message: "অনুরোধের তথ্য সঠিক নয়।" }, { status: 400 });
    }

    const publicId = typeof body.publicId === "string" ? body.publicId.trim() : "";
    const reason = typeof body.reason === "string" ? body.reason : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";

    if (!publicId || publicId.length > 100 || !reasons.includes(reason as ReportReason)) {
      return NextResponse.json({ message: "সঠিক কারণ বেছে নিন।" }, { status: 400 });
    }

    if (description && (description.length < 5 || description.length > 2000)) {
      return NextResponse.json({ message: "সঠিক বিবরণ লিখুন।" }, { status: 400 });
    }

    const serviceRole = createServiceRoleClient();
    if (serviceRole) {
      const { data, error } = await serviceRole.rpc("submit_incident_report", {
        p_incident_public_id: publicId,
        p_reason: reason as ReportReason,
        p_description: description || undefined,
      });

      if (!error && data) {
        return NextResponse.json({ reportId: data }, { status: 201 });
      }

      console.error("Public incident report service-role RPC failed", {
        code: error?.code,
        message: error?.message,
      });
    }

    const anonymousClient = reader();
    if (!anonymousClient) {
      return NextResponse.json({ message: "এই মুহূর্তে প্রতিক্রিয়া জমা দেওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।" }, { status: 503 });
    }

    const { data, error } = await anonymousClient.rpc("submit_incident_report", {
      p_incident_public_id: publicId,
      p_reason: reason as ReportReason,
      p_description: description || undefined,
    });

    if (error || !data) {
      console.error("Public incident report RPC failed", {
        code: error?.code,
        message: error?.message,
      });
      return NextResponse.json({ message: "এই মুহূর্তে প্রতিক্রিয়া জমা দেওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।" }, { status: 503 });
    }

    return NextResponse.json({ reportId: data }, { status: 201 });
  } catch (error) {
    console.error("Public incident report route failed", error);
    return NextResponse.json({ message: "এই মুহূর্তে প্রতিক্রিয়া জমা দেওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।" }, { status: 500 });
  }
}
