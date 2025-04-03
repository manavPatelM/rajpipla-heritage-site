"use client"

import TourForm from "@/components/tour-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { use } from "react"

async function getTour(id: string) {
  if (id === "new") return { tour: null }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/virtual-tours/${id}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error("Failed to fetch tour")
    }

    return res.json()
  } catch (error) {
    console.error("Error loading tour:", error)
    return { tour: null }
  }
}

export default async function EditTourPage({ params }: { params: { id: string } }) {
  const { id } = useParams() || {}
  const tourId = typeof id === "string" ? id : "new"
  const { tour } = await getTour(tourId)
  const isNew = params.id === "new"

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{isNew ? "Create New Tour" : "Edit Tour"}</h1>
        <p className="text-muted-foreground">
          {isNew
            ? "Create a new virtual tour by filling out the form below."
            : "Update the details of your virtual tour."}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <TourForm tour={tour} isNew={isNew} />
      </div>
    </div>
  )
}

