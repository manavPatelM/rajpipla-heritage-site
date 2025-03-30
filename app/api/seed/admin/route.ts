import type { NextRequest } from "next/server"
import { asyncHandler, successResponse, errorResponse } from "@/lib/api-utils"
import { getDb } from "@/lib/db-service"

export const GET = asyncHandler(async (req: NextRequest) => {
  // Only allow in development environment
  if (process.env.NODE_ENV !== "development") {
    return errorResponse("This endpoint is only available in development mode", "FORBIDDEN", 403)
  }

  const db = await getDb()

  // Check if admin user already exists
  const adminExists = await db.collection("users").findOne({ role: "admin" })

  if (adminExists) {
    return successResponse({
      message: "Admin user already exists",
      admin: adminExists,
    })
  }

  const now = new Date()

  // Create admin user
  const adminUser = {
    id: `admin_${Date.now()}`, // Simulate Clerk ID
    firstName: "Admin",
    lastName: "User",
    email: "admin@rajpipla.com",
    role: "admin",
    imageUrl: "",
    createdAt: now,
    updatedAt: now,
  }

  await db.collection("users").insertOne(adminUser)

  return successResponse({
    message: "Admin user created successfully",
    admin: adminUser,
  })
})

