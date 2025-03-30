import type { NextRequest } from "next/server"
import { asyncHandler, successResponse, errorResponse } from "@/lib/api-utils"
import { adminMiddleware } from "../../middleware"
import { getDb, updateUserRole } from "@/lib/db-service"

export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const adminError = await adminMiddleware(req)
  if (adminError) return adminError

  const db = await getDb()
  const user = await db.collection("users").findOne({ id: params.id })

  if (!user) {
    return errorResponse("User not found", "NOT_FOUND", 404)
  }

  return successResponse(user)
})

export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const adminError = await adminMiddleware(req)
  if (adminError) return adminError

  const { firstName, lastName, email, password, role } = await req.json()

  if (!firstName || !lastName || !email) {
    return errorResponse("Missing required fields", "BAD_REQUEST", 400)
  }

  const db = await getDb()

  // Check if user exists
  const user = await db.collection("users").findOne({ id: params.id })

  if (!user) {
    return errorResponse("User not found", "NOT_FOUND", 404)
  }

  // Update user
  const updates: any = {
    firstName,
    lastName,
    email,
    updatedAt: new Date(),
  }

  // Only update password if provided
  if (password) {
    // In a real application, you would hash the password
    updates.password = password
  }

  // Update role if changed
  if (role && role !== user.role) {
    await updateUserRole(params.id, role)
  }

  await db.collection("users").updateOne({ id: params.id }, { $set: updates })

  return successResponse({
    message: "User updated successfully",
  })
})

export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const adminError = await adminMiddleware(req)
  if (adminError) return adminError

  const db = await getDb()

  // Check if user exists
  const user = await db.collection("users").findOne({ id: params.id })

  if (!user) {
    return errorResponse("User not found", "NOT_FOUND", 404)
  }

  // Don't allow deleting the last admin
  if (user.role === "admin") {
    const adminCount = await db.collection("users").countDocuments({ role: "admin" })

    if (adminCount <= 1) {
      return errorResponse("Cannot delete the last admin user", "FORBIDDEN", 403)
    }
  }

  await db.collection("users").deleteOne({ id: params.id })

  return successResponse({
    message: "User deleted successfully",
  })
})

