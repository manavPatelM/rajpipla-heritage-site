import type { NextRequest } from "next/server"
import { asyncHandler, successResponse, errorResponse } from "@/lib/api-utils"
import { adminMiddleware } from "../middleware"
import { getDb } from "@/lib/db-service"

export const GET = asyncHandler(async (req: NextRequest) => {
  const adminError = await adminMiddleware(req)
  if (adminError) return adminError

  const db = await getDb()
  const users = await db.collection("users").find({}).toArray()

  return successResponse(users)
})

export const POST = asyncHandler(async (req: NextRequest) => {
  const adminError = await adminMiddleware(req)
  if (adminError) return adminError

  const { firstName, lastName, email, password, role = "admin" } = await req.json()

  if (!firstName || !lastName || !email || !password) {
    return errorResponse("Missing required fields", "BAD_REQUEST", 400)
  }

  // In a real application, you would use Clerk's API to create a user
  // For this example, we'll simulate creating an admin user

  const db = await getDb()

  // Check if email already exists
  const existingUser = await db.collection("users").findOne({ email })

  if (existingUser) {
    return errorResponse("Email already in use", "CONFLICT", 409)
  }

  const now = new Date()

  // Create user
  const result = await db.collection("users").insertOne({
    id: `user_${Date.now()}`, // Simulate Clerk ID
    firstName,
    lastName,
    email,
    role,
    imageUrl: "",
    createdAt: now,
    updatedAt: now,
  })

  return successResponse({
    message: "Admin user created successfully",
    userId: result.insertedId,
  })
})

