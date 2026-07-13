import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const jobPostings = await db.job_postings.findMany({
      where: { archived: false },
      orderBy: { deadline: "desc" },
    });

    const positions = jobPostings.map((job) => ({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      employmentType: job.employment_type,
      description: job.description,
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