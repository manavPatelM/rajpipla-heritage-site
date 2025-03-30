"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { CardContent } from "@/components/ui/card"

// Available expertise options
const expertiseOptions = [
  { id: "royal-history", label: "Royal History" },
  { id: "architecture", label: "Architecture" },
  { id: "art-history", label: "Art History" },
  { id: "cultural-history", label: "Cultural History" },
  { id: "royal-traditions", label: "Royal Traditions" },
  { id: "regional-history", label: "Regional History" },
]

// Days of the week
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Available language options
const languageOptions = [
  { id: "english", label: "English" },
  { id: "hindi", label: "Hindi" },
  { id: "gujarati", label: "Gujarati" },
  { id: "marathi", label: "Marathi" },
  { id: "french", label: "French" },
]

export default function GuideRegistrationForm() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    expertise: [] as string[],
    languages: [] as string[],
    imageUrl: "",
    phone: "",
    availability: [{ day: "", time: "" }],
    freeSlots: [{ day: "", startTime: "", duration: 30, maxSlots: 1 }],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Removed duplicate declaration of handleExpertiseChange

  const handleLanguageChange = (language: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, language],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        languages: prev.languages.filter((item) => item !== language),
      }))
    }
  }

  const handleImageUploaded = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: url,
    }))
  }

  const handleExpertiseChange = (expertise: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      expertise: checked ? [...prev.expertise, expertise] : prev.expertise.filter((item) => item !== expertise),
    }))
  }

  const handleAvailabilityChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedAvailability = [...prev.availability]
      updatedAvailability[index] = { ...updatedAvailability[index], [field]: value }
      return { ...prev, availability: updatedAvailability }
    })
  }

  const addAvailabilitySlot = () => {
    setFormData((prev) => ({
      ...prev,
      availability: [...prev.availability, { day: "", time: "" }],
    }))
  }

  const removeAvailabilitySlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }))
  }

  const addFreeSlotsSlot = () => {
    setFormData((prev) => ({
      ...prev,
      freeSlots: [...prev.freeSlots, { 
        day: "", 
        startTime: "", 
        duration: 30, 
        maxSlots: 1 
      }],
    }))
  }

  const removeFreeSlotsSlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      freeSlots: prev.freeSlots.filter((_, i) => i !== index),
    }))
  }

  const handleFreeSlotChange = (
    index: number, 
    field: keyof typeof formData.freeSlots[0], 
    value: string | number
  ) => {
    setFormData((prev) => {
      const updatedFreeSlots = [...prev.freeSlots]
      updatedFreeSlots[index] = {
        ...updatedFreeSlots[index],
        [field]: value
      }
      return { ...prev, freeSlots: updatedFreeSlots }
    })
  }

  // Removed duplicate handleSubmit function

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.bio ||
      formData.expertise.length === 0 ||
      formData.languages.length === 0 ||
      !formData.phone
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // First, register the user
      const userResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          imageUrl: formData.imageUrl,
          role: "guide",
        }),
        credentials: "include",
      })

      const userData = await userResponse.json()

      if (!userData.success) {
        throw new Error(userData.error?.message || "Failed to register user")
      }

      // Then, create the guide profile
      const guideResponse = await fetch("/api/guides/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.data.accessToken}`,
        },
        body: JSON.stringify({
          userId: userData.data.user.id,
          name: `${formData.firstName} ${formData.lastName}`,
          bio: formData.bio,
          expertise: formData.expertise,
          languages: formData.languages,
          imageUrl: formData.imageUrl,
          contactInfo: {
            email: formData.email,
            phone: formData.phone,
          },
        }),
      })

      const guideData = await guideResponse.json()

      if (!guideData.success) {
        throw new Error(guideData.error?.message || "Failed to register guide profile")
      }

      toast({
        title: "Success",
        description: "Registered successfully as a guide",
      })

      // Redirect to guide dashboard
      router.push("/dashboard/guide")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Information</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
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
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Guide Profile</h3>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Tell us about your experience and qualifications..."
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Areas of Expertise</Label>
          <div className="grid grid-cols-2 gap-2">
            {expertiseOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`expertise-${option.id}`}
                  checked={formData.expertise.includes(option.label)}
                  onCheckedChange={(checked) => handleExpertiseChange(option.label, checked as boolean)}
                />
                <Label
                  htmlFor={`expertise-${option.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Languages Spoken</Label>
          <div className="grid grid-cols-2 gap-2">
            {languageOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`language-${option.id}`}
                  checked={formData.languages.includes(option.label)}
                  onCheckedChange={(checked) => handleLanguageChange(option.label, checked as boolean)}
                />
                <Label
                  htmlFor={`language-${option.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <ImageUpload
          onImageUploaded={handleImageUploaded}
          defaultImage={formData.imageUrl}
          label="Profile Image"
          folder="guides"
        />

<CardContent className="space-y-6">
          <Label className="text-lg">Availability</Label>
          {formData.availability.map((slot, index) => (
            <div key={index} className="flex space-x-2 items-center">
              <select 
                className="flex-grow p-2 border rounded"
                value={slot.day} 
                onChange={(e) => handleAvailabilityChange(index, "day", e.target.value)}
              >
                <option value="">Select Day</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <Input
                className="flex-grow"
                type="text"
                placeholder="Time (e.g., 10:00 AM - 2:00 PM)"
                value={slot.time}
                onChange={(e) => handleAvailabilityChange(index, "time", e.target.value)}
              />
              <Button variant="outline" onClick={() => removeAvailabilitySlot(index)}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" onClick={addAvailabilitySlot}>Add Availability</Button>
        </CardContent>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+91 9876543210"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full"  disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering as Guide...
          </>
        ) : (
          "Register as Guide"
        )}
      </Button>
    </form>
  )
}

