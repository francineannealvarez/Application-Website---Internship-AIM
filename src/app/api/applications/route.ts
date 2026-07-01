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
    const positionId = formData.get("positionId") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const homeAddress = formData.get("homeAddress") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const gender = formData.get("gender") as string;
    const heardAboutUs = formData.get("heardAboutUs") as string;
    const preferredStartDate = formData.get("preferredStartDate") as string;
    const message = formData.get("message") as string;
    const resumeFile = formData.get("resume") as File;
    const coverLetterFile = formData.get("coverLetter") as File | null;
    const portfolioUrl = formData.get("portfolioUrl") as string;

    if (!positionId || !resumeFile) {
      return NextResponse.json(
        { error: "Position and resume are required" },
        { status: 400 }
      );
    }

    // Check if user already has an application
    const existingApplication = await db.application.findUnique({
      where: { userId: session.user.id },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You already have an active application" },
        { status: 400 }
      );
    }

    // Save files to public/uploads
    const uploadDir = "public/uploads";
    const timestamp = Date.now();

    // Save resume
    const resumeBuffer = await resumeFile.arrayBuffer();
    const resumePath = `/uploads/${timestamp}-${resumeFile.name}`;

    // For now, we'll store the file path. In production, use cloud storage
    // const fs = require("fs").promises;
    // await fs.writeFile(uploadDir + resumePath, Buffer.from(resumeBuffer));

    // Save cover letter if provided
    let coverLetterPath = null;
    if (coverLetterFile) {
      const coverLetterBuffer = await coverLetterFile.arrayBuffer();
      coverLetterPath = `/uploads/${timestamp}-cl-${coverLetterFile.name}`;
      // await fs.writeFile(uploadDir + coverLetterPath, Buffer.from(coverLetterBuffer));
    }

    // Create application
    const application = await db.application.create({
      data: {
        userId: session.user.id,
        positionId,
        resumePath,
        coverLetterPath,
        portfolioUrl: portfolioUrl || null,
        phoneNumber,
        homeAddress,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        heardAboutUs,
        preferredStartDate: preferredStartDate ? new Date(preferredStartDate) : null,
        message,
      },
    });

    // Create notification for HR
    // TODO: Create notification for all HR admins

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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await db.application.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
        position: true,
        documents: {
          include: {
            requirement: true,
          },
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
