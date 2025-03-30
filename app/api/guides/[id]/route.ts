import type { NextRequest } from "next/server"
import { asyncHandler, successResponse, errorResponse } from "@/lib/api-utils"
import { getGuideById } from "@/lib/db-service"

export const GET = asyncHandler(async (req: NextRequest) => {
  const id = req.nextUrl.pathname.split("/").pop()
  if (!id) {
    return errorResponse("Guide ID not provided", "BAD_REQUEST", 400)
  }
  const guide = await getGuideById(id)
  if (!guide) {
    return errorResponse("Guide not found", "NOT_FOUND", 404)
  }

  return successResponse(guide)
})

