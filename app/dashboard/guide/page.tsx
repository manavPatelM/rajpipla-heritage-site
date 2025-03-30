import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getGuideByUserId, getGuideBookings } from "@/lib/db-service"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { errorResponse } from "@/lib/api-utils"
import { getTokenFromRequest, verifyAccessToken } from "@/lib/jwt"
import { NextRequest } from "next/server"

export default async function GuideDashboardPage({ req }: { req: NextRequest }) {
  const token = await getTokenFromRequest(req)
  // Verify token
  const payload = await verifyAccessToken(token || "")
  if (!payload || typeof payload.userId !== "string") {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
  }
  const { userId } = payload

  // if (!userId) {
  //   redirect("/login")
  // }

  const guide = await getGuideByUserId(userId)
  console.log("guide is sfrgthdyfxfbxgxdfbv bccfxgzfdvxbffgxdrzfesdvxccf : ",guide);
  

  if (!guide) {
    redirect("/dashboard")
  }

  const bookings = await getGuideBookings(guide._id as string)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Guide Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              {bookings.filter((b) => new Date(b.date) >= new Date() && b.status === "confirmed").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{guide.rating.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
          <CardDescription>Manage your upcoming tour bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.filter((b) => new Date(b.date) >= new Date()).length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No upcoming bookings</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
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
                    <TableRow key={booking._id as string}>
                      <TableCell className="font-medium">{booking.userName}</TableCell>
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
          <CardDescription>View your past tour bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.filter((b) => new Date(b.date) < new Date()).length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No past bookings</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
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
                    <TableRow key={booking._id as string}>
                      <TableCell className="font-medium">{booking.userName}</TableCell>
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

