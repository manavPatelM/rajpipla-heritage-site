import HotspotManager from "@/components/hotspot-manager"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

async function getTour(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tours/${id}`, {
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

async function getAllTours() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tours`, {
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error("Failed to fetch tours")
    }

    return res.json()
  } catch (error) {
    console.error("Error loading tours:", error)
    return { tours: [] }
  }
}

export default async function HotspotsPage({ params }: { params: { id: string } }) {
  const { tour } = await getTour(params.id)
  const { tours = [] } = await getAllTours()

  if (!tour) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Tour not found</h1>
        <p className="mb-8">The tour you're looking for doesn't exist or has been removed.</p>
        <Link href="/admin">
          <Button>Back to Admin</Button>
        </Link>
      </div>
    )
  }

  // Filter out the current tour from the list of available tours for linking
  const availableTours = tours.filter((t: any) => t._id !== tour._id)

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
        <h1 className="text-3xl font-bold">Manage Hotspots</h1>
        <p className="text-muted-foreground">{tour.name} - Add and manage interactive hotspots for this tour</p>
      </div>

      <HotspotManager tour={tour} availableTours={availableTours} />
    </div>
  )
}

