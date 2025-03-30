import { type NextRequest, NextResponse } from "next/server"
import { asyncHandler, errorResponse } from "@/lib/api-utils"
import dbConnect from "@/lib/mongoose"
import UserModel from "@/models/User"
import { signAccessToken, signRefreshToken, setTokenCookies } from "@/lib/jwt"

export const POST = asyncHandler(async (req: NextRequest) => {
  try {
    await dbConnect()

    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      return errorResponse("Please provide email and password", "BAD_REQUEST", 400)
    }

    // Find user
    const user = await UserModel.findOne({ email }).select("+password")

    if (!user) {
      return errorResponse("Invalid credentials", "UNAUTHORIZED", 401)
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return errorResponse("Invalid credentials", "UNAUTHORIZED", 401)
    }

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
          guideId: user.guideId,
        },
        accessToken,
        refreshToken,
      },
    })

    // Set cookies
    setTokenCookies(response, await accessToken, await refreshToken)

    return response
  } catch (error) {
    console.error("Login error:", error)
    return errorResponse("An error occurred during login", "INTERNAL_SERVER_ERROR", 500)
  }
})