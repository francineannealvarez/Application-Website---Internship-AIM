import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";

const RESUME_BUCKET = "applicant-resume";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const email = request.nextUrl.searchParams.get("email");
    const type = request.nextUrl.searchParams.get("type"); // "resume" | "cover-letter"

    if (!email || !type) {
      return NextResponse.json(
        { error: "Email and type are required" },
        { status: 400 }
      );
    }

    if (type !== "resume" && type !== "cover-letter") {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }

    const application = await db.applications.findUnique({ where: { id } });

    // Consistency check with the rest of the app: only the applicant whose
    // email matches this application can request a signed link to it.
    if (!application || application.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const filePath =
      type === "resume" ? application.resume_file_path : application.cover_letter_file_path;

    if (!filePath) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 404 });
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(filePath, 60); // link is valid for 60 seconds

    if (error || !data?.signedUrl) {
      console.error("Signed URL error:", error);
      return NextResponse.json(
        { error: "Could not generate file link" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (error) {
    console.error("Document fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}