import type { NextRequest } from "next/server"
import { asyncHandler, successResponse, errorResponse } from "@/lib/api-utils"
import { createGuide, updateUserRole, getUserById } from "@/lib/db-service"
import { getTokenFromRequest, verifyAccessToken } from "@/lib/jwt"

export const POST = asyncHandler(async (req: NextRequest) => {
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

  // Get the user to check their current role
  const user = await getUserById(userId)

  if (!user) {
    return errorResponse("User not found", "NOT_FOUND", 404)
  }

  // Check if user already has a role other than 'user'
  if (user.role !== "user" && user.role !== "guide") {
    return errorResponse(
      `You already have the role of ${user.role}. Please contact an administrator to change roles.`,
      "FORBIDDEN",
      403,
    )
  }

  const guideData = await req.json()

  // Create availability slots for the next 30 days
  const availability = []
  const now = new Date()

  for (let i = 1; i <= 30; i++) {
    const date = new Date(now)
    date.setDate(now.getDate() + i)

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue
    }

    availability.push({
      date,
      slots: [
        { startTime: "09:00", endTime: "11:00", isBooked: false },
        { startTime: "11:30", endTime: "13:30", isBooked: false },
        { startTime: "14:00", endTime: "16:00", isBooked: false },
      ],
    })
  }

  // Create the guide
  const guide = await createGuide({
    ...guideData,
    availability,
    rating: 0,
    reviews: [],
  })

  // Update user role
  await updateUserRole(userId, "guide", guide._id as string)

  return successResponse({
    message: "Guide registration successful",
    guide,
  })
})

