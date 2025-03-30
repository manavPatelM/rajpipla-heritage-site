import type { NextRequest } from "next/server"
import { asyncHandler, errorResponse, successResponse } from "@/lib/api-utils"
import { createVirtualTour, deleteVirtualTour, getVirtualTours, updateVirtualTour } from "@/lib/db-service"
import dbConnect from "@/lib/mongoose"
import { ObjectId } from "mongodb"
import VirtualTourModel from "@/models/VirtualTour"

export const GET = asyncHandler(async (req: NextRequest) => {
  const tours = await getVirtualTours()
  return successResponse(tours)
})

// export interface IVirtualTour extends Document {
//   name: string
//   description: string
//   location: string
//   panoramaUrl: string
//   hotspots: Hotspot[]
//   createdAt: Date
//   updatedAt: Date
// }

export const POST = asyncHandler(async (req: NextRequest) => {
  // Create a new virtual tour

  const response = await req.json()
  const { name, description, location, panoramaUrl, hotspots } = response
  try {
    const newTour = await createVirtualTour({ name, description, location, panoramaUrl, hotspots })
    console.log("New virtual tour created:", newTour) 
    return successResponse(newTour)
  } catch (error) {
    console.error("Create virtual tour error:", error)
    return errorResponse("An error occurred while creating the virtual tour", "INTERNAL_SERVER_ERROR", 500)
  }
})

export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  // Delete a virtual tour by ID
  const { id } = params

  try {
    const deletedTour = await deleteVirtualTour(id)
    return successResponse(deletedTour)
  } catch (error) {
    console.error("Delete virtual tour error:", error)
    return errorResponse("An error occurred while deleting the virtual tour", "INTERNAL_SERVER_ERROR", 500)
  }
}
)

