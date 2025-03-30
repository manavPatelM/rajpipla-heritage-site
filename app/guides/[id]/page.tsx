"use client"

import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react"
import { useParams, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  Star,
  ArrowLeft,
  CalendarIcon,
  CheckCircle,
  Languages,
  Award,
  Briefcase,
  User,
} from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import api from "@/lib/axios"
import { Guide } from "@/lib/models"

export default function GuideProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params

  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)

  // Fetch guide data
  useEffect(() => {
    const fetchGuide = async () => {
      setLoading(true)
      try {
        // In a real app, fetch from your API
        // const response = await fetch(/api/guides/${id})
        // const data = await response.json()

        // Using mock data for demonstration
        const guideId = id
        const response = await api.get(`api/guides/${guideId}`)  

        const data = response.data.data
        console.log("data is : ",data);
        

        if (!data) {
          router.push("/guides")
          return
        }

        setGuide(data)
      } catch (error) {
        console.error("Error fetching guide:", error)
        router.push("/guides")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchGuide()
    }
  }, [id, router])

  // Calculate rating distribution
  const getRatingDistribution = () => {
    if (!guide) return [0, 0, 0, 0, 0]

    const distribution = [0, 0, 0, 0, 0]
    Object.values(guide.reviews).forEach((review) => {
      const index = Math.floor(review.rating) - 1
      if (index >= 0 && index < 5) {
        distribution[index]++
      }
    })

    return distribution.reverse() // 5 to 1 stars
  }

  // Get available time slots for selected day
  const getAvailableTimeSlots = () => {
    if (!guide || !selectedDay) return []

    const dayAvailability = guide.availability.find((a) => a.day === selectedDay)
    if (!dayAvailability) return []

    const { startTime, endTime } = dayAvailability.slots[0] || {}
    const start = Number.parseInt(startTime.split(":")[0])
    const end = Number.parseInt(endTime.split(":")[0])

    const slots = []
    for (let hour = start; hour < end; hour++) {
      slots.push(`${hour}:00 - ${hour + 1}:00`)
    }

    return slots
  }

  // Handle day selection from calendar
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return

    setDate(selectedDate)

    const dayName = format(selectedDate, "EEEE")
    if (guide?.availability.some((a) => a.day === dayName)) {
      setSelectedDay(dayName)
    } else {
      setSelectedDay(null)
      setSelectedTimeSlot(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/guides">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="relative pb-0 h-48 bg-muted">
                <Skeleton className="absolute bottom-0 translate-y-1/2 left-6 h-24 w-24 rounded-full border-4 border-background" />
              </CardHeader>
              <CardContent className="pt-16 pb-6">
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-[300px] w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Guide not found</h1>
        <p className="mb-6">The guide you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/guides">Back to Guides</Link>
        </Button>
      </div>
    )
  }

  const ratingDistribution = getRatingDistribution()
  const availableTimeSlots = getAvailableTimeSlots()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/guides">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Guide Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card */}
            <Card>
              <CardHeader className="relative pb-0 h-48 palace-header">
                <Avatar className="absolute bottom-0 translate-y-1/2 left-6 h-24 w-24 border-4 border-background">
                  <AvatarImage src={guide.imageUrl} alt={guide.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {guide.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </CardHeader>
              <CardContent className="pt-16 pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{guide.name}</h2>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {guide.location}
                    </div>
                  </div>

                  <div className="flex items-center mt-2 md:mt-0">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < Math.floor(guide.rating) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 font-medium">{guide.rating}</span>
                    <span className="text-muted-foreground ml-1">({guide.reviews.length} reviews)</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">{guide.bio}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Briefcase className="h-6 w-6 text-primary mb-2" />
                    <span className="text-sm text-muted-foreground">Experience</span>
                    <span className="font-bold">{guide.expertise} Years</span>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Languages className="h-6 w-6 text-primary mb-2" />
                    <span className="text-sm text-muted-foreground">Languages</span>
                    <span className="font-bold">{guide.languages.length}</span>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Award className="h-6 w-6 text-primary mb-2" />
                    <span className="text-sm text-muted-foreground">Specialties</span>
                    <span className="font-bold">{(guide.specialties)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {guide.languages.map((language) => (
                        <Badge key={language} variant="secondary" className="bg-primary/10 text-primary-foreground">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-primary/20 bg-primary/5">
                          {guide.specialties}
                        </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for more information */}
            <Tabs defaultValue="availability">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="availability" className="p-4 bg-card rounded-md border">
                <h3 className="text-lg font-medium mb-4">Weekly Schedule</h3>
                <div className="space-y-3">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                    const dayAvailability = guide.availability.find((a) => a.day === day)
                    return (
                      <div key={day} className="flex items-center">
                        <div className="w-32 font-medium">{day}</div>
                        {dayAvailability ? (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-primary" />
                            <span>
                              {dayAvailability.startTime} - {dayAvailability.endTime}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not available</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 p-4 bg-card rounded-md border">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold">{guide.rating}</div>
                      <div className="flex justify-center my-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < Math.floor(guide.rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">{guide.reviews.length} reviews</div>
                    </div>

                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((star, index) => {
                        const count = ratingDistribution[index]
                        const percentage =
                          guide.reviews.length > 0 ? Math.round((count / guide.reviews.length) * 100) : 0

                        return (
                          <div key={star} className="flex items-center gap-2">
                            <div className="w-12 text-sm text-right">{star} stars</div>
                            <Progress value={percentage} className="h-2" />
                            <div className="w-12 text-sm text-muted-foreground">{count}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    {guide.reviews.length > 0 ? (
                      guide.reviews.map((review, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex justify-between mb-2">
                              <div className="font-medium">{review.userName || `User ${review.userId}`}</div>
                              <div className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</div>
                            </div>
                            <div className="flex mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                                />
                              ))}
                            </div>
                            <p className="text-sm">{review.comment}</p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No reviews yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="p-6 bg-card rounded-md border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <div className="text-sm text-muted-foreground">Email</div>
                          <div>{guide.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <div className="text-sm text-muted-foreground">Phone</div>
                          <div>{guide.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <div className="text-sm text-muted-foreground">Location</div>
                          <div>{guide.location}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Send a Message</h3>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm">
                          Your Name
                        </label>
                        <Input id="name" placeholder="Enter your name" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm">
                          Your Email
                        </label>
                        <Input id="email" type="email" placeholder="Enter your email" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="message" className="text-sm">
                          Message
                        </label>
                        <Textarea id="message" placeholder="Type your message here" rows={4} />
                      </div>
                      <Button className="w-full">Send Message</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle>Book a Palace Tour</CardTitle>
                <CardDescription>Select a date and time to book with {guide.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <div className="text-2xl font-bold">₹{guide.price}/tour</div>
                  <div className="text-sm text-muted-foreground">Approximately 2-3 hours</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        disabled={(date) => {
                          const dayName = format(date, "EEEE")
                          return !guide.availability.some((a) => a.day === dayName) || date < new Date()
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {selectedDay && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Time</label>
                    <Select onValueChange={setSelectedTimeSlot} value={selectedTimeSlot || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" disabled={!selectedDay || !selectedTimeSlot}>
                      Book Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Palace Tour Booking</DialogTitle>
                      <DialogDescription>Please review your booking details before confirming.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Guide</div>
                          <div className="font-medium">{guide.name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Price</div>
                          <div className="font-medium">₹{guide.price}/tour</div>
                        </div>
                      </div>

                      <Separator className="indian-border h-[2px]" />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Date</div>
                          <div className="font-medium">{date ? format(date, "PPP") : ""}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Time</div>
                          <div className="font-medium">{selectedTimeSlot}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Special Requests</label>
                        <Textarea placeholder="Any special requirements or questions about the palace tour?" />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                        Confirm Booking
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                  Free cancellation up to 24 hours before
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Reach out directly to book or inquire</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center mb-3">
                    <Mail className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div>{guide.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center mb-3">
                    <Phone className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div>{guide.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div>{guide.location}</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Guide
                  </Button>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4" />
                    Call Guide
                  </Button>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">Book Now</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data based on the provided schema
const mockGuides = [
  {
    _id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Experienced tour guide with 10+ years of experience in mountain trails and historical sites. I specialize in adventure tours and can help you discover hidden gems in the mountains.",
    location: "Denver, Colorado",
    languages: ["English", "Spanish", "French"],
    specialties: ["Mountain Hiking", "Historical Tours", "Wildlife Spotting"],
    availability: [
      { day: "Monday", startTime: "09:00", endTime: "17:00" },
      { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
      { day: "Friday", startTime: "09:00", endTime: "17:00" },
    ],
    rating: 4.8,
    reviews: [
      {
        userId: "user1",
        userName: "Sarah Johnson",
        rating: 5,
        comment: "Excellent guide, very knowledgeable!",
        date: "2023-05-15",
      },
      {
        userId: "user2",
        userName: "Mike Peters",
        rating: 4,
        comment: "Great experience, would recommend!",
        date: "2023-06-20",
      },
      {
        userId: "user3",
        userName: "Emily Clark",
        rating: 5,
        comment: "John made our trip unforgettable!",
        date: "2023-07-10",
      },
    ],
    profileImage: "/placeholder.svg?height=200&width=200",
    price: 120,
    experience: 10,
  },
  {
    _id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
    bio: "Passionate about urban exploration and cultural experiences. Specialized in city tours and food trails. Let me show you the best local cuisine and hidden urban spots!",
    location: "New York City, NY",
    languages: ["English", "Italian", "German"],
    specialties: ["City Tours", "Food Trails", "Art Galleries"],
    availability: [
      { day: "Tuesday", startTime: "10:00", endTime: "18:00" },
      { day: "Thursday", startTime: "10:00", endTime: "18:00" },
      { day: "Saturday", startTime: "11:00", endTime: "19:00" },
    ],
    rating: 4.6,
    reviews: [
      {
        userId: "user4",
        userName: "David Wong",
        rating: 5,
        comment: "Jane's knowledge of NYC is impressive!",
        date: "2023-04-25",
      },
      {
        userId: "user5",
        userName: "Lisa Garcia",
        rating: 4,
        comment: "Great food tour, discovered amazing places!",
        date: "2023-05-30",
      },
    ],
    profileImage: "/placeholder.svg?height=200&width=200",
    price: 150,
    experience: 7,
  },
  {
    _id: "3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    phone: "+1 (555) 234-5678",
    bio: "Marine biologist turned diving instructor. I offer unique underwater tours with educational insights about marine ecosystems. Perfect for both beginners and experienced divers.",
    location: "Miami, Florida",
    languages: ["English", "Portuguese", "Spanish"],
    specialties: ["Scuba Diving", "Snorkeling", "Marine Life Tours"],
    availability: [
      { day: "Monday", startTime: "08:00", endTime: "16:00" },
      { day: "Tuesday", startTime: "08:00", endTime: "16:00" },
      { day: "Thursday", startTime: "08:00", endTime: "16:00" },
      { day: "Friday", startTime: "08:00", endTime: "16:00" },
    ],
    rating: 4.9,
    reviews: [
      {
        userId: "user6",
        userName: "James Wilson",
        rating: 5,
        comment: "Amazing diving experience with Robert!",
        date: "2023-03-12",
      },
      {
        userId: "user7",
        userName: "Sophia Lee",
        rating: 5,
        comment: "Learned so much about marine life. Unforgettable!",
        date: "2023-04-05",
      },
      {
        userId: "user8",
        userName: "Daniel Martinez",
        rating: 5,
        comment: "Best diving instructor I've ever had!",
        date: "2023-05-22",
      },
    ],
    profileImage: "/placeholder.svg?height=200&width=200",
    price: 200,
    experience: 12,
  },
]