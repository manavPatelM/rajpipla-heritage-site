"use client"

import { useState } from "react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import UserRegistrationForm from "./components/user-registration-form"
import GuideRegistrationForm from "./components/guide-registration-form"

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<"user" | "guide">("user")

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Choose your account type and enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="role">Account Type</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as "user" | "guide")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Regular User</SelectItem>
                <SelectItem value="guide">Guide</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole === "user" && <UserRegistrationForm />}
          {selectedRole === "guide" && <GuideRegistrationForm />}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

