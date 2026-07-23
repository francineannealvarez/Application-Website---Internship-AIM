import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";

const DOCUMENTS_BUCKET = "applicant-requirements";

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
    const records = await db.applicant_requirements.findMany({
      where: { application_id: applicationId },
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error("Get requirements error:", error);
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
    const document = formData.get("document") as string;
    const groupNumberRaw = formData.get("group_number") as string;
    const file = formData.get("file") as File;

    if (!applicationId || !document) {
      return NextResponse.json(
        { error: "application_id and document are required" },
        { status: 400 }
      );
    }
    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const groupNumber = parseInt(groupNumberRaw, 10);
    const supabaseAdmin = createAdminClient();

    let saved;
    try {
      saved = await uploadToStorage(supabaseAdmin, file, `${applicationId}/${document}`);
    } catch (err) {
      console.error("Requirement upload error:", err);
      return NextResponse.json(
        { error: "Failed to upload document. Please try again." },
        { status: 500 }
      );
    }

    const record = await db.applicant_requirements.upsert({
      where: {
        application_id_document: {
          application_id: applicationId,
          document,
        },
      },
      update: {
        status: "Pending Review",
        file_path: saved.path,
        file_name: saved.name,
        file_size_label: saved.sizeLabel,
        date_submitted: new Date(),
        updated_at: new Date(),
      },
      create: {
        application_id: applicationId,
        document,
        group_number: Number.isNaN(groupNumber) ? 1 : groupNumber,
        status: "Pending Review",
        file_path: saved.path,
        file_name: saved.name,
        file_size_label: saved.sizeLabel,
        date_submitted: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Requirement submitted", record },
      { status: 200 }
    );
  } catch (error) {
    console.error("Save requirement error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}