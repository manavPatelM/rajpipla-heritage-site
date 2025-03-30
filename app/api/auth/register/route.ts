import { type NextRequest, NextResponse } from "next/server"
import { asyncHandler, errorResponse } from "@/lib/api-utils"
import dbConnect from "@/lib/mongoose"
import UserModel from "@/models/User"
import { signAccessToken, signRefreshToken, setTokenCookies } from "@/lib/jwt"

export const POST = asyncHandler(async (req: NextRequest) => {
  try {
    await dbConnect()

    const { firstName, lastName, email, password, role = "user", imageUrl = "" } = await req.json()

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return errorResponse("Please provide all required fields", "BAD_REQUEST", 400)
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email })

    if (existingUser) {
      return errorResponse("Email already in use", "CONFLICT", 409)
    }

    // Create user
    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password,
      role,
      imageUrl,
    })

    // Generate JWT tokens
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    const refreshToken = signRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    // Create response
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          imageUrl: user.imageUrl,
        },
        accessToken,
        refreshToken,
      },
    })

    // Set cookies
    setTokenCookies(response, await accessToken, await refreshToken)

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return errorResponse("An error occurred during registration", "INTERNAL_SERVER_ERROR", 500)
  }
})