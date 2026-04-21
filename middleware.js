import { NextResponse } from "next/server";

export function middleware(request) {
  const authToken = request.cookies.get("authToken")?.value || "";
  const pathname = request.nextUrl.pathname;

  // Allow public API routes
  if (
    pathname === "/api/login" ||
    pathname === "/api/signup" ||
    pathname === "/api/post" ||
    pathname === "/api/search" ||
    /^\/api\/post\/[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Redirect root to home
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Prevent logged-in users from visiting login/signup
  if (pathname === "/login" || pathname === "/signup") {
    if (authToken) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  // Protect private routes
  const protectedRoutes =
    pathname.startsWith("/home") ||
    pathname.startsWith("/myblog");

  if (protectedRoutes && !authToken) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  // Protect private API routes
  if (pathname.startsWith("/api") && !authToken) {
    return NextResponse.json(
      { error: "You are not authorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/home/:path*",
    "/myblog/:path*",
    "/api/:path*",
  ],
};