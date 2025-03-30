import { ReactNode } from "react"

export interface Artifact {
  _id?: string
  name: string
  description: string
  era: string
  type: string
  significance: string
  imageUrl: string
  highResImageUrl: string
  pdfGuideUrl?: string
  storyPoints: {
    title: string
    description: string
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface Guide {
  email: ReactNode
  phone: ReactNode
  price: ReactNode
  specialties: any
  location: any
  _id?: string
  userId?: string // Link to Clerk user ID
  name: string
  bio: string
  expertise: string[]
  languages: string[]
  imageUrl: string
  contactInfo: {
    email: string
    phone: string
  }
  availability: {
    startTime: ReactNode
    endTime: ReactNode
    day: string
    date: Date
    slots: {
      startTime: string
      endTime: string
      isBooked: boolean
    }[]
  }[]
  rating: number
  reviews: {
    userId: string
    userName: string
    rating: number
    comment: string
    date: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  _id?: string
  userId: string
  userName: string
  userEmail: string
  guideId: string
  guideName: string
  date: Date
  startTime: string
  endTime: string
  status: "pending" | "confirmed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface VirtualTour {
  _id?: string
  name: string
  description: string
  location: string
  panoramaUrl: string
  hotspots: {
    id: string
    position: { x: number; y: number; z: number }
    title: string
    description: string
    linkedTourId?: string
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  imageUrl: string
  role: "user" | "admin" | "guide"
  guideId?: string // If role is guide
  createdAt: Date
  updatedAt: Date
}

