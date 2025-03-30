import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDb } from "@/lib/db-service"

export default async function AdminDashboard() {
  const db = await getDb()

  // Get counts for dashboard
  const [artifactsCount, guidesCount, bookingsCount, toursCount, usersCount] = await Promise.all([
    db.collection("artifacts").countDocuments(),
    db.collection("guides").countDocuments(),
    db.collection("bookings").countDocuments(),
    db.collection("virtual_tours").countDocuments(),
    db.collection("users").countDocuments(),
  ])

  // Get recent bookings
  const recentBookings = await db.collection("bookings").find().sort({ createdAt: -1 }).limit(5).toArray()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Artifacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{artifactsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Guides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{guidesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bookingsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{usersCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking: any) => (
                <div key={booking._id} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="font-medium">{booking.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.date).toLocaleDateString()} • {booking.startTime}-{booking.endTime}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Virtual Tours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: toursCount }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded bg-muted mr-3" />
                    <div>
                      <p className="font-medium">Tour Location {i + 1}</p>
                      <p className="text-sm text-muted-foreground">{Math.floor(Math.random() * 100)} views</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{Math.floor(Math.random() * 10) + 1} hotspots</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

