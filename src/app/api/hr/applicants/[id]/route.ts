import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
 
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "HR_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
 
    // Next.js 15+ makes `params` a Promise — must await it before use
    const { id } = await params;
 
    const application = await db.application.findUnique({
      where: { id },
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
 
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
 
    return NextResponse.json(application);
  } catch (error) {
    console.error("Get applicant error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
 
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "HR_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
 
    // Next.js 15+ makes `params` a Promise — must await it before use
    const { id } = await params;
 
    const { status, rejectionReason } = await request.json();
 
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }
 
    const application = await db.application.update({
      where: { id },
      data: {
        status,
        rejectionReason: rejectionReason || null,
      },
    });
 
    // Create notification for applicant
    const statusMessages: Record<string, string> = {
      SUBMITTED: "Your application has been received.",
      UNDER_REVIEW: "Your application is being reviewed by our HR team.",
      SHORTLISTED: "Congratulations! You have been shortlisted.",
      REQUIREMENTS: "Please upload your required documents.",
      HIRED: "Congratulations! You have been hired!",
      REJECTED: "Thank you for applying. We will keep your profile on file.",
    };
 
    await db.notification.create({
      data: {
        userId: application.userId,
        applicationId: application.id,
        message: `Your application status has been updated to ${status}. ${statusMessages[status] || ""}`,
      },
    });
 
    return NextResponse.json(application);
  } catch (error) {
    console.error("Update applicant error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
 