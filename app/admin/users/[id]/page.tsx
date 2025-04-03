import { updateUser, getUserById, deleteGuide, getGuideByUserId, updateUserRole } from "@/lib/db-service"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { format } from "date-fns"
import { IUser } from "@/models/User"

// Server action to update the user
async function handleUpdateUser(formData: FormData) {
  "use server"
  
  const id = formData.get("id") as string
  const oldRole = formData.get("oldRole") as string
  const newRole = formData.get("role") as "admin" | "guide" | "user"
  
  // Extract user data from form
  const userData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    updatedAt: new Date()
  }
  
  // Validate data
  if (!userData.firstName || !userData.lastName || !userData.email || !newRole) {
    throw new Error("Missing required fields")
  }

  // Check if role has changed from guide to another role
  if (oldRole === "guide" && newRole !== "guide") {
    // Get the guide associated with this user
    const guide = await getGuideByUserId(id) as { _id: string }
    
    // If a guide record exists, delete it
    if (guide) {
      await deleteGuide(guide._id.toString())
    }
    
    // Update user with new role (this removes guideId if it exists)
    await updateUserRole(id, newRole)
  } 
  // Update the role if it changed
  else if (oldRole !== newRole) {
    await updateUserRole(id, newRole)
  }
  
  // Update other user information
  const updatedUser = await updateUser(id, userData)
  
  if (!updatedUser) {
    throw new Error("Failed to update user")
  }
  
  // Redirect back to users list
  redirect("/admin/users")
}

export default async function EditUserPage({ params }: { params: { id: string } }) {
  // Fetch user data using the provided service function
  const user = await getUserById(params.id) as IUser
  
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-red-600">User not found</h1>
        <p className="mt-4">The requested user does not exist or has been deleted.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
    )
  }
  
  // Get associated guide if the user is a guide
  const guideInfo = user.role === "guide" ? await getGuideByUserId(user._id.toString()) : null
  
  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit User</h1>
        <Button asChild variant="outline">
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <form action={handleUpdateUser}>
          <input type="hidden" name="id" value={user._id.toString()} />
          <input type="hidden" name="oldRole" value={user.role} />
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  name="firstName" 
                  defaultValue={user.firstName || ""} 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  defaultValue={user.lastName || ""} 
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                defaultValue={user.email || ""} 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue={user.role || "user"}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              
              {user.role === "guide" && guideInfo && (
                <p className="text-sm text-amber-600 mt-2">
                  Warning: Changing this user from Guide role will remove their guide profile.
                </p>
              )}
            </div>
            
            {/* Display guide info if user is a guide */}
            {user.role === "guide" && guideInfo && (
              <div className="pt-2 border-t border-gray-200">
                <h3 className="font-medium mb-2">Guide Information</h3>
                <p className="text-sm text-gray-500">
                  Guide Name: {guideInfo.name}
                </p>
                {guideInfo.expertise && (
                  <p className="text-sm text-gray-500">
                    Expertise: {guideInfo.expertise.join(", ")}
                  </p>
                )}
                {guideInfo.languages && (
                  <p className="text-sm text-gray-500">
                    Languages: {guideInfo.languages.join(", ")}
                  </p>
                )}
              </div>
            )}
            
            <div className="pt-2">
              {user.createdAt && (
                <p className="text-sm text-gray-500">
                  Created: {format(new Date(user.createdAt), "MMM dd, yyyy")}
                </p>
              )}
              {user.updatedAt && (
                <p className="text-sm text-gray-500">
                  Last updated: {format(new Date(user.updatedAt), "MMM dd, yyyy")}
                </p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/admin/users">Cancel</Link>
            </Button>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}