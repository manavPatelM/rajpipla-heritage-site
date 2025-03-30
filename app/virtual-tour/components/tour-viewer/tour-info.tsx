"use client"

import type { IVirtualTour } from "@/models/VirtualTour"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TourInfoProps {
  tour: IVirtualTour
  onClose: () => void
}

export default function TourInfo({ tour, onClose }: TourInfoProps) {
  return (
    <div className="absolute bottom-16 left-4 z-10 w-80 md:w-96">
      <Card className="bg-background/90 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>{tour.title}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>{tour.location}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{tour.description}</p>

          {tour.details && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {Object.entries(tour.details).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium text-muted-foreground">{key}: </span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

