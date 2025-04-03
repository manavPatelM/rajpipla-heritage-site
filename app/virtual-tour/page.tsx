"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import api from "@/lib/axios"

async function getTours() {
  try {
    const res = await api.get("api/virtual-tours")
    // console.log("Fetched tours:", res.data);
    
    return res.data.data
  } catch (error) {
    // console.error("Error loading tours:", error)
    return { tours: [] }
  }
}

export default function Home() {

  const [tours, setTours] = useState<any[]>([])

  useEffect(() => {
    const fetchTours = async () => {
      const tours = getTours()
      setTours(await tours)
    }

    fetchTours()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Virtual Tours</h1>
      </div>

      {tours?.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No tours available</h2>
          <p className="text-muted-foreground">Check back later or add some tours in the admin panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(tours)?.map((tour: any) => (
            <Card key={tour._id} className="overflow-hidden">
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
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {tour.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2">{tour.description}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/virtual-tour/tour/${tour._id}`} className="w-full">
                  <Button className="w-full">View Tour</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

