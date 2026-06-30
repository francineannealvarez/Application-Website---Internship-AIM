import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
 
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "HR_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
 
    // Next.js 15+ makes `params` a Promise — must await it before use
    const { id } = await params;
 
    const body = await request.json();
    const { name, description, isActive } = body;
 
    const requirement = await db.requirement.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });
 
    return NextResponse.json(requirement);
  } catch (error) {
    console.error("Update requirement error:", error);
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
    if (!session?.user?.id || (session.user as any).role !== "HR_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
 
    // Next.js 15+ makes `params` a Promise — must await it before use
    const { id } = await params;
 
    // Set to inactive instead of deleting
    const requirement = await db.requirement.update({
      where: { id },
      data: { isActive: false },
    });
 
    return NextResponse.json(requirement);
  } catch (error) {
    console.error("Delete requirement error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}