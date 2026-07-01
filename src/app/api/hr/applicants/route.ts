import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "HR_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const positionId = searchParams.get("positionId");
    const search = searchParams.get("search");

    type ApplicationFindManyArgs = NonNullable<Parameters<typeof db.application.findMany>[0]>;
    type ApplicationWhereInput = NonNullable<ApplicationFindManyArgs["where"]>;

    const where: ApplicationWhereInput = {};

    if (status) {
      where.status = status as ApplicationWhereInput["status"];
    }

    if (positionId) {
      where.positionId = positionId;
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const applications = await db.application.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        position: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Get applicants error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
