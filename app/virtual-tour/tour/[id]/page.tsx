"use client"

import React, { useEffect, useState } from "react"
import { PanoramaViewer } from "@/components/panorama-viewer"
import { Button } from "@/components/ui/button"
import api from "@/lib/axios"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
// import { useParams } from "next/navigation"


export default function TourPage({ params }: { params: { id: string } }) {
    // const { id } = params
  const [tour, setTour] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const { id } = useParams()
//   console.log("Tour ID:", id);
  

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("access_token="))
          ?.split("=")[1]

          console.log("Token:", token);

        const res = await api.get(`/api/virtual-tours/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        setTour(res.data.data)
      } catch (error) {
        console.error("Error loading tour:", error)
        setError("Failed to load tour")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTour()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !tour) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Tour not found</h1>
        <p className="mb-8">{error || "The tour you're looking for doesn't exist or has been removed."}</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 px-4">
      <div className="mb-4">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back to Tours
        </Button>
      </div>

      <div className="mb-4">
        <h1 className="text-3xl font-bold">{tour.name}</h1>
        <p className="text-muted-foreground">{tour.location}</p>
      </div>

      <div className="mb-6">
        <p>{tour.description}</p>
      </div>

      <div className="h-[70vh] w-full rounded-lg overflow-hidden border">
        <PanoramaViewer tour={tour} />
      </div>
    </div>
  )
}
