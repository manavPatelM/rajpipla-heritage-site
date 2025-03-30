"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import PanoramaSphere from "./panorama-sphere"
import Hotspots from "./hotspots"
import TourInfo from "./tour-info"
import LoadingScreen from "./loading-screen"
import api from "@/lib/axios"

export default function TourViewer() {
  const [loading, setLoading] = useState(true)
  const [tours, setTours] = useState<any[]>([])
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null)
  const [selectedTour, setSelectedTour] = useState<any>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [panoramaError, setPanoramaError] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await api.get(`/api/virtual-tours/`)
        setTours(response.data)
        if (response.data.length > 0) {
          setSelectedTourId(response.data[0].id)
        }
      } catch (error) {
        console.error("Error fetching tours:", error)
      }
    }
    fetchTours()
  }, [])

  useEffect(() => {
    if (!selectedTourId) return
    const tour = tours.find(t => t.id === selectedTourId)
    setSelectedTour(tour)
  }, [selectedTourId, tours])

  useEffect(() => {
    setLoading(true)
    setPanoramaError(false)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [selectedTourId])

  const handleHotspotClick = (targetTourId: string) => {
    setSelectedTourId(targetTourId)
  }

  const handlePanoramaError = () => {
    setPanoramaError(true)
  }

  const handleRetry = () => {
    setPanoramaError(false)
    setLoading(true)
    setKey(prev => prev + 1)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  if (tours.length === 0) return <p>Loading tours...</p>

  return (
    <div className="relative h-full w-full">
      {loading && <LoadingScreen />}

      {panoramaError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
          <div className="text-center p-6 max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Failed to load panorama</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading the 360° image. This may be due to CORS restrictions or an invalid image URL.
            </p>
            <Button onClick={handleRetry}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 z-10">
        {tours?.map(tour => (
          <Button key={tour.id} variant="outline" className="m-1" onClick={() => setSelectedTourId(tour.id)}>
            {tour.name}
          </Button>
        ))}
      </div>

      {selectedTour && (
        <Canvas key={key} camera={{ fov: 75, position: [0, 0, 0.1] }}>
          <PanoramaSphere imageUrl={selectedTour.imageUrl} />
          <Hotspots
            hotspots={selectedTour.hotspots}
            onHotspotClick={handleHotspotClick}
            onInfoClick={() => setShowInfo(true)}
          />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={-0.5}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      )}

      <div className="absolute bottom-4 left-4 z-10">
        <Button
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
          onClick={() => setShowInfo(!showInfo)}
        >
          {showInfo ? "Hide Info" : "Tour Info"}
        </Button>
      </div>

      {showInfo && <TourInfo tour={selectedTour} onClose={() => setShowInfo(false)} />}
    </div>
  )
}
