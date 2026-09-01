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
            !/^\d{4}-\d{2}-\d{2}$/.test(incidentDate) ||
            !Number.isInteger(divisionId) || !Number.isInteger(districtId) ||
            !categoryId
        ) {
            return NextResponse.json({ message: "Invalid incident submission." }, { status: 400 });
        }

        const supabase = getAdminClient();

        const [{ data: category, error: categoryError }, { data: division, error: divisionError }, { data: district, error: districtError }] = await Promise.all([
            supabase.from("categories").select("id").eq("id", categoryId).eq("is_active", true).maybeSingle(),
            supabase.from("divisions").select("id").eq("id", divisionId).eq("is_active", true).maybeSingle(),
            supabase.from("districts").select("id").eq("id", districtId).eq("division_id", divisionId).eq("is_active", true).maybeSingle(),
        ]);

        if (categoryError || divisionError || districtError) {
            console.error("Incident reference lookup failed", { categoryError, divisionError, districtError });
            return NextResponse.json({ message: "Unable to validate incident reference data." }, { status: 500 });
        }

        if (!category || !division || !district) {
            return NextResponse.json({ message: "Invalid incident reference data." }, { status: 400 });
        }

        const { data: incident, error: insertError } = await supabase
            .from("incidents")
            .insert({
                public_id: makePublicId(),
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
            console.error("Anonymous incident insert failed", insertError);
            return NextResponse.json({ message: "Unable to submit incident." }, { status: 500 });
        }

        return NextResponse.json({ publicId: incident.public_id }, { status: 201 });
    } catch (error) {
        console.error("Anonymous incident submission route failed", error);
        return NextResponse.json({ message: "Unable to submit incident." }, { status: 500 });
    }
}
