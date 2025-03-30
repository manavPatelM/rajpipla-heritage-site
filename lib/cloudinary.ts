import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file: Buffer, folder = "rajpipla"): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadOptions: { folder: string; resource_type: "image" } = {
      folder,
      resource_type: "image",
    }

    // Convert buffer to base64
    const base64Data = `data:image/jpeg;base64,${file.toString("base64")}`

    cloudinary.uploader.upload(base64Data, uploadOptions, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result!.secure_url)
      }
    })
  })
}

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === "ok"
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error)
    return false
  }
}

// Extract public ID from Cloudinary URL
export function getPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes("cloudinary.com")) {
    return null
  }

  const parts = url.split("/")
  const filename = parts[parts.length - 1]
  const publicId = filename.split(".")[0]
  const folder = parts[parts.length - 2]

  return `${folder}/${publicId}`
}