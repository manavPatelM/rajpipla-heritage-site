import { getDb } from "@/lib/db-service"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page) : 1
  const limit = 20
  const skip = (page - 1) * limit

  const db = await getDb()

  // Get users with pagination
  const [users, total] = await Promise.all([
    db.collection("users").find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    db.collection("users").countDocuments({}),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <Button asChild>
          <Link href="/admin/users/create">Create Admin User</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      user.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : user.role === "guide"
                          ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(user.createdAt), "MMM dd, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/users/${user.id}`}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link key={pageNum} href={`/admin/users?page=${pageNum}`}>
                <Button variant={pageNum === page ? "default" : "outline"} size="sm" className="w-10">
                  {pageNum}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

