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
 
    const position = await db.position.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(department && { department }),
        ...(employmentType && { employmentType }),
        ...(description && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });
 
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
 
    // Set to inactive instead of deleting
    const position = await db.position.update({
      where: { id },
      data: { isActive: false },
    });
 
    return NextResponse.json(position);
  } catch (error) {
    console.error("Delete position error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}