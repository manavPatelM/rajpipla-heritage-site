import clientPromise from "./mongodb"
import dbConnect from "./mongoose"
import UserModel, { type IUser } from "@/models/User"
import ArtifactModel, { type IArtifact } from "@/models/Artifact"
import GuideModel, { type IGuide } from "@/models/Guide"
import BookingModel, { type IBooking } from "@/models/Booking"
import VirtualTourModel, { type IVirtualTour } from "@/models/VirtualTour"
import mongoose from "mongoose"
import { getTokenFromRequest } from "./jwt"
import { get } from "http"

// Database and collections
const DB_NAME = "rajpipla_heritage"
const COLLECTIONS = {
  ARTIFACTS: "artifacts",
  GUIDES: "guides",
  BOOKINGS: "bookings",
  VIRTUAL_TOURS: "virtual_tours",
  USERS: "users",
}

// Get database connection
export async function getDb() {
  try {
    const client = await clientPromise
    return client.db(DB_NAME)
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw new Error("Database connection failed")
  }
}

// User services
export async function getUserById(id: string): Promise<IUser | null> {
  try {
    await dbConnect()
    return UserModel.findById(id)
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
  try {
    await dbConnect()
    return UserModel.findOne({ email })
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function createUser(userData: Partial<IUser>): Promise<IUser> {
  try {
    await dbConnect()
    return UserModel.create(userData)
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
  try {
    await dbConnect()
    return UserModel.findByIdAndUpdate(id, updates, { new: true })
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await dbConnect()
    const result = await UserModel.findByIdAndDelete(id)
    return !!result
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

export async function isUserAdmin(id: string): Promise<boolean> {
  try {
    await dbConnect()
    const user = await UserModel.findById(id)
    return user?.role === "admin"
  } catch (error) {
    console.error("Error checking if user is admin:", error)
    return false
  }
}

export async function isUserGuide(id: string): Promise<boolean> {
  try {
    await dbConnect()
    const user = await UserModel.findById(id)
    return user?.role === "guide"
  } catch (error) {
    console.error("Error checking if user is guide:", error)
    return false
  }
}

export async function updateUserRole(
  id: string,
  role: "user" | "admin" | "guide",
  roleId?: string,
): Promise<IUser | null> {
  try {
    await dbConnect()

    const updates: any = { role }

    if (role === "guide" && roleId) {
      updates.guideId = roleId
    } 

    return await UserModel.findByIdAndUpdate(id, updates, { new: true })
  } catch (error) {
    console.error("Error updating user role:", error)
    return null
  }
}

export async function createOrUpdateUser(userData: Partial<IUser>): Promise<IUser | null> {
  try {
    await dbConnect()

    const { id, ...updates } = userData

    // Check if user exists
    let user = await UserModel.findById(id)

    if (user) {
      // Update existing user
      user = await UserModel.findByIdAndUpdate(id, updates, { new: true })
    } else {
      // Create new user
      user = await UserModel.create({ _id: id, ...updates })
    }

    return user
  } catch (error) {
    console.error("Error creating or updating user:", error)
    return null
  }
}

// Artifact services
export async function getArtifacts(
  filters: any = {},
  page = 1,
  limit = 10,
): Promise<{ artifacts: IArtifact[]; pagination: any }> {
  try {
    await dbConnect()

    const query: any = {}

    // Basic filters
    if (filters.era) query.era = filters.era
    if (filters.type) query.type = filters.type
    if (filters.significance) query.significance = filters.significance

    // Search by name or description
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit

    const [artifacts, total] = await Promise.all([
      ArtifactModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      ArtifactModel.countDocuments(query),
    ])

    return {
      artifacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error getting artifacts:", error)
    return { artifacts: [], pagination: { page, limit, total: 0, totalPages: 0 } }
  }
}

export async function getArtifactById(id: string): Promise<IArtifact | null> {
  try {
    await dbConnect()
    return await ArtifactModel.findById(id)
  } catch (error) {
    console.error("Error getting artifact by ID:", error)
    return null
  }
}

export async function createArtifact(artifactData: Partial<IArtifact>): Promise<IArtifact> {
  try {
    await dbConnect()
    return await ArtifactModel.create(artifactData)
  } catch (error) {
    console.error("Error creating artifact:", error)
    throw error
  }
}

export async function updateArtifact(id: string, updates: Partial<IArtifact>): Promise<IArtifact | null> {
  try {
    await dbConnect()
    return ArtifactModel.findByIdAndUpdate(id, updates, { new: true })
  } catch (error) {
    console.error("Error updating artifact:", error)
    return null
  }
}

export async function deleteArtifact(id: string): Promise<boolean> {
  try {
    await dbConnect()
    const result = await ArtifactModel.findByIdAndDelete(id)
    return !!result
  } catch (error) {
    console.error("Error deleting artifact:", error)
    return false
  }
}

// Guide services
export async function getGuides(
  filters: any = {},
  page = 1,
  limit = 10,
): Promise<{ guides: IGuide[]; pagination: any }> {
  try {
    await dbConnect()

    const query: any = {}

    // Filter by expertise
    if (filters.expertise) {
      query.expertise = { $in: Array.isArray(filters.expertise) ? filters.expertise : [filters.expertise] }
    }

    // Filter by language
    if (filters.language) {
      query.languages = { $in: Array.isArray(filters.language) ? filters.language : [filters.language] }
    }

    // Search by name or bio
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { bio: { $regex: filters.search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit

    const [guides, total] = await Promise.all([
      GuideModel.find(query).skip(skip).limit(limit).sort({ rating: -1 }),
      GuideModel.countDocuments(query),
    ])

    return {
      guides,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error getting guides:", error)
    return { guides: [], pagination: { page, limit, total: 0, totalPages: 0 } }
  }
}

export async function getGuideById(id: string): Promise<IGuide | null> {
  try {
    await dbConnect()
    return await GuideModel.findById(id)
  } catch (error) {
    console.error("Error getting guide by ID:", error)
    return null
  }
}

export async function getGuideByUserId(userId: string): Promise<IGuide | null> {
  try {
    
    await dbConnect()
    // get user by user id

    const user = await getUserById(userId)
    // check if user exists
    if (!user) {
      return null
    }

    // check if user is a guide
    if (user.role !== "guide") {
      return null
    }

    // get guide by user id
    const email = user.email
    const guide = await GuideModel.findOne({ "contactInfo.email": email })
    return guide
  } catch (error) {
    console.error("Error getting guide by user ID:", error)
    return null
  }
}

export async function createGuide(guideData: Partial<IGuide>): Promise<IGuide> {
  try {
    await dbConnect()
    console.log("guide created", guideData.name);
    
    return await GuideModel.create(guideData)
  } catch (error) {
    console.error("Error creating guide:", error)
    throw error
  }
}

export async function updateGuide(id: string, updates: Partial<IGuide>): Promise<IGuide | null> {
  try {
    await dbConnect()
    return await GuideModel.findByIdAndUpdate(id, updates, { new: true })
  } catch (error) {
    console.error("Error updating guide:", error)
    return null
  }
}

export async function deleteGuide(id: string): Promise<boolean> {
  try {
    await dbConnect()
    const result = await GuideModel.findByIdAndDelete(id)
    return !!result
  } catch (error) {
    console.error("Error deleting guide:", error)
    return false
  }
}

// Booking services
export async function createBooking(bookingData: Partial<IBooking>): Promise<IBooking> {
  try {
    await dbConnect()

    const booking = await BookingModel.create(bookingData)

    // Update guide availability
    await GuideModel.updateOne(
      {
        _id: booking.guideId,
        "availability.date": booking.date,
        "availability.slots.startTime": booking.startTime,
      },
      {
        $set: {
          "availability.$.slots.$[slot].isBooked": true,
        },
      },
      {
        arrayFilters: [{ "slot.startTime": booking.startTime }],
      },
    )

    return booking
  } catch (error) {
    console.error("Error creating booking:", error)
    throw error
  }
}

export async function getUserBookings(userId: string): Promise<IBooking[]> {
  try {
    await dbConnect()
    return await BookingModel.find({ userId }).sort({ createdAt: -1 })
  } catch (error) {
    console.error("Error getting user bookings:", error)
    return []
  }
}

export async function getGuideBookings(guideId: string): Promise<IBooking[]> {
  try {
    await dbConnect()
    return await BookingModel.find({ guideId }).sort({ createdAt: -1 })
  } catch (error) {
    console.error("Error getting guide bookings:", error)
    return []
  }
}

export async function updateBookingStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled",
): Promise<IBooking | null> {
  try {
    await dbConnect()
    return await BookingModel.findByIdAndUpdate(id, { status }, { new: true })
  } catch (error) {
    console.error("Error updating booking status:", error)
    return null
  }
}

// Virtual Tour services
export async function getVirtualTours(): Promise<IVirtualTour[]> {
  try {
    await dbConnect()
    return await VirtualTourModel.find({})
  } catch (error) {
    console.error("Error getting virtual tours:", error)
    return []
  }
}

export async function getVirtualTourById(id: string): Promise<IVirtualTour | null> {
  try {
    await dbConnect()
    return await VirtualTourModel.findById(id)
  } catch (error) {
    console.error("Error getting virtual tour by ID:", error)
    return null
  }
}

export async function createVirtualTour(tourData: Partial<IVirtualTour>): Promise<IVirtualTour> {
  try {
    await dbConnect()
    return await VirtualTourModel.create(tourData)
  } catch (error) {
    console.error("Error creating virtual tour:", error)
    throw error
  }
}

export async function updateVirtualTour(id: string, updates: Partial<IVirtualTour>): Promise<IVirtualTour | null> {
  try {
    await dbConnect()
    return await VirtualTourModel.findByIdAndUpdate(id, updates, { new: true })
  } catch (error) {
    console.error("Error updating virtual tour:", error)
    return null
  }
}

export async function deleteVirtualTour(id: string): Promise<boolean> {
  try {
    await dbConnect()
    const result = await VirtualTourModel.findByIdAndDelete(id)
    return !!result
  } catch (error) {
    console.error("Error deleting virtual tour:", error)
    return false
  }
}

// Seed data function for development
export async function seedSampleData() {
  try {
    await dbConnect()

    // Check if data already exists
    const [artifactsCount, guidesCount, toursCount] = await Promise.all([
      ArtifactModel.countDocuments(),
      GuideModel.countDocuments(),
      VirtualTourModel.countDocuments(),
    ])

    if (artifactsCount > 0 && guidesCount > 0 && toursCount > 0 ) {
      console.log("Sample data already exists")
      return
    }

    const now = new Date()

    // Create admin user if it doesn't exist
    const adminExists = await UserModel.findOne({ role: "admin" })

    if (!adminExists) {
      await UserModel.create({
        firstName: "Admin",
        lastName: "User",
        email: "admin@rajpipla.com",
        password: "admin123",
        role: "admin",
        createdAt: now,
        updatedAt: now,
      })
      console.log("Admin user created")
    }

    // Sample artifacts
    const artifacts = [
      {
        name: "Royal Throne",
        description:
          "The ornate throne used by the Maharaja of Rajpipla during official ceremonies and court proceedings. Crafted with gold leaf and precious stones, it symbolizes the royal authority and wealth of the princely state.",
        era: "colonial",
        type: "furniture",
        significance: "royal",
        imageUrl: "/placeholder.svg?height=500&width=500",
        highResImageUrl: "/placeholder.svg?height=2000&width=2000",
        pdfGuideUrl: "/sample-guide.pdf",
        storyPoints: [
          {
            title: "Royal Succession",
            description:
              "This throne witnessed the coronation of 14 rulers of the Gohil Rajput dynasty that ruled Rajpipla from 1340 to 1948.",
          },
          {
            title: "British Influence",
            description:
              "During the colonial period, the throne was modified to incorporate European design elements while maintaining traditional Indian craftsmanship.",
          },
        ],
      },
      // Add more artifacts as needed
    ]

    // Sample guides
    const guides = [
      {
        name: "Rajesh Sharma",
        bio: "A historian with over 15 years of experience specializing in the royal history of Rajpipla.",
        expertise: ["Royal History", "Architecture", "Art History"],
        languages: ["English", "Hindi", "Gujarati"],
        imageUrl: "/placeholder.svg?height=300&width=300",
        contactInfo: {
          email: "rajesh@example.com",
          phone: "+91 9876543210",
        },
        availability: generateAvailability(),
        rating: 4.8,
        reviews: [
          {
            userId: new mongoose.Types.ObjectId(),
            userName: "John Doe",
            rating: 5,
            comment: "Rajesh is incredibly knowledgeable about the palace history. Highly recommended!",
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30),
          },
        ],
      },
      // Add more guides as needed
    ]

    // Sample virtual tours
    const virtualTours = [
      {
        name: "Main Palace Exterior",
        description:
          "Explore the magnificent exterior of Rajpipla Palace, featuring a blend of European and Indian architectural styles.",
        location: "Palace Entrance",
        panoramaUrl: "/placeholder.svg?height=2000&width=4000",
        hotspots: [
          {
            id: "hotspot1",
            position: { x: 100, y: 0, z: -200 },
            title: "Main Entrance",
            description: "The grand entrance to the palace, featuring ornate carvings and royal insignia.",
          },
        ],
      },
      // Add more tours as needed
    ]

    // Insert sample data
    if (artifactsCount === 0) {
      await ArtifactModel.insertMany(artifacts)
      console.log("Sample artifacts inserted")
    }

    if (guidesCount === 0) {
      await GuideModel.insertMany(guides)
      console.log("Sample guides inserted")
    }

    if (toursCount === 0) {
      await VirtualTourModel.insertMany(virtualTours)
      console.log("Sample virtual tours inserted")
    }

    console.log("Sample data seeding complete")
  } catch (error) {
    console.error("Error seeding sample data:", error)
    throw error
  }
}

// Helper function to generate availability for guides
function generateAvailability() {
  const availability = []
  const now = new Date()

  for (let i = 1; i <= 30; i++) {
    const date = new Date(now)
    date.setDate(now.getDate() + i)

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue
    }

    availability.push({
      date,
      slots: [
        { startTime: "09:00", endTime: "11:00", isBooked: false },
        { startTime: "11:30", endTime: "13:30", isBooked: false },
        { startTime: "14:00", endTime: "16:00", isBooked: false },
      ],
    })
  }

  return availability
}