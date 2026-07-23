import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";

const DOCUMENTS_BUCKET = "applicant-requirements";

export async function GET(request: NextRequest) {
  try {
    const applicationId = request.nextUrl.searchParams.get("application_id");
    const document = request.nextUrl.searchParams.get("document");
    const email = request.nextUrl.searchParams.get("email");

    if (!applicationId || !document || !email) {
      return NextResponse.json(
        { error: "application_id, document, and email are required" },
        { status: 400 }
      );
    }

    const application = await db.applications.findUnique({
      where: { id: applicationId },
    });

    // Same ownership check used by the resume/cover-letter document route:
    // only the applicant whose email matches this application can request
    // a signed link to their own file.
    if (!application || application.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const record = await db.applicant_requirements.findUnique({
      where: {
        application_id_document: {
          application_id: applicationId,
          document,
        },
      },
    });

    if (!record?.file_path) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 404 });
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(record.file_path, 60); // link is valid for 60 seconds

    if (error || !data?.signedUrl) {
      console.error("Signed URL error:", error);
      return NextResponse.json(
        { error: "Could not generate file link" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (error) {
    console.error("Requirement document fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}