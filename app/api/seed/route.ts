import type { NextRequest } from "next/server"
import { asyncHandler, successResponse, errorResponse } from "@/lib/api-utils"
import { seedSampleData } from "@/lib/db-service"

export const GET = asyncHandler(async (req: NextRequest) => {
  // Only allow in development environment
  if (process.env.NODE_ENV !== "development") {
    return errorResponse("This endpoint is only available in development mode", "FORBIDDEN", 403)
  }

  try {
    await seedSampleData()
    return successResponse({ message: "Database seeded successfully" })
  } catch (error: any) {
    return errorResponse(`Error seeding database: ${error.message}`, "INTERNAL_SERVER_ERROR", 500)
  }
})

