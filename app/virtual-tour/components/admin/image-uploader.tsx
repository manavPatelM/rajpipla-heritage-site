"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Check, AlertCircle, Image } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ImageUploaderProps {
  currentImage: string
  onImageUpload: (imageUrl: string) => void
}

// Sample 360° panorama images that are guaranteed to work
const SAMPLE_IMAGES = [
  {
    name: "Beach",
    url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=4000&q=80",
    thumbnail: "/placeholder.svg?height=100&width=200&text=Beach",
  },
  {
    name: "Mountain",
    url: "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?ixlib=rb-4.0.3&auto=format&fit=crop&w=4000&q=80",
    thumbnail: "/placeholder.svg?height=100&width=200&text=Mountain",
  },
  {
    name: "City",
    url: "https://images.unsplash.com/photo-1552353617-3bfd679b3bdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=4000&q=80",
    thumbnail: "/placeholder.svg?height=100&width=200&text=City",
  },
  {
    name: "Forest",
    url: "https://images.unsplash.com/photo-1518623001395-125242310d0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=4000&q=80",
    thumbnail: "/placeholder.svg?height=100&width=200&text=Forest",
  },
]

export default function ImageUploader({ currentImage, onImageUpload }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [activeTab, setActiveTab] = useState("upload")

  // This function handles the image upload
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setFileName(file.name)
    setUploadStatus("idle")
    setErrorMessage("")

    // Check file type and size
    const validTypes = ["image/jpeg", "image/jpg", "image/png"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      setIsUploading(false)
      setUploadStatus("error")
      setErrorMessage("Please upload a JPG or PNG image")
      return
    }

    if (file.size > maxSize) {
      setIsUploading(false)
      setUploadStatus("error")
      setErrorMessage("Image must be less than 10MB")
      return
    }

    // Create a FileReader to read the file as a data URL
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        // Use the data URL which will work without CORS issues
        const dataUrl = event.target.result as string
        onImageUpload(dataUrl)
        setIsUploading(false)
        setUploadStatus("success")
      }
    }

    reader.onerror = () => {
      setIsUploading(false)
      setUploadStatus("error")
      setErrorMessage("Failed to read the file")
    }

    // Read the file as a data URL
    reader.readAsDataURL(file)
  }

  // Function to handle direct URL input
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const input = document.getElementById("panorama-url") as HTMLInputElement
    const url = input.value.trim()

    if (!url) {
      setUploadStatus("error")
      setErrorMessage("Please enter a valid URL")
      return
    }

    // Check if the URL is from a stock photo site or other restricted domain
    const restrictedDomains = ["stock.adobe.com", "shutterstock.com", "gettyimages.com", "istockphoto.com"]
    const isRestricted = restrictedDomains.some((domain) => url.includes(domain))

    if (isRestricted) {
      setUploadStatus("error")
      setErrorMessage(
        "Stock photo sites don't allow direct loading. Please download the image first or use a sample image.",
      )
      return
    }

    setIsUploading(true)

    // Create a new image to test if the URL is valid and accessible
    const img = document.createElement("img") as HTMLImageElement
    img.crossOrigin = "anonymous"

    img.onload = () => {
      onImageUpload(url)
      setIsUploading(false)
      setUploadStatus("success")
      input.value = ""
    }

    img.onerror = () => {
      setIsUploading(false)
      setUploadStatus("error")
      setErrorMessage("Failed to load image. The URL might be invalid or blocked by CORS policy.")
    }

    img.src = url
  }

  // Function to select a sample image
  const handleSampleSelect = (url: string) => {
    onImageUpload(url)
    setUploadStatus("success")
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-md border">
        <img src={currentImage || "/placeholder.svg"} alt="Panorama preview" className="h-48 w-full object-cover" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="samples">Samples</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="hidden"
              id="image-upload"
              onChange={handleUpload}
            />
            <Button
              variant="outline"
              className="w-full"
              disabled={isUploading}
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload 360° Image"}
            </Button>
          </div>

          {fileName && (
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">File: {fileName}</span>
              {uploadStatus === "success" && <Check className="ml-2 h-4 w-4 text-green-500" />}
            </div>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-3">
          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <Input id="panorama-url" type="url" placeholder="https://example.com/panorama.jpg" disabled={isUploading} />
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Adding..." : "Add"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            Note: Some image URLs may not work due to CORS restrictions. Stock photo sites like Adobe Stock,
            Shutterstock, etc. don't allow direct loading.
          </p>
        </TabsContent>

        <TabsContent value="samples" className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {SAMPLE_IMAGES.map((image) => (
              <div
                key={image.name}
                className="cursor-pointer overflow-hidden rounded-md border hover:border-primary"
                onClick={() => handleSampleSelect(image.url)}
              >
                <div className="aspect-video relative">
                  <img
                    src={image.thumbnail || "/placeholder.svg"}
                    alt={image.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm">
                      <Image className="mr-2 h-4 w-4" />
                      Select
                    </Button>
                  </div>
                </div>
                <div className="p-2 text-center text-sm font-medium">{image.name}</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {uploadStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {uploadStatus === "success" && (
        <Alert variant="default" className="border-green-500 text-green-500">
          <Check className="h-4 w-4" />
          <AlertDescription>Image successfully added!</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md bg-muted p-3">
        <h4 className="mb-2 text-sm font-medium">Tips for 360° Images:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Use equirectangular panorama images (360° x 180°)</li>
          <li>• Recommended resolution: at least 4000 x 2000 pixels</li>
          <li>• Supported formats: JPG, PNG</li>
          <li>• Maximum file size: 10MB</li>
          <li>• Stock photo sites don't allow direct loading due to licensing restrictions</li>
        </ul>
      </div>
    </div>
  )
}

