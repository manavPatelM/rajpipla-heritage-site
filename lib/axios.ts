import axios from "axios"
import { toast } from "@/hooks/use-toast"

// Create a base axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
})

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // You can modify the request config here (e.g., add auth headers)
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If the error is due to an expired token and we haven't tried to refresh yet
    if (
      error.response?.status === 401 &&
      error.response?.data?.error?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post("/api/auth/refresh", {}, { withCredentials: true })

        if (refreshResponse.data.success) {
          // Retry the original request
          return api(originalRequest)
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== "undefined") {
          // Clear user data from localStorage
          localStorage.removeItem("user")

          // Show toast notification
          toast({
            title: "Session Expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          })

          // Redirect to login
          window.location.href = "/login"
        }
      }
    }

    // Handle specific error responses
    if (error.response?.data?.error) {
      const errorMessage = error.response.data.error.message || "Something went wrong"

      // Show toast notification for API errors
      // toast({
      //   title: "Error",
      //   description: errorMessage,
      //   variant: "destructive",
      // })

      console.error("API Error:", errorMessage)
    } else if (error.message === "Network Error") {
      // toast({
      //   title: "Network Error",
      //   description: "Please check your internet connection and try again.",
      //   variant: "destructive",
      // })
      console.error("Network Error:", error.message)
    }

    return Promise.reject(error)
  },
)

export default api