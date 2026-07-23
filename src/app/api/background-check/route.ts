import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";

const DOCUMENTS_BUCKET = "applicant-background-check";

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function uploadToStorage(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  file: File,
  folder: string
): Promise<{ path: string; name: string; sizeLabel: string }> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${folder}/${timestamp}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return { path: storagePath, name: file.name, sizeLabel: formatFileSize(file.size) };
}

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

    const supabaseAdmin = createAdminClient();

    let saved;
    try {
      saved = await uploadToStorage(supabaseAdmin, signatureFile, `${applicationId}/signature`);
    } catch (err) {
      console.error("Background check signature upload error:", err);
      return NextResponse.json(
        { error: "Failed to upload signature. Please try again." },
        { status: 500 }
      );
    }

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