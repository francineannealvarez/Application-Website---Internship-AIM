import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { response, reason } = await request.json();

    if (response !== "accepted" && response !== "declined") {
      return NextResponse.json(
        { error: "response must be 'accepted' or 'declined'" },
        { status: 400 }
      );
    }
    // DB check constraint requires capitalized values ('Accepted' /
    // 'Declined'), while the request body from the applicant UI still
    // sends lowercase - map between the two here.
    const dbResponse = response === "accepted" ? "Accepted" : "Declined";

    const application = await db.applications.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Make sure the logged-in applicant actually owns this application
    if (application.applicant_user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (response === "accepted") {
      const updated = await db.applications.update({
        where: { id },
        data: {
          job_offer_response: dbResponse,
        },
      });
      return NextResponse.json({ message: "Offer accepted", application: updated });
    }

    const updated = await db.applications.update({
      where: { id },
      data: {
        job_offer_response: dbResponse,
        status: "withdrawn",
        archive_note: reason || "Declined job offer",
      },
    });
    return NextResponse.json({ message: "Offer declined", application: updated });
  } catch (error) {
    console.error("Job offer response error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}