"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data
        const userResponse = await fetch("/api/auth/me", {
          credentials: "include",
        })

        const userData = await userResponse.json()

        if (!userData.success) {
          throw new Error("Failed to fetch user data")
        }

        setUser(userData.data.user)

        router.push("/")

        // Get user bookings
        const bookingsResponse = await fetch("/api/bookings", {
          credentials: "include",
        })

        const bookingsData = await bookingsResponse.json()

        if (bookingsData.success) {
          setBookings(bookingsData.data || [])
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Tours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {bookings.filter((b) => new Date(b.date) >= new Date() && b.status !== "cancelled").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
          <CardDescription>Your upcoming palace tours</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.filter((b) => new Date(b.date) >= new Date()).length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No upcoming bookings</h3>
              <p className="text-muted-foreground mb-4">Book a tour with one of our expert guides</p>
              <Button asChild>
                <Link href="/guides">Find a Guide</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guide</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings
                  .filter((b) => new Date(b.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">{booking.guideName}</TableCell>
                      <TableCell>{format(new Date(booking.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        {booking.startTime} - {booking.endTime}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past Bookings</CardTitle>
          <CardDescription>Your past palace tours</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.filter((b) => new Date(b.date) < new Date()).length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No past bookings</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guide</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings
                  .filter((b) => new Date(b.date) < new Date())
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">{booking.guideName}</TableCell>
                      <TableCell>{format(new Date(booking.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        {booking.startTime} - {booking.endTime}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

