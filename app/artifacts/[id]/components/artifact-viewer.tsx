"use client"

import { useState } from "react"
import type { Artifact } from "@/lib/models"
import { ZoomIn, ZoomOut, RotateCw, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export default function ArtifactViewer({ artifact }: { artifact: Artifact }) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5))
  }

  const rotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const rotateCounterClockwise = () => {
    setRotation((prev) => (prev - 90 + 360) % 360)
  }

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <div className="relative h-[500px] flex items-center justify-center bg-black/5 overflow-hidden">
        <img
          src={artifact.imageUrl || "/placeholder.svg"}
          alt={artifact.name}
          className="transition-all duration-200 ease-in-out"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            maxHeight: "100%",
            maxWidth: "100%",
          }}
        />
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={rotateCounterClockwise}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={rotateClockwise}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Zoom</span>
            <span className="text-sm">{Math.round(scale * 100)}%</span>
          </div>
          <Slider
            value={[scale * 100]}
            min={50}
            max={300}
            step={10}
            onValueChange={(value) => setScale(value[0] / 100)}
          />
        </div>
      </div>
    </div>
  )
}

