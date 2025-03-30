"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import type { IVirtualTour } from "../../../../models/VirtualTour"
import { cn } from "@/lib/utils"

interface ToursListProps {
  tours: IVirtualTour[]
  selectedTourId: string | null
  onSelectTour: (tourId: string) => void
  onAddTour: (tour: IVirtualTour) => void
}

export default function ToursList({ tours, selectedTourId, onSelectTour, onAddTour }: ToursListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTours = Object.values(tours).filter(
    (tour : IVirtualTour) =>
      tour.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.location?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddTour = () => {
    const newId = `tour-${Date.now()}`
    const newTour: Partial<IVirtualTour> = {
      id: newId,
      name: "New Tour",
      title: "New Tour Title",
      description: "Add a description for this tour",
      location: "Add a location",
      panoramaUrl: "/placeholder.svg?height=1000&width=2000",
      hotspots: [],
    }
    onAddTour(newTour as IVirtualTour)
    onSelectTour(newId)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Tours</CardTitle>
        <Button size="sm" onClick={handleAddTour}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tours..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          {filteredTours.length > 0 ? (
            filteredTours.map((tour) => (
              <button
                key={tour.id}
                className={cn(
                  "flex w-full flex-col items-start rounded-md px-3 py-2 text-left hover:bg-accent",
                  selectedTourId === tour.id && "bg-accent",
                )}
                onClick={() => onSelectTour(tour.id)}
              >
                <span className="font-medium">{tour.title}</span>
                <span className="text-xs text-muted-foreground">{tour.location}</span>
              </button>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No tours found</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

