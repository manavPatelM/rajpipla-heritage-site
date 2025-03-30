"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, MapPin, Save, Trash2, Loader2 } from "lucide-react"
import api from "@/lib/axios"
import type { IVirtualTour } from "@/models/VirtualTour"

interface TourEditorProps {
  tour: IVirtualTour
  onSave: (tour: IVirtualTour) => void
  onDelete: (tourId: string) => void
  onEditHotspots: () => void
}

export default function TourEditor({ tour, onSave, onDelete, onEditHotspots }: TourEditorProps) {
  const [formData, setFormData] = useState<IVirtualTour>(tour)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value } as IVirtualTour))
  }

  const handleImageUploaded = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url } as unknown as IVirtualTour))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) return alert("Please enter a tour title")
    if (!formData.imageUrl) return alert("Please upload a 360° image for the tour")

    setIsSaving(true)

    try {
      const response = await api.put(`/api/virtual-tours/${tour.id}`, formData)
      onSave(response.data)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating tour:", error)
      alert("Failed to save changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>{isEditing ? "Edit Tour" : tour.title}</CardTitle>
        <div className="flex gap-2">
          {isEditing ? (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin mr-1 h-4 w-4" /> : <Save className="mr-1 h-4 w-4" />}
              Save
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the tour and all associated hotspots. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(tour.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label>Panorama Image</Label>
              <ImageUpload defaultImage={formData.imageUrl} onImageUploaded={handleImageUploaded} />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-4 w-4" />
              {tour.location}
            </div>

            <p className="text-sm">{tour.description}</p>

            <div className="overflow-hidden rounded-md border">
              <img src={tour.imageUrl || "/placeholder.svg"} alt={tour.title} className="h-48 w-full object-cover" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Hotspots: </span>
                <span>{tour.hotspots.length}</span>
              </div>
              {tour.details &&
                Object.entries(tour.details).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium">{key}: </span>
                    <span>{String(value)}</span>
                  </div>
                ))}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onEditHotspots}>
          Manage Hotspots ({tour.hotspots.length})
        </Button>
      </CardFooter>
    </Card>
  )
}