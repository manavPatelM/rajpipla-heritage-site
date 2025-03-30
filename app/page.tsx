import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Compass, Book, Users } from "lucide-react"

export default async function Home() {

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Video Background */}
      <section className="relative h-[70vh] overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/placeholder.svg?height=1080&width=1920"
        >
          <source src="/videos/palace-tour.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Discover Rajpipla Palace</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl">
            Explore the rich heritage and cultural legacy of one of India's most magnificent palaces
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/virtual-tour">Start Virtual Tour</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg bg-transparent text-white border-white hover:bg-white/10"
            >
              <Link href="/artifacts">Explore Artifacts</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Experience Rajpipla Palace</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 shadow-md flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Compass className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Virtual Tour</h3>
              <p className="mb-4 text-muted-foreground">
                Explore the palace in immersive 360° panoramic views from anywhere in the world.
              </p>
              <Button asChild variant="link" className="mt-auto">
                <Link href="/virtual-tour">
                  Start Tour <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="bg-card rounded-lg p-8 shadow-md flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Book className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Explore Artifacts</h3>
              <p className="mb-4 text-muted-foreground">
                Discover our collection of historical artifacts with detailed information and high-resolution images.
              </p>
              <Button asChild variant="link" className="mt-auto">
                <Link href="/artifacts">
                  View Collection <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="bg-card rounded-lg p-8 shadow-md flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Find a Guide</h3>
              <p className="mb-4 text-muted-foreground">
                Book a knowledgeable guide for a personalized tour of the palace and its history.
              </p>
              <Button asChild variant="link" className="mt-auto">
                <Link href="/guides">
                  Book Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

