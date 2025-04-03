// "use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import DeleteTourButton from "@/components/delete-tour-button"
import api from "@/lib/axios"
// import { useState, useEffect } from "react"
import { getDb } from "@/lib/db-service"


async function getTours() {
  const db = await getDb()
  const tours = await db.collection("virtualtours").find({}).toArray()
  return tours
}

export default async function AdminPage() {

  // const [tours, setTours] = useState([])

  const tours = await getTours()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Link href="/admin/virtual-tours/tour/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Tour
          </Button>
        </Link>
      </div>

      {tours?.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No tours available</h2>
          <p className="text-muted-foreground mb-6">Create your first virtual tour to get started.</p>
          <Link href="/admin/virtual-tours/tour/new">
            <Button>Create Tour</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours?.map((tour: any) => (
            <Card key={tour._id}>
              <div className="relative h-48 w-full">
                <Image
                  src={tour.panoramaUrl || "/placeholder.svg?height=200&width=400"}
                  alt={tour.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{tour.name}</CardTitle>
                <CardDescription>{tour.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2">{tour.description}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {tour.hotspots.length} hotspot{tour.hotspots.length !== 1 ? "s" : ""}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/admin/virtual-tours/tour/${tour._id}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Link href={`/admin/virtual-tours/tour/${tour._id}/hotspots`}>
                  <Button variant="outline" size="sm">
                    Manage Hotspots
                  </Button>
                </Link>
                <DeleteTourButton id={tour?._id as string} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

