import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const jobPostings = await db.job_postings.findMany({
      where: { archived: false, status: "Open" },
      orderBy: { date_posted: "desc" },
    });

    const positions = jobPostings.map((job) => ({
      id: job.id,
      title: job.title,
      department: job.department ?? "",
      location: job.location ?? "",
      employmentType: job.employment_type ?? "",
      description: job.description,
      // responsibilities/qualifications are stored as newline-separated text in the DB
      responsibilities: job.responsibilities
        ? job.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean)
        : [],
      qualifications: job.qualifications
        ? job.qualifications.split("\n").map((s) => s.trim()).filter(Boolean)
        : [],
      postedDate: job.date_posted ? job.date_posted.toISOString() : null,
      deadline: job.deadline ? job.deadline.toISOString().slice(0, 10) : null,
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