import type { NextRequest } from "next/server"
import { asyncHandler, successResponse, errorResponse } from "@/lib/api-utils"
import { getVirtualTourById, updateVirtualTour } from "@/lib/db-service"
import dbConnect from "@/lib/mongoose"
import { ObjectId } from "mongodb"
import VirtualTourModel from "@/models/VirtualTour"

export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const tour = await getVirtualTourById(params.id)

  if (!tour) {
    return errorResponse("Virtual tour not found", "NOT_FOUND", 404)
  }

  return successResponse(tour)
})

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const { id } = await params

    if (!id) {
      return new Response(JSON.stringify({ error: "Tour ID is required" }), { status: 400 })
    }

    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Invalid Tour ID" }), { status: 400 })
    }

    const body = await req.json()
    const { name, description, location, panoramaUrl, hotspots } = body

    const updatedTour = await VirtualTourModel.findByIdAndUpdate(
      new ObjectId(id),
      { name, description, location, panoramaUrl, hotspots },
      { new: true }
    )

    if (!updatedTour) {
      return new Response(JSON.stringify({ error: "Tour not found" }), { status: 404 })
    }

    return new Response(JSON.stringify(updatedTour), { status: 200 })
  } catch (error) {
    console.error("Update virtual tour error:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 })
  }
}