import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";

const DOCUMENTS_BUCKET = "applicant-sra";

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

    const supabaseAdmin = createAdminClient();

    let saved;
    try {
      saved = await uploadToStorage(supabaseAdmin, file, `${applicationId}/sra`);
    } catch (err) {
      console.error("SRA upload error:", err);
      return NextResponse.json(
        { error: "Failed to upload SRA answer sheet. Please try again." },
        { status: 500 }
      );
    }

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