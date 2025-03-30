"use client"

import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, Filter, X } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/axios"
import { Guide } from "@/lib/models"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@radix-ui/react-checkbox"
import { Slider } from "@radix-ui/react-slider"


export default function GuidesPage() {

  const toggleSelection = (list: string[], item: string) => {
    if (list.includes(item)) {
      return list.filter((i) => i !== item)
    } else {
      return [...list, item]
    }
  }
  const [guides, setGuides] = useState<Guide[]>([])
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const languages = ["English", "Hindi", "Gujarati", "Marathi"] // Example languages
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const expertise = ["History", "Architecture", "Culture", "Art"] // Example expertise options
  const specialties = ["History", "Architecture", "Culture", "Art"] // Example specialties options
  const [minRating, setMinRating] = useState(0)
  const [selectedLocation, setSelectedLocation] = useState<string>("any")
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] // Days of the week

  // Fetch guides data
  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log("data is : ");
        const response = await api.get("/api/guides")
        console.log("data is : ",Object.values(response.data)[1]);
        
        // Ensure data is an array
        const data = Array.isArray(Object.values(response.data)[1]) 
          ? (Object.values(response.data)[1] as Guide[]) 
          : []

        
        if (data.length === 0) {
          setError("No guides found")
        }
        
        setGuides(data)
        setFilteredGuides(data)
      } catch (error) {
        console.error("Error fetching guides:", error)
        setError("Failed to fetch guides")
        setGuides([])
        setFilteredGuides([])
      } finally {
        setLoading(false)
      }
    }

    fetchGuides()
  }, [])

  // Apply filters when any filter changes
  useEffect(() => {
    
    let result = guides

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (guide) =>
          guide.name.toLowerCase().includes(query) ||
          guide.bio.toLowerCase().includes(query) ||
          guide.expertise.some((exp) => exp.toLowerCase().includes(query))
      )
    }

    // Languages filter
    if (selectedLanguages.length > 0) {
      result = result.filter((guide) => 
        selectedLanguages.every((lang) => guide.languages.includes(lang))
      )
    }

    // Expertise filter
    if (selectedExpertise.length > 0) {
      result = result.filter((guide) => 
        selectedExpertise.some((exp) => guide.expertise.includes(exp))
      )
    }

    // Rating filter
    if (minRating > 0) {
      result = result.filter((guide) => guide.rating >= minRating)
    }

  //   // Availability days filter
    if (availableDays.length > 0) {
      result = result.filter((guide) =>
        availableDays.some((day) =>
          guide.availability.some(
            (slot) => new Date(slot.date).toLocaleDateString("en-US", { weekday: "long" }) === day
          )
        )
      )
    }

    setFilteredGuides(result)
  }, [guides, searchQuery, selectedLanguages, selectedExpertise, minRating, availableDays])

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedLanguages([])
    setSelectedExpertise([])
    setMinRating(0)
    setAvailableDays([])
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Palace Guides of India</h1>
              <p className="text-muted-foreground text-sm">
                Discover the rich history and culture of Indian palaces with our expert guides
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search guides, specialties..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="absolute right-2.5 top-2.5" onClick={() => setSearchQuery("")}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Palace Guides</SheetTitle>
                    <SheetDescription>Find the perfect guide for your palace tour</SheetDescription>
                  </SheetHeader>

                  <div className="py-6 space-y-6">
                    {/* <div className="space-y-2">
                      <h3 className="text-sm font-medium">Location</h3>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any location</SelectItem>
                          {location.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div> */}

                    <Accordion type="multiple" className="w-full">
                      <AccordionItem value="languages">
                        <AccordionTrigger className="text-sm font-medium">Languages</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {languages.map((language) => (
                              <div key={language} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`language-${language}`}
                                  checked={selectedLanguages.includes(language)}
                                  onCheckedChange={() => {
                                    setSelectedLanguages((prev) => toggleSelection(prev, language))
                                  }}
                                />
                                <label
                                  htmlFor={`language-${language}`}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {language}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="specialties">
                        <AccordionTrigger className="text-sm font-medium">Specialties</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {specialties.map((specialty) => (
                              <div key={specialty} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`specialty-${specialty}`}
                                  checked={selectedSpecialties.includes(specialty)}
                                  onCheckedChange={() => {
                                    setSelectedSpecialties((prev) => toggleSelection(prev, specialty))
                                  }}
                                />
                                <label
                                  htmlFor={`specialty-${specialty}`}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {specialty}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="availability">
                        <AccordionTrigger className="text-sm font-medium">Availability</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {days.map((day) => (
                              <div key={day} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`day-${day}`}
                                  checked={availableDays.includes(day)}
                                  onCheckedChange={() => {
                                    setAvailableDays((prev) => toggleSelection(prev, day))
                                  }}
                                />
                                <label
                                  htmlFor={`day-${day}`}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {day}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Minimum Rating</h3>
                        <span className="text-sm font-medium">{minRating} ★</span>
                      </div>
                      <Slider
                        value={[minRating]}
                        min={0}
                        max={5}
                        step={0.5}
                        onValueChange={(value) => setMinRating(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Price Range</h3>
                        <span className="text-sm font-medium">
                          ${priceRange[0]} - ${priceRange[1]}
                        </span>
                      </div>
                      <Slider value={priceRange} min={0} max={500} step={10} onValueChange={(value) => setPriceRange([value[0], value[1]])} />
                    </div>
                  </div>

                  <SheetFooter className="flex flex-row gap-2 sm:justify-between">
                    <Button variant="outline" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                    <SheetClose asChild>
                      <Button>Apply Filters</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Active filters display */}
        </div>
      </header>

      <main className="container mx-auto py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                </div>
                <div className="p-6 border-t border-border flex justify-between">
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredGuides.length} of {guides.length} guides
              </p>
              <Select defaultValue="rating">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Sort by Rating</SelectItem>
                  <SelectItem value="reviews">Sort by Reviews</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredGuides.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No guides found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  We couldn't find any guides matching your current filters. Try adjusting your search criteria.
                </p>
                <Button onClick={resetFilters}>Reset Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGuides.map((guide) => (
                  <Link href={`/guides/${guide._id}`} key={guide._id} className="group">
                    <Card className="overflow-hidden h-full transition-all duration-200 group-hover:shadow-md group-hover:border-primary/50 palace-card">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-primary/20">
                            <AvatarImage src={guide.imageUrl} alt={guide.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {guide.name}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="font-bold text-lg group-hover:text-primary transition-colors">
                              {guide.name}
                            </h2>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground line-clamp-3">{guide.bio}</p>
                        </div>

                        {/* <div className="flex items-center text-sm mt-4">
                          <MapPin className="h-4 w-4 mr-1 text-primary" />
                          <span className="text-muted-foreground">{guide.location}</span>

                          {guide.price && <div className="ml-auto font-medium">₹{guide.price}/tour</div>}
                        </div> */}

                        {/* <div className="flex flex-wrap gap-2 mt-4">
                          {guide.specialties.slice(0, 3).map((specialty: boolean | Key | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined) => (
                            <Badge key={specialty as string} variant="outline" className="border-primary/20 bg-primary/5">
                              {specialty}
                            </Badge>
                          ))}
                          {guide.specialties.length > 3 && (
                            <Badge variant="outline" className="border-primary/20 bg-primary/5">
                              +{guide.specialties.length - 3} more
                            </Badge>
                          )}
                        </div> */}
                      </CardContent>
                      <CardFooter className="px-6 py-4 border-t border-border bg-muted/40 flex justify-between">
                        <Button variant="outline" size="sm" className="w-[48%]">
                          View Profile
                        </Button>
                        <Button size="sm" className="w-[48%] bg-primary hover:bg-primary/90">
                          Book Now
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}


