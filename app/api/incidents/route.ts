import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type SubmissionBody = { title?: unknown; description?: unknown; incidentDate?: unknown; categoryId?: unknown; divisionId?: unknown; districtId?: unknown };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function url() { const v = process.env.NEXT_PUBLIC_SUPABASE_URL; if (!v) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing."); return v; }
function reader() { const k = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; if (!k) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing."); return createClient<Database>(url(), k, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } }); }
function writer() { const k = process.env.SUPABASE_SERVICE_ROLE_KEY; if (!k) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing."); return createClient<Database>(url(), k, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } }); }
function today() { const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()); const v = Object.fromEntries(p.map((x) => [x.type, x.value])); return `${v.year}-${v.month}-${v.day}`; }
function validDate(v: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false; const d = new Date(`${v}T00:00:00.000Z`); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v; }
function makePublicId() { return `RK-${randomBytes(6).toString("hex").toUpperCase()}`; }
function mapError(e: { code?: string; message?: string } | null) { const c = e?.code ?? "", m = e?.message?.toLowerCase() ?? ""; if (c === "23503") return m.includes("category") ? "The selected incident category is no longer available. Please refresh and try again." : m.includes("district") ? "The selected district is no longer available. Please refresh and try again." : "The selected incident reference is no longer available. Please refresh and try again."; if (c === "22023") return m.includes("future") ? "The incident date cannot be in the future." : "The incident data is invalid. Please review the form and try again."; if (c === "42501") return "The server is not permitted to submit incidents. Please check the server configuration."; return null; }

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmissionBody;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const incidentDate = typeof body.incidentDate === "string" ? body.incidentDate : "";
    const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
    const divisionId = Number(body.divisionId), districtId = Number(body.districtId);
    if (title.length < 5 || title.length > 200 || description.length < 20 || description.length > 10000 || !categoryId || !Number.isInteger(divisionId) || !Number.isInteger(districtId)) return NextResponse.json({ message: "Please complete all required incident fields." }, { status: 400 });
    if (!validDate(incidentDate)) return NextResponse.json({ message: "Please enter a valid incident date." }, { status: 400 });
    if (incidentDate > today()) return NextResponse.json({ message: "The incident date cannot be in the future." }, { status: 400 });

    const read = reader();
    const [category, division, district] = await Promise.all([
      read.from("public_categories").select("id").eq("id", categoryId).maybeSingle(),
      read.from("public_divisions").select("id").eq("id", divisionId).maybeSingle(),
      read.from("public_districts").select("id,division_id").eq("id", districtId).eq("division_id", divisionId).maybeSingle(),
    ]);
    if (category.error || division.error || district.error) { console.error("Incident reference lookup failed", { category: category.error, division: division.error, district: district.error }); return NextResponse.json({ message: "Incident reference data is temporarily unavailable. Please refresh and try again." }, { status: 503 }); }
    if (!category.data || !division.data || !district.data) return NextResponse.json({ message: "The selected incident reference is no longer available. Please refresh and try again." }, { status: 400 });

    // Frozen DB compatibility: production's existing RPC fails because its
    // trigger resolves public.gen_random_bytes(6), which is unavailable.
    // Do not modify the database. Generate the same reference server-side,
    // provide public_id explicitly, and let the existing INSERT validation
    // and initial-revision triggers run unchanged.
    const db = writer();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const id = makePublicId();
      const { data, error } = await db.from("incidents").insert({ public_id: id, category_id: categoryId, division_id: divisionId, district_id: districtId, title, description, incident_date: incidentDate }).select("public_id").single();
      if (!error && data?.public_id) return NextResponse.json({ publicId: data.public_id }, { status: 201 });
      if (error?.code !== "23505" || attempt === 2) { console.error("Anonymous incident insert failed", { code: error?.code, message: error?.message, details: error?.details, hint: error?.hint }); return NextResponse.json({ message: mapError(error) ?? "Unable to submit the incident right now. Please try again." }, { status: 500 }); }
    }
    return NextResponse.json({ message: "Unable to submit the incident right now. Please try again." }, { status: 500 });
  } catch (error) { console.error("Anonymous incident submission route failed", error); return NextResponse.json({ message: "Unable to submit the incident right now. Please try again." }, { status: 500 }); }
}
