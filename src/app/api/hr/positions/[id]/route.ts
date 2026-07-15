import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

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
    const body = await request.json();
    const { title, department, employmentType, description, isActive } = body;

    const job = await db.job_postings.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(department && { department }),
        ...(employmentType && { employment_type: employmentType }),
        ...(description && { description }),
        // isActive (UI concept) is the inverse of archived (DB concept)
        ...(isActive !== undefined && { archived: !isActive }),
      },
    });

    const position = {
      id: job.id,
      title: job.title,
      department: job.department ?? "",
      employmentType: job.employment_type ?? "",
      description: job.description,
      isActive: !job.archived,
    };

    return NextResponse.json(position);
  } catch (error) {
    console.error("Update position error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Archive instead of hard-deleting
    const job = await db.job_postings.update({
      where: { id },
      data: { archived: true },
    });

    const position = {
      id: job.id,
      title: job.title,
      department: job.department ?? "",
      employmentType: job.employment_type ?? "",
      description: job.description,
      isActive: !job.archived,
    };

    return NextResponse.json(position);
  } catch (error) {
    console.error("Delete position error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}