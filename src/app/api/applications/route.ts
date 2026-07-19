import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";

// Resume and cover letter both live in the same bucket (applicant-resume),
// namespaced by a subfolder per document type. There's no per-user folder
// restriction on the bucket's RLS policies (they only check bucket_id), so
// this naming convention is purely for our own organization.
const RESUME_BUCKET = "applicant-resume";

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
    .from(RESUME_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return { path: storagePath, name: file.name, sizeLabel: formatFileSize(file.size) };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fullName = (formData.get("fullName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const positionId = formData.get("positionId") as string;
    const phoneNumber = (formData.get("phoneNumber") as string) || null;
    const resumeFile = formData.get("resume") as File;
    const coverLetterFile = formData.get("coverLetter") as File | null;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full name and email are required" },
        { status: 400 }
      );
    }

    if (!positionId || !resumeFile || resumeFile.size === 0) {
      return NextResponse.json(
        { error: "Position and resume are required" },
        { status: 400 }
      );
    }

    const position = await db.job_postings.findUnique({
      where: { id: positionId },
    });
    if (!position || position.archived) {
      return NextResponse.json(
        { error: "Selected position is not available" },
        { status: 400 }
      );
    }

    // Check if a user with this email already exists in Supabase Auth
    let userId: string;
    const existingUser = await db.users.findFirst({
      where: { email },
    });

    const supabaseAdmin = createAdminClient();

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create a new Supabase Auth account for this applicant
      const randomPassword = crypto.randomUUID();
      const { data: created, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password: randomPassword,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });

      if (createError || !created?.user) {
        console.error("Supabase createUser error:", createError);
        return NextResponse.json(
          { error: "Could not create applicant account" },
          { status: 500 }
        );
      }
      userId = created.user.id;
    }

    // Find or create the matching row in `applicants` — this is a separate
    // table from `users` (Supabase Auth) and is what `applications.applicant_id`
    // (a required FK) points to. One applicant can have multiple applications
    // over time, so we look it up by applicant_user_id first.
    let applicantRecord = await db.applicants.findFirst({
      where: { applicant_user_id: userId },
    });

    if (!applicantRecord) {
      applicantRecord = await db.applicants.create({
        data: {
          applicant_user_id: userId,
          full_name: fullName,
          email: email,
          phone: phoneNumber,
        },
      });
    }

    // Upload resume (required) to Supabase Storage, namespaced under this
    // applicant's own id so every resume/cover letter they ever submit
    // (across multiple applications) lives under the same folder.
    let resumeUpload;
    try {
      resumeUpload = await uploadToStorage(
        supabaseAdmin,
        resumeFile,
        `${applicantRecord.id}/resume`
      );
    } catch (err) {
      console.error("Resume upload error:", err);
      return NextResponse.json(
        { error: "Failed to upload resume. Please try again." },
        { status: 500 }
      );
    }

    // Cover letter is optional.
    let coverLetterUpload: Awaited<ReturnType<typeof uploadToStorage>> | null = null;
    if (coverLetterFile && coverLetterFile.size > 0) {
      try {
        coverLetterUpload = await uploadToStorage(
          supabaseAdmin,
          coverLetterFile,
          `${applicantRecord.id}/cover-letter`
        );
      } catch (err) {
        console.error("Cover letter upload error:", err);
        return NextResponse.json(
          { error: "Failed to upload cover letter. Please try again." },
          { status: 500 }
        );
      }
    }

    const application = await db.applications.create({
      data: {
        applicant_user_id: userId,
        applicant_id: applicantRecord.id,
        job_id: positionId,
        full_name: fullName,
        email: email,
        phone: phoneNumber,
        resume_file_path: resumeUpload.path,
        resume_file_name: resumeUpload.name,
        resume_file_size_label: resumeUpload.sizeLabel,
        cover_letter_file_path: coverLetterUpload?.path ?? null,
        cover_letter_file_name: coverLetterUpload?.name ?? null,
        cover_letter_file_size_label: coverLetterUpload?.sizeLabel ?? null,
      },
    });

    return NextResponse.json(
      { message: "Application submitted successfully", application },
      { status: 201 }
    );
  } catch (error) {
    console.error("Application submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const application = await db.applications.findFirst({
      where: { email: email.toLowerCase() },
      orderBy: { date_applied: "desc" },
      include: {
        job_postings: {
          select: { title: true, department: true, employment_type: true },
        },
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}