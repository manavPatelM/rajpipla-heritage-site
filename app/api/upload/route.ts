import type { NextRequest } from "next/server"
import { asyncHandler, successResponse, errorResponse } from "@/lib/api-utils"
import { uploadImage } from "@/lib/cloudinary"

export const POST = asyncHandler(async (req: NextRequest) => {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "rajpipla"

    if (!file) {
      return errorResponse("No file provided", "BAD_REQUEST", 400)
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return errorResponse("Invalid file type. Only JPEG, PNG, and WebP images are allowed.", "BAD_REQUEST", 400)
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return errorResponse("File size exceeds 5MB limit", "BAD_REQUEST", 400)
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary
    const imageUrl = await uploadImage(buffer, folder)

    return successResponse({ url: imageUrl })
  } catch (error: any) {
    console.error("Error uploading file:", error)
    return errorResponse("Failed to upload file", "UPLOAD_ERROR", 500)
  }
})

// Increase payload size limit for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
}

