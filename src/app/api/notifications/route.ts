import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await db.notifications.findMany({
      where: { user_id: session.user.id },
      orderBy: { created_at: "desc" },
    });

    // Map snake_case DB fields to the camelCase shape the frontend expects
    const mapped = notifications.map((n) => ({
      id: n.id,
      message: n.message,
      isRead: n.is_read,
      createdAt: n.created_at,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mark all as read
    await db.notifications.updateMany({
      where: { user_id: session.user.id },
      data: { is_read: true },
    });

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark notifications as read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}