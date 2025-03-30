


import type { NextRequest } from "next/server"
import { asyncHandler, successResponse, errorResponse } from "@/lib/api-utils"
import dbConnect from "@/lib/mongoose"
import UserModel from "@/models/User"
import { getUserFromToken } from "@/lib/jwt"

export const GET = asyncHandler(async (req: NextRequest) => {
  try {
    await dbConnect()

    const payload = await getUserFromToken(req)

    if (!payload) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
    }

    const user = await UserModel.findById(payload.userId)

    if (!user) {
      return errorResponse("User not found", "NOT_FOUND", 404)
    }

    return successResponse({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        imageUrl: user.imageUrl,
        guideId: user.guideId,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return errorResponse("An error occurred while fetching user data", "INTERNAL_SERVER_ERROR", 500)
  }
})