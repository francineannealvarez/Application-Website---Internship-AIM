import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const applicationId = request.nextUrl.searchParams.get("application_id");
    if (!applicationId) {
      return NextResponse.json(
        { error: "application_id is required" },
        { status: 400 }
      );
    }

    const assessment = await db.applicant_assessment.findUnique({
      where: { application_id: applicationId },
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Get assessment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { application_id, q1, q2, q3, q4, q5 } = body;

    if (!application_id) {
      return NextResponse.json(
        { error: "application_id is required" },
        { status: 400 }
      );
    }

    const data = {
      q1: q1 ?? null,
      q2: q2 ?? null,
      q3: q3 ?? null,
      q4: q4 ?? null,
      q5: q5 ?? null,
      submitted_at: new Date(),
      updated_at: new Date(),
    };

    const assessment = await db.applicant_assessment.upsert({
      where: { application_id },
      update: data,
      create: { application_id, ...data },
    });

    return NextResponse.json(
      { message: "Assessment saved successfully", assessment },
      { status: 200 }
    );
  } catch (error) {
    console.error("Save assessment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}