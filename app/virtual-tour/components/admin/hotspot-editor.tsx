"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Hotspot, IVirtualTour } from "@/models/VirtualTour"
import { ArrowRight, Plus, Save, Trash2 } from "lucide-react"

interface HotspotEditorProps {
  tour: IVirtualTour
  allTours: IVirtualTour[]
  onSave: (tour: IVirtualTour) => void
}

export default function HotspotEditor({ tour, allTours, onSave }: HotspotEditorProps) {
  const [hotspots, setHotspots] = useState<Hotspot[]>(tour.hotspots)
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null)

  const selectedHotspot = selectedHotspotId ? hotspots.find((h) => h.id === selectedHotspotId) : null

  const handleAddHotspot = () => {
    const newHotspot: Hotspot = {
      id: `hotspot-${Date.now()}`,
      title: "New Hotspot",
      position: { x: 0, y: 0, z: -10 },
      linkedTourId: allTours[0]?.id || "",
      description: ""
    }

    const updatedHotspots = [...hotspots, newHotspot]
    setHotspots(updatedHotspots)
    setSelectedHotspotId(newHotspot.id)
  }

  const handleDeleteHotspot = (hotspotId: string) => {
    const updatedHotspots = hotspots.filter((h) => h.id !== hotspotId)
    setHotspots(updatedHotspots)
    setSelectedHotspotId(null)
  }

  const handleHotspotChange = (hotspotId: string, field: keyof Hotspot, value: any) => {
    const updatedHotspots = hotspots.map((h) => {
      if (h.id === hotspotId) {
        if (field === "position") {
          return {
            ...h,
            position: value,
          }
        }
        return {
          ...h,
          [field]: value,
        }
      }
      return h
    })

    setHotspots(updatedHotspots)
  }

  const handleSaveHotspots = () => {
    const updatedTour: IVirtualTour = {
      ...tour,
      hotspots,
    } as IVirtualTour
    onSave(updatedTour)
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Hotspots</CardTitle>
            <Button size="sm" onClick={handleAddHotspot}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {hotspots.length > 0 ? (
                hotspots.map((hotspot) => (
                  <button
                    key={hotspot.id}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-accent ${
                      selectedHotspotId === hotspot.id ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedHotspotId(hotspot.id)}
                  >
                    <span>{hotspot.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteHotspot(hotspot.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </button>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">No hotspots added yet</p>
              )}
            </div>

            <Button className="mt-4 w-full" onClick={handleSaveHotspots}>
              <Save className="mr-2 h-4 w-4" />
              Save All Hotspots
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{selectedHotspot ? `Edit Hotspot: ${selectedHotspot.title}` : "Hotspot Editor"}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedHotspot ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={selectedHotspot.title}
                    onChange={(e) => handleHotspotChange(selectedHotspot.id, "title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetTour">Target Tour</Label>
                  <Select
                    value={selectedHotspot.linkedTourId}
                    onValueChange={(value) => handleHotspotChange(selectedHotspot.id, "linkedTourId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tour" />
                    </SelectTrigger>
                    <SelectContent>
                      {allTours
                        .filter((t) => t.id !== tour.id)
                        .map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Position</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="position-x" className="text-xs">
                        X
                      </Label>
                      <Input
                        id="position-x"
                        type="number"
                        value={selectedHotspot.position.x}
                        onChange={(e) =>
                          handleHotspotChange(selectedHotspot.id, "position", {
                            ...selectedHotspot.position,
                            x: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="position-y" className="text-xs">
                        Y
                      </Label>
                      <Input
                        id="position-y"
                        type="number"
                        value={selectedHotspot.position.y}
                        onChange={(e) =>
                          handleHotspotChange(selectedHotspot.id, "position", {
                            ...selectedHotspot.position,
                            y: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="position-z" className="text-xs">
                        Z
                      </Label>
                      <Input
                        id="position-z"
                        type="number"
                        value={selectedHotspot.position.z}
                        onChange={(e) =>
                          handleHotspotChange(selectedHotspot.id, "position", {
                            ...selectedHotspot.position,
                            z: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tip: Use negative Z values to place hotspots in front of the camera
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-md border bg-muted p-3">
                  <div className="text-sm">
                    <p className="font-medium">Target Tour:</p>
                    <p className="text-muted-foreground">
                      {allTours.find((t) => t.id === selectedHotspot.linkedTourId)?.title || "None selected"}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center border border-dashed">
                <p className="text-muted-foreground">Select a hotspot from the list or create a new one</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

