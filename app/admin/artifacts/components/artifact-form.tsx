"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Artifact } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/image-upload"
import { Trash2 } from "lucide-react"
import api from "@/lib/axios"

// Options for dropdowns
const eraOptions = [
  { value: "ancient", label: "Ancient (Pre-1700s)" },
  { value: "colonial", label: "Colonial Era (1700s-1947)" },
  { value: "modern", label: "Modern (Post-1947)" },
]

const typeOptions = [
  { value: "painting", label: "Painting" },
  { value: "sculpture", label: "Sculpture" },
  { value: "jewelry", label: "Jewelry" },
  { value: "furniture", label: "Furniture" },
  { value: "weapon", label: "Weapon" },
  { value: "textile", label: "Textile" },
  { value: "manuscript", label: "Manuscript" },
]

const significanceOptions = [
  { value: "royal", label: "Royal Heritage" },
  { value: "cultural", label: "Cultural Significance" },
  { value: "historical", label: "Historical Events" },
  { value: "religious", label: "Religious Importance" },
]

export default function ArtifactForm({ artifact }: { artifact?: Artifact }) {
  const router = useRouter()
  const isEditing = !!artifact

  const [formData, setFormData] = useState<Partial<Artifact>>(
    artifact || {
      name: "",
      description: "",
      era: "",
      type: "",
      significance: "",
      imageUrl: "",
      highResImageUrl: "",
      pdfGuideUrl: "",
      storyPoints: [{ title: "", description: "" }],
    },
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStoryPointChange = (index: number, field: "title" | "description", value: string) => {
    const updatedStoryPoints = [...(formData.storyPoints || [])]
    updatedStoryPoints[index] = {
      ...updatedStoryPoints[index],
      [field]: value,
    }

    setFormData((prev) => ({ ...prev, storyPoints: updatedStoryPoints }))
  }

  const handleImageUploaded = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }))
  }

  const handleHighResImageUploaded = (url: string) => {
    setFormData((prev) => ({ ...prev, highResImageUrl: url }))
  }

  const handlePdfUploaded = (url: string) => {
    setFormData((prev) => ({ ...prev, pdfGuideUrl: url }))
  }

  const addStoryPoint = () => {
    setFormData((prev) => ({
      ...prev,
      storyPoints: [...(prev.storyPoints || []), { title: "", description: "" }],
    }))
  }

  const removeStoryPoint = (index: number) => {
    const updatedStoryPoints = [...(formData.storyPoints || [])]
    updatedStoryPoints.splice(index, 1)

    setFormData((prev) => ({ ...prev, storyPoints: updatedStoryPoints }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = isEditing ? "/api/admin/artifacts" : "/api/admin/artifacts"
      const body = isEditing ? { id: artifact._id, ...formData } : formData
      const response = isEditing ? await api.put(url, body) : await api.post(url, body)


      const data = response.data
      console.log("data is ", data);
      

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to save artifact")
      }

      toast({
        title: isEditing ? "Artifact Updated" : "Artifact Created",
        description: isEditing
          ? "The artifact has been successfully updated."
          : "The artifact has been successfully created.",
      })

      router.push("/admin/artifacts")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="era">Era</Label>
            <Select value={formData.era} onValueChange={(value) => handleSelectChange("era", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select era" />
              </SelectTrigger>
              <SelectContent>
                {eraOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="significance">Significance</Label>
            <Select
              value={formData.significance}
              onValueChange={(value) => handleSelectChange("significance", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select significance" />
              </SelectTrigger>
              <SelectContent>
                {significanceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>

          <ImageUpload
            onImageUploaded={handleImageUploaded}
            defaultImage={formData.imageUrl}
            label="Artifact Image"
            folder="artifacts"
          />

          <ImageUpload
            onImageUploaded={handleHighResImageUploaded}
            defaultImage={formData.highResImageUrl}
            label="High-Resolution Image"
            folder="artifacts/high-res"
          />

          <div className="space-y-2">
            <Label htmlFor="pdfGuideUrl">PDF Guide URL (Optional)</Label>
            <Input id="pdfGuideUrl" name="pdfGuideUrl" value={formData.pdfGuideUrl} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Story Points</h3>
          <Button type="button" variant="outline" onClick={addStoryPoint}>
            Add Story Point
          </Button>
        </div>

        {formData.storyPoints?.map((point, index) => (
          <div key={index} className="border rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Story Point {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeStoryPoint(index)}
                disabled={formData.storyPoints?.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`storyPoint-${index}-title`}>Title</Label>
              <Input
                id={`storyPoint-${index}-title`}
                value={point.title}
                onChange={(e) => handleStoryPointChange(index, "title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`storyPoint-${index}-description`}>Description</Label>
              <Textarea
                id={`storyPoint-${index}-description`}
                value={point.description}
                onChange={(e) => handleStoryPointChange(index, "description", e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/artifacts")} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
              ? "Update Artifact"
              : "Create Artifact"}
        </Button>
      </div>
    </form>
  )
}

