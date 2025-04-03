"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"

interface TourFormProps {
  tour: any
  isNew: boolean
}

export default function TourForm({ tour, isNew }: TourFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: tour?.name || "",
    description: tour?.description || "",
    location: tour?.location || "",
    panoramaUrl: tour?.panoramaUrl || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUploaded = (url: string) => {
    setFormData((prev) => ({ ...prev, panoramaUrl: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const tourData = { ...formData }
      const url = isNew
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/virtual-tours`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/virtual-tours/${tour._id}`

      const response = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tourData),
      })

      console.log("Response:", response);
      

      if (!response.ok) {
        throw new Error("Failed to save tour")
      }

      toast({ title: "Success", description: "Tour saved successfully" })
      router.push("/admin")
      router.refresh()
    } catch (error) {
      console.error("Error saving tour:", error)
      setError("Failed to save tour. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Tour Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" value={formData.location} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} required />
      </div>

      <div className="space-y-2">
        <Label>Panorama Image</Label>
        <ImageUpload onImageUploaded={handleImageUploaded} defaultImage={formData.panoramaUrl} label="Upload Panorama Image" folder="tours" />
      </div>

      {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md">{error}</div>}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin")} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {isNew ? "Creating..." : "Updating..."}</> : isNew ? "Create Tour" : "Update Tour"}
        </Button>
      </div>
    </form>
  )
}