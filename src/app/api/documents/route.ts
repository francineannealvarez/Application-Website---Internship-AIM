import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const requirementId = formData.get("requirementId") as string;
    const file = formData.get("file") as File;

    if (!requirementId || !file) {
      return NextResponse.json(
        { error: "Requirement ID and file are required" },
        { status: 400 }
      );
    }

    // Get user's application
    const application = await db.application.findUnique({
      where: { userId: session.user.id },
    });

    if (!application) {
      return NextResponse.json(
        { error: "No active application found" },
        { status: 400 }
      );
    }

    // Check if application status is shortlisted or requirements
    if (
      application.status !== "SHORTLISTED" &&
      application.status !== "REQUIREMENTS"
    ) {
      return NextResponse.json(
        { error: "You are not eligible to upload documents yet" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const filePath = `/uploads/${timestamp}-${file.name}`;

    // Create or update document record
    const document = await db.applicantDocument.upsert({
      where: {
        applicationId_requirementId: {
          applicationId: application.id,
          requirementId,
        },
      },
      update: {
        filePath,
      },
      create: {
        applicationId: application.id,
        requirementId,
        filePath,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Document uploaded successfully", document },
      { status: 201 }
    );
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
