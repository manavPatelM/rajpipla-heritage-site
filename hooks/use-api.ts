"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"

interface FetchOptions extends RequestInit {
  requireAuth?: boolean
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useApi() {
  const { accessToken, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchApi = useCallback(
    async <T>(url: string, options: FetchOptions = {}): Promise<ApiResponse<T>> => {
      setIsLoading(true)
  setError(null)

  try {
    const { requireAuth = true, ...fetchOptions } = options

    // Set default headers
    const headers = new Headers(options.headers)

    // Set content type if not provided
    if (!headers.has("Content-Type") && !options.body) {
      headers.set("Content-Type", "application/json")
    }

    // Add authorization header if token exists and auth is required
    if (requireAuth && accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`)
    }

    const response = await fetch(url, {
          ...fetchOptions,
          headers,
        })

    const data = await response.json()

    if (!data.success) {
      // Handle authentication errors
      if (data.error?.code === "UNAUTHORIZED" || response.status === 401) {
        // Token expired or invalid, logout user
        logout()
      }

      throw new Error(data.error?.message || "Something went wrong")
    }

    return data
  } catch (err: any) {
    setError(err.message || "Something went wrong")
    throw err
  } finally {
    setIsLoading(false)
  }
}
,
    [accessToken, logout]
  )

return {
    fetchApi,
    isLoading,
    error,
  };
}

