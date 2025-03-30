import type { NextRequest } from "next/server"
import { asyncHandler, successResponse, errorResponse } from "@/lib/api-utils"
import { getArtifacts, getArtifactById, createArtifact } from "@/lib/db-service"
import { Schema } from "mongoose"

export const GET = asyncHandler(async (req: NextRequest) => {
  const url = new URL(req.url)
  const id = url.searchParams.get("id")

  if (id) {
    const artifact = await getArtifactById(id)
    if (!artifact) {
      return errorResponse("Artifact not found", "NOT_FOUND", 404)
    }
    return successResponse(artifact)
  }

  const page = Number.parseInt(url.searchParams.get("page") || "1")
  const limit = Number.parseInt(url.searchParams.get("limit") || "10")
  const era = url.searchParams.get("era") || undefined
  const type = url.searchParams.get("type") || undefined
  const significance = url.searchParams.get("significance") || undefined
  const search = url.searchParams.get("search") || undefined

  const { artifacts, pagination } = await getArtifacts({ era, type, significance, search }, page, limit)

  return successResponse(artifacts, pagination)
})


// export const POST = asyncHandler(async (req: NextRequest) => {
//   // Create a new artifact
//   // make a new artifact on the database on the post request
  
  
// })

export const POST = asyncHandler(async (req: NextRequest) => {
  const { title, description, era, type, significance, imageUrl } = await req.json();

  if (!title || !description || !era || !type || !significance || !imageUrl) {
    return errorResponse("Missing required fields", "BAD_REQUEST", 400);
  }
  // export interface IArtifact extends Document {
  //   name: string
  //   description: string
  //   era: string
  //   type: string
  //   significance: string
  //   imageUrl: string
  //   highResImageUrl: string
  //   pdfGuideUrl?: string
  //   storyPoints: StoryPoint[]
  //   createdAt: Date
  //   updatedAt: Date
  // }
   
  const artifact = await createArtifact({ name: title, description, era, type, significance, imageUrl });


  return successResponse(artifact);
})