import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "HR_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobPostings = await db.job_postings.findMany({
      orderBy: { created_at: "desc" },
    });

    const positions = jobPostings.map((job) => ({
      id: job.id,
      title: job.title,
      department: job.department ?? "",
      employmentType: job.employment_type ?? "",
      description: job.description,
      isActive: !job.archived,
    }));

    return NextResponse.json(positions);
  } catch (error) {
    console.error("Get positions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "HR_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, department, employmentType, description } =
      await request.json();

    if (!title || !department || !employmentType || !description) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const job = await db.job_postings.create({
      data: {
        title,
        department,
        employment_type: employmentType,
        description,
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

    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    console.error("Create position error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}