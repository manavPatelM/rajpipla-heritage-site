import type { NextRequest } from "next/server"
import { asyncHandler, successResponse, errorResponse } from "@/lib/api-utils"
import { getArtifactById } from "@/lib/db-service"

export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const artifact = await getArtifactById(params.id)

  if (!artifact) {
    return errorResponse("Artifact not found", "NOT_FOUND", 404)
  }

  return successResponse(artifact)
})

