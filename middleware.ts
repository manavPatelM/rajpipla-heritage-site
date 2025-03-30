import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAccessToken, getTokenFromRequest, getRefreshTokenFromRequest } from "./lib/jwt"

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/artifacts",
  "/virtual-tour",
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/upload",
  "/api/artifacts",
  "/api/guides",
]

// Define routes that require specific roles
const adminRoutes = ["/admin", "/api/admin"]
const guideRoutes = ["/dashboard/guide", "/api/guide"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = await getTokenFromRequest(req)

  if (!token) {
    // If accessing API, return 401
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 },
      )
    }

    // Redirect to login page for non-API routes
    // const url = new URL("/login", req.url)
    // url.searchParams.set("redirect", pathname)
    // return NextResponse.redirect(url)
  }

  // Verify token
  const payload = await verifyAccessToken(token || "")

  if (!payload) {
    // Try to get refresh token
    const refreshToken = getRefreshTokenFromRequest(req)

    if (refreshToken) {
      // If accessing API, return 401 with TOKEN_EXPIRED code
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { success: false, error: { message: "Token expired", code: "TOKEN_EXPIRED" } },
          { status: 401 },
        )
      }

      // For non-API routes, let the client handle the refresh
      return NextResponse.next()
    }

    // If no refresh token, redirect to login
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid token", code: "INVALID_TOKEN" } },
        { status: 401 },
      )
    }

    // const url = new URL("/login", req.url)
    // url.searchParams.set("redirect", pathname)
    // return NextResponse.redirect(url)
  }

  // Check role-based access
  if (
    payload &&
    (
      (adminRoutes.some((route) => pathname.startsWith(route)) && payload.role !== "admin") ||
      (guideRoutes.some((route) => pathname.startsWith(route)) && payload.role !== "guide")
    )
  ) {
    // If accessing API, return 403
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ success: false, error: { message: "Forbidden", code: "FORBIDDEN" } }, { status: 403 })
    }

    // Redirect to dashboard for non-API routes
    // return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
}