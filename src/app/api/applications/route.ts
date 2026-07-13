import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";

async function saveUpload(file: File, prefix: string) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${timestamp}-${prefix}${safeName}`;
  const diskPath = path.join(uploadDir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(diskPath, buffer);

  return `/uploads/${fileName}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fullName = (formData.get("fullName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const positionId = formData.get("positionId") as string;
    const phoneNumber = (formData.get("phoneNumber") as string) || null;
    const resumeFile = formData.get("resume") as File;

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

    // Ensure a matching profile exists
    const existingProfile = await db.profiles.findUnique({
      where: { id: userId },
    });
    if (!existingProfile) {
      await db.profiles.create({
        data: {
          id: userId,
          full_name: fullName,
          role: "applicant",
        },
      });
    }

    // Save the resume file to disk (note: no resume_url column exists yet on
    // applications — see note below)
    await saveUpload(resumeFile, "");

    const application = await db.applications.create({
      data: {
        applicant_user_id: userId,
        job_id: positionId,
        full_name: fullName,
        email: email,
        phone: phoneNumber,
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