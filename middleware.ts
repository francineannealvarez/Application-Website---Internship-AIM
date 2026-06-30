import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // For demo/mock mode: allow all protected routes to pass through
  // In production, uncomment the auth() call below and set up NextAuth properly
  
  // const session = await auth();
  // if (!session) {
  //   if (
  //     request.nextUrl.pathname.startsWith("/applicant") ||
  //     request.nextUrl.pathname.startsWith("/hr") ||
  //     request.nextUrl.pathname.startsWith("/apply") ||
  //     request.nextUrl.pathname.startsWith("/dashboard")
  //   ) {
  //     return NextResponse.redirect(new URL("/login", request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/applicant/:path*",
    "/hr/:path*",
    "/apply/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
