"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash, Loader2 } from "lucide-react"
import * as THREE from "three"
import type { Hotspot } from "@/models/VirtualTour"

interface HotspotManagerProps {
  tour: {
    _id: string
    name: string
    panoramaUrl: string
    hotspots: Hotspot[]
  }
  availableTours: Array<{
    _id: string
    name: string
  }>
}

export default function HotspotManager({ tour, availableTours }: HotspotManagerProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [hotspots, setHotspots] = useState<Hotspot[]>(tour.hotspots || [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentHotspot, setCurrentHotspot] = useState<Hotspot | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddingHotspot, setIsAddingHotspot] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Three.js variables
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sphereRef = useRef<THREE.Mesh | null>(null)
  const hotspotMeshesRef = useRef<THREE.Mesh[]>([])
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    // Set up scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(0, 0, 0)
    cameraRef.current = camera

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create sphere geometry for panorama
    const geometry = new THREE.SphereGeometry(500, 60, 40)
    geometry.scale(-1, 1, 1) // Invert the sphere so the image is on the inside

    // Load panorama texture
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = "anonymous"

    loader.load(
      tour.panoramaUrl,
      (texture) => {
        const material = new THREE.MeshBasicMaterial({ map: texture })
        const sphere = new THREE.Mesh(geometry, material)
        scene.add(sphere)
        sphereRef.current = sphere

        // Add existing hotspots
        addHotspotsToScene()
      },
      undefined,
      (error) => {
        console.error("Error loading panorama:", error)
      },
    )

    // Set up controls
    let isDragging = false
    let previousMousePosition = { x: 0, y: 0 }
    let phi = 0
    let theta = 0

    const onMouseDown = (event: MouseEvent) => {
      if (isAddingHotspot) {
        // Handle hotspot placement
        const rect = renderer.domElement.getBoundingClientRect()
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        raycasterRef.current.setFromCamera(mouseRef.current, camera)

        // Intersect with the panorama sphere
        const intersects = raycasterRef.current.intersectObject(sphereRef.current!)

        if (intersects.length > 0) {
          const position = intersects[0].point

          // Create a new hotspot
          const newHotspot: Hotspot = {
            id: Date.now().toString(),
            position: {
              x: position.x,
              y: position.y,
              z: position.z,
            },
            title: "New Hotspot",
            description: "Description for the new hotspot",
          }

          setCurrentHotspot(newHotspot)
          setIsDialogOpen(true)
          setIsAddingHotspot(false)
        }
      } else {
        isDragging = true
        previousMousePosition = { x: event.clientX, y: event.clientY }
      }
    }

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) return

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y,
      }

      // Adjust rotation speed
      const rotationSpeed = 0.003

      // Update angles
      theta -= deltaMove.x * rotationSpeed
      phi -= deltaMove.y * rotationSpeed

      // Clamp phi to avoid flipping
      phi = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, phi))

      // Convert spherical coordinates to Cartesian
      camera.rotation.y = theta
      camera.rotation.x = phi

      previousMousePosition = { x: event.clientX, y: event.clientY }
    }

    const onMouseUp = () => {
      isDragging = false
    }

    // Handle clicks for hotspot selection
    const onClick = (event: MouseEvent) => {
      if (isAddingHotspot) return

      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Update the picking ray with the camera and mouse position
      raycasterRef.current.setFromCamera(mouseRef.current, camera)

      // Calculate objects intersecting the picking ray
      const intersects = raycasterRef.current.intersectObjects(hotspotMeshesRef.current)

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object
        const index = hotspotMeshesRef.current.indexOf(clickedMesh as THREE.Mesh)

        if (index !== -1) {
          setCurrentHotspot(hotspots[index])
          setIsDialogOpen(true)
        }
      }
    }

    // Add event listeners
    renderer.domElement.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    renderer.domElement.addEventListener("click", onClick)

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }

      renderer.domElement.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      renderer.domElement.removeEventListener("click", onClick)
      window.removeEventListener("resize", handleResize)
    }
  }, [tour.panoramaUrl, isAddingHotspot])

  // Add hotspots to the scene
  const addHotspotsToScene = () => {
    if (!sceneRef.current) return

    // Clear existing hotspot meshes
    hotspotMeshesRef.current.forEach((mesh) => {
      sceneRef.current?.remove(mesh)
    })
    hotspotMeshesRef.current = []

    // Add hotspots
    const hotspotGeometry = new THREE.SphereGeometry(5, 32, 32)
    const hotspotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })

    hotspots.forEach((hotspot) => {
      const hotspotMesh = new THREE.Mesh(hotspotGeometry, hotspotMaterial)
      hotspotMesh.position.set(hotspot.position.x, hotspot.position.y, hotspot.position.z)
      sceneRef.current?.add(hotspotMesh)
      hotspotMeshesRef.current.push(hotspotMesh)
    })
  }

  // Update scene when hotspots change
  useEffect(() => {
    addHotspotsToScene()
  }, [hotspots])

  const handleSaveHotspot = async () => {
    if (!currentHotspot) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Check if this is a new hotspot or an update
      const isNew = !hotspots.some((h) => h.id === currentHotspot.id)

      let updatedHotspots

      if (isNew) {
        // Add new hotspot
        updatedHotspots = [...hotspots, currentHotspot]
      } else {
        // Update existing hotspot
        updatedHotspots = hotspots.map((h) => (h.id === currentHotspot.id ? currentHotspot : h))
      }

      // Save to API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tours/${tour._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotspots: updatedHotspots,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save hotspot")
      }

      // Update local state
      setHotspots(updatedHotspots)
      setIsDialogOpen(false)
      setCurrentHotspot(null)
    } catch (error) {
      console.error("Error saving hotspot:", error)
      setError("Failed to save hotspot. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteHotspot = async () => {
    if (!currentHotspot) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Filter out the hotspot to delete
      const updatedHotspots = hotspots.filter((h) => h.id !== currentHotspot.id)

      // Save to API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tours/${tour._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotspots: updatedHotspots,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete hotspot")
      }

      // Update local state
      setHotspots(updatedHotspots)
      setIsDialogOpen(false)
      setCurrentHotspot(null)
    } catch (error) {
      console.error("Error deleting hotspot:", error)
      setError("Failed to delete hotspot. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle>Panorama View</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative h-[60vh] w-full rounded-md overflow-hidden border">
              <div ref={containerRef} className="w-full h-full" />

              <div className="absolute top-4 right-4 z-10">
                <Button
                  onClick={() => setIsAddingHotspot(!isAddingHotspot)}
                  variant={isAddingHotspot ? "default" : "outline"}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {isAddingHotspot ? "Click to Place Hotspot" : "Add Hotspot"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Hotspots</CardTitle>
          </CardHeader>
          <CardContent>
            {hotspots.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No hotspots added yet</p>
                <Button onClick={() => setIsAddingHotspot(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Hotspot
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {hotspots.map((hotspot) => (
                  <div
                    key={hotspot.id}
                    className="p-3 border rounded-md cursor-pointer hover:bg-accent"
                    onClick={() => {
                      setCurrentHotspot(hotspot)
                      setIsDialogOpen(true)
                    }}
                  >
                    <div className="font-medium">{hotspot.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{hotspot.description}</div>
                    {hotspot.linkedTourId && (
                      <div className="text-xs mt-1 text-primary">
                        Links to: {availableTours.find((t) => t._id === hotspot.linkedTourId)?.name || "Unknown tour"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hotspot Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentHotspot && hotspots.some((h) => h.id === currentHotspot.id) ? "Edit Hotspot" : "Add Hotspot"}
            </DialogTitle>
            <DialogDescription>Configure the hotspot details and linked tour if applicable.</DialogDescription>
          </DialogHeader>

          {currentHotspot && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={currentHotspot.title}
                  onChange={(e) => setCurrentHotspot({ ...currentHotspot, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentHotspot.description}
                  onChange={(e) => setCurrentHotspot({ ...currentHotspot, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedTour">Link to Tour (Optional)</Label>
                <Select
                  value={currentHotspot.linkedTourId || ""}
                  onValueChange={(value) => setCurrentHotspot({ ...currentHotspot, linkedTourId: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tour to link" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {availableTours.map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md">{error}</div>}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            {currentHotspot && hotspots.some((h) => h.id === currentHotspot.id) && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteHotspot}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setCurrentHotspot(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveHotspot} disabled={isSubmitting} className="gap-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

