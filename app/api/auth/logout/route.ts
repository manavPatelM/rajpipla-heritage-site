import type { NextRequest } from "next/server"
import { asyncHandler, successResponse } from "@/lib/api-utils"
// import { clearTokenCookies } from "@/lib/jwt"

export const POST = asyncHandler(async (req: NextRequest) => {
  try {
    let response = successResponse({ message: "Logged out successfully" })

    // Clear cookies
    // response = clearTokenCookies(response)

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return successResponse({ message: "Logged out successfully" })
  }
})