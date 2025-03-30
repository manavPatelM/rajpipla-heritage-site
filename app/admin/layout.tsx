"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import AdminSidebar from "./components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, refreshAccessToken } = useAuth()

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoading) return

      if (!isAuthenticated) {
        // Try to refresh the token
        const refreshed = await refreshAccessToken()

        if (!refreshed) {
          // Redirect to login if not authenticated
          router.push("/login?redirect=/admin")
          return
        }
      }

      // Check if user is admin
      if (user?.role !== "admin") {
        router.push("/dashboard")
      }
    }

    checkAuth()
  }, [isAuthenticated, isLoading, refreshAccessToken, router, user])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">{children}</div>
    </div>
  )
}