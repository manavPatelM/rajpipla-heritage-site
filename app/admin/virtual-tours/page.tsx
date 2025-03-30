"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AdminHeader from "@/app/virtual-tour/components/admin/admin-header"
import ToursList from "@/app/virtual-tour/components/admin/tours-list"
import TourEditor from "@/app/virtual-tour/components/admin/tour-editor"
import HotspotEditor from "@/app/virtual-tour/components/admin/hotspot-editor"
import type { IVirtualTour } from "@/models/VirtualTour"
import { ImageUpload } from "@/components/image-upload"
import api from "@/lib/axios"

export default function AdminPage() {

  const [tours, setTours] = useState<IVirtualTour[]>([] as IVirtualTour[])
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("tours")

  // Fetch tours only once on mount
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await api.get("/api/virtual-tours")
        setTours(response.data)
      } catch (error) {
        console.error("Error fetching virtual tours:", error)
      }
    }
    fetchTours()
  }, []) // Empty dependency array ensures it runs once

  const selectedTour = selectedTourId ? tours.find((tour) => tour.id === selectedTourId) : null

  const handleSaveTour = async (updatedTour: IVirtualTour) => {
    setTours((prevTours) => prevTours.map((tour) => (tour.id === updatedTour.id ? updatedTour : tour)))
    await api.put(`/api/virtual-tours/${updatedTour.id}`, updatedTour)
  }

  const handleAddTour = async (newTour: IVirtualTour) => {
    setTours((prev) => (Array.isArray(prev) ? [...prev, newTour] : [newTour]));
    await api.post("/api/virtual-tours", newTour);
  };

  const handleDeleteTour = async (tourId: string) => {
    setTours((prevTours) => prevTours.filter((tour) => tour.id !== tourId))
    await api.delete(`/api/virtual-tours/${tourId}`)
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <AdminHeader />

      <main className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Virtual Tour Admin</h1>
          <p className="text-muted-foreground">Manage your virtual tours and hotspots</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="tours">Tours</TabsTrigger>
            <TabsTrigger value="hotspots" disabled={!selectedTourId}>
              Hotspots
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="tours" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <ToursList
                  tours={tours}
                  selectedTourId={selectedTourId}
                  onSelectTour={setSelectedTourId}
                  onAddTour={handleAddTour}
                />
              </div>

              <div className="md:col-span-2">
                {selectedTour ? (
                  <TourEditor
                    tour={selectedTour}
                    onSave={handleSaveTour}
                    onDelete={handleDeleteTour}
                    onEditHotspots={() => setActiveTab("hotspots")}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tour Editor</CardTitle>
                      <CardDescription>Select a tour from the list or create a new one to get started</CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hotspots">
            {selectedTour && <HotspotEditor tour={selectedTour} allTours={tours} onSave={handleSaveTour} />}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View statistics about your virtual tours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[300px] items-center justify-center border border-dashed">
                  <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
