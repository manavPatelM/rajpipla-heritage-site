"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import api from "@/lib/axios"
import axios from "axios"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  imageUrl?: string
  guideId?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  registerGuide: (guideData: GuideRegisterData) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  refreshAccessToken: () => Promise<boolean>
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  imageUrl?: string
}

interface GuideRegisterData extends RegisterData {
  bio: string
  expertise: string[]
  languages: string[]
  phone: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to get user data from localStorage first
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }

        // Try to get current user data from API
        const response = await api.get("/api/auth/me")

        if (response.data.success) {
          setUser(response.data.data.user)
          localStorage.setItem("user", JSON.stringify(response.data.data.user))
        } else {
          // If API call fails, try to refresh the token
          const refreshed = await refreshAccessToken()

          if (!refreshed) {
            // Clear auth state if refresh fails
            setUser(null)
            localStorage.removeItem("user")
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)

        // Try to refresh the token
        const refreshed = await refreshAccessToken()

        if (!refreshed) {
          // Clear auth state if refresh fails
          setUser(null)
          localStorage.removeItem("user")
        }
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const response = await axios.post("/api/auth/refresh", {}, { withCredentials: true })

      if (!response.data.success) {
        return false
      }

      setUser(response.data.data.user)

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(response.data.data.user))

      return true
    } catch (error) {
      console.error("Error refreshing token:", error)
      return false
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const response = await api.post("/api/auth/login", { email, password })

      if (!response.data.success) {
        throw new Error(response.data.error?.message || "Failed to login")
      }

      setUser(response.data.data.user)

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.data.user))

      toast({
        title: "Success",
        description: "Logged in successfully",
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || "Something went wrong"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)

    try {
      const response = await api.post("/api/auth/register", { ...userData, role: "user" })

      if (!response.data.success) {
        throw new Error(response.data.error?.message || "Failed to register")
      }

      setUser(response.data.data.user)

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.data.user))

      toast({
        title: "Success",
        description: "Registered successfully",
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || "Something went wrong"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const registerGuide = async (guideData: GuideRegisterData) => {
    setIsLoading(true)

    try {
      // First, register the user
      const userResponse = await api.post("/api/auth/register", {
        firstName: guideData.firstName,
        lastName: guideData.lastName,
        email: guideData.email,
        password: guideData.password,
        imageUrl: guideData.imageUrl,
        role: "guide",
      })

      if (!userResponse.data.success) {
        throw new Error(userResponse.data.error?.message || "Failed to register user")
      }

      setUser(userResponse.data.data.user)

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(userResponse.data.data.user))

      // Then, create the guide profile
      const guideResponse = await api.post("/api/guides/register", {
        userId: userResponse.data.data.user.id,
        name: `${guideData.firstName} ${guideData.lastName}`,
        bio: guideData.bio,
        expertise: guideData.expertise,
        languages: guideData.languages,
        imageUrl: guideData.imageUrl,
        contactInfo: {
          email: guideData.email,
          phone: guideData.phone,
        },
      })

      if (!guideResponse.data.success) {
        throw new Error(guideResponse.data.error?.message || "Failed to register guide profile")
      }

      // Update user with guide ID
      const updatedUser = {
        ...userResponse.data.data.user,
        guideId: guideResponse.data.data.guide._id,
      }

      setUser(updatedUser)

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser))

      toast({
        title: "Success",
        description: "Registered successfully as a guide",
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || "Something went wrong"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.post("/api/auth/logout")

      setUser(null)

      // Clear user data from localStorage
      localStorage.removeItem("user")

      toast({
        title: "Success",
        description: "Logged out successfully",
      })

      router.push("/")
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || "Something went wrong"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })

      // Still clear user data even if API call fails
      setUser(null)
      localStorage.removeItem("user")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        registerGuide,
        logout,
        isAuthenticated: !!user,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}