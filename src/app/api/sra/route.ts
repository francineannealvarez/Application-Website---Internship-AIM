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

    const record = await db.applicant_sra.findUnique({
      where: { application_id: applicationId },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Get SRA error:", error);
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
    const file = formData.get("file") as File;

    if (!applicationId) {
      return NextResponse.json(
        { error: "application_id is required" },
        { status: 400 }
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const saved = await saveUpload(file, "sra-");

    const record = await db.applicant_sra.upsert({
      where: { application_id: applicationId },
      update: {
        status: "Submitted",
        file_path: saved.path,
        file_name: saved.name,
        file_size_label: saved.sizeLabel,
        date_submitted: new Date(),
        updated_at: new Date(),
      },
      create: {
        application_id: applicationId,
        status: "Submitted",
        file_path: saved.path,
        file_name: saved.name,
        file_size_label: saved.sizeLabel,
        date_submitted: new Date(),
      },
    });

    return NextResponse.json(
      { message: "SRA answer sheet submitted", record },
      { status: 200 }
    );
  } catch (error) {
    console.error("Save SRA error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}