import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { isUserAdmin, getUserById } from "@/lib/db-service"
import { errorResponse } from "@/lib/api-utils"
import { getTokenFromRequest, verifyAccessToken } from "@/lib/jwt"

export async function adminMiddleware(req: NextRequest) {

  const token = await getTokenFromRequest(req)
  // Verify token
  const payload = await verifyAccessToken(token || "")
  if (!payload || typeof payload.userId !== "string") {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
  }
  const { userId } = payload
  

  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
  }

  const isAdmin = await isUserAdmin(userId)
  if (!isAdmin) {
    return errorResponse("Forbidden: Admin access required", "FORBIDDEN", 403)
  }

  return null
}

export async function guideMiddleware(req: NextRequest) {
  const token = await getTokenFromRequest(req)
  // Verify token
  const payload = await verifyAccessToken(token || "")
  if (!payload || typeof payload.userId !== "string") {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
  }
  const { userId } = payload

  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
  }

  const user = await getUserById(userId)
  if (!user) {
    return errorResponse("User not found", "NOT_FOUND", 404)
  }

  const isAdmin = user.role === "admin"
  const isGuide = user.role === "guide"

  if (!isAdmin && !isGuide) {
    return errorResponse("Forbidden: Guide access required", "FORBIDDEN", 403)
  }

  return null
}


// Middleware for checking if user has any of the specified roles
export async function roleMiddleware(req: NextRequest, allowedRoles: string[]) {
  const token = await getTokenFromRequest(req)
  // Verify token
  const payload = await verifyAccessToken(token || "")
  if (!payload || typeof payload.userId !== "string") {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
  }
  const { userId } = payload

  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
  }

  const user = await getUserById(userId)
  if (!user) {
    return errorResponse("User not found", "NOT_FOUND", 404)
  }

  if (!allowedRoles.includes(user.role)) {
    return errorResponse(`Forbidden: Required role not found`, "FORBIDDEN", 403)
  }

  return null
}

