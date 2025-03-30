import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { asyncHandler, successResponse } from "@/lib/api-utils"
import { getGuides } from "@/lib/db-service"

export const GET = asyncHandler(async (req: NextRequest) => {
  const url = new URL(req.url)
  const page = Number.parseInt(url.searchParams.get("page") || "1")
  const limit = Number.parseInt(url.searchParams.get("limit") || "10")
  const expertise = url.searchParams.get("expertise") || undefined
  const language = url.searchParams.get("language") || undefined
  const search = url.searchParams.get("search") || undefined
  
  const { guides, pagination } = await getGuides({ expertise, language, search }, page, limit)

  return successResponse(guides, pagination)
})