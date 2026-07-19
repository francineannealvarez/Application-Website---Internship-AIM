import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { saveUpload } from "@/lib/uploads";

export async function GET(request: NextRequest) {
  try {
    const applicationId = request.nextUrl.searchParams.get("application_id");
    if (!applicationId) {
      return NextResponse.json(
        { error: "application_id is required" },
        { status: 400 }
      );
    }

    const record = await db.applicant_background_check.findUnique({
      where: { application_id: applicationId },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Get background check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const applicationId = formData.get("application_id") as string;
    const dateSigned = formData.get("date_signed") as string;
    const signatureFile = formData.get("signature") as File;

    if (!applicationId) {
      return NextResponse.json(
        { error: "application_id is required" },
        { status: 400 }
      );
    }

    if (!dateSigned || !signatureFile || signatureFile.size === 0) {
      return NextResponse.json(
        { error: "Date signed and signature are required" },
        { status: 400 }
      );
    }

    const saved = await saveUpload(signatureFile, "bgcheck-signature-");

    const record = await db.applicant_background_check.upsert({
      where: { application_id: applicationId },
      update: {
        status: "Submitted",
        signature_file_path: saved.path,
        signature_file_name: saved.name,
        date_signed: new Date(dateSigned),
        submitted_at: new Date(),
        updated_at: new Date(),
      },
      create: {
        application_id: applicationId,
        status: "Submitted",
        signature_file_path: saved.path,
        signature_file_name: saved.name,
        date_signed: new Date(dateSigned),
        submitted_at: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Background check authorization submitted", record },
      { status: 200 }
    );
  } catch (error) {
    console.error("Save background check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}