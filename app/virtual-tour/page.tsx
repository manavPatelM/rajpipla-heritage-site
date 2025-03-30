import TourViewer from "./components/tour-viewer/tour-viewer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="relative h-screen w-full">
      <TourViewer />
      <div className="absolute top-4 right-4 z-10">
        <Button asChild variant="outline" className="bg-background/80 backdrop-blur-sm">
          <Link href="/admin">Admin Panel</Link>
        </Button>
      </div>
    </div>
  )
}

