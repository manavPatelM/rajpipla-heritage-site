import type { NextRequest } from "next/server"
import { asyncHandler, successResponse, errorResponse } from "@/lib/api-utils"
import { createArtifact, updateArtifact, deleteArtifact } from "@/lib/db-service"
import { adminMiddleware } from "../middleware"
import type { IArtifact } from "@/models/Artifact"

export const POST = asyncHandler(async (req: NextRequest) => {
  const adminError = await adminMiddleware(req)
  if (adminError) return adminError

  const artifact  = await req.json()
  console.log("artifact is venbvs lebn",artifact)
  const newArtifact = await createArtifact(artifact)
  return successResponse(newArtifact)
})

export const PUT = asyncHandler(async (req: NextRequest) => {
  const adminError = await adminMiddleware(req)
  if (adminError) return adminError

  const { id, ...updates } = await req.json()

  if (!id) {
    return errorResponse("Missing artifact ID", "BAD_REQUEST", 400)
  }

  const updatedArtifact = await updateArtifact(id, updates)

  if (!updatedArtifact) {
    return errorResponse("Artifact not found", "NOT_FOUND", 404)
  }

  return successResponse(updatedArtifact)
})

export const DELETE = asyncHandler(async (req: NextRequest) => {
  const adminError = await adminMiddleware(req)
  if (adminError) return adminError

  const url = new URL(req.url)
  const id = url.searchParams.get("id")

  if (!id) {
    return errorResponse("Missing artifact ID", "BAD_REQUEST", 400)
  }

  await deleteArtifact(id)
  return successResponse({ deleted: true })
})

