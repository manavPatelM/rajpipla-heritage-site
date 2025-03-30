"use client"

import { useState } from "react"
import { Html } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowRight, Info } from "lucide-react"
import type { Hotspot } from "@/models/VirtualTour"

interface HotspotsProps {
  hotspots: Hotspot[]
  onHotspotClick: (targetTourId: string) => void
  onInfoClick: () => void
}

export default function Hotspots({ hotspots, onHotspotClick, onInfoClick }: HotspotsProps) {
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null)

  return (
    <>
      {hotspots?.map((hotspot) => (
        <group key={hotspot.id as string} position={[hotspot.position.x, hotspot.position.y, hotspot.position.z]}>
          <Html
            transform
            distanceFactor={10}
            position={[0, 0, 0]}
            style={{
              transition: "all 0.2s",
              transform: `scale(${hoveredHotspot === hotspot.id ? 1.2 : 1})`,
            }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    onClick={() => onHotspotClick(hotspot.linkedTourId as string)}
                    onMouseEnter={() => setHoveredHotspot(hotspot.id)}
                    onMouseLeave={() => setHoveredHotspot(null)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{hotspot.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Html>
        </group>
      ))}

      {/* Info hotspot */}
      <group position={[10, -5, -20]}>
        <Html transform distanceFactor={10}>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={onInfoClick}
          >
            <Info className="h-4 w-4" />
          </Button>
        </Html>
      </group>
    </>
  )
}

