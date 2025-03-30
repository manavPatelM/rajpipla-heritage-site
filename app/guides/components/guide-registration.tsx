"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

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
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Available language options
const languageOptions = [
  { id: "english", label: "English" },
  { id: "hindi", label: "Hindi" },
  { id: "gujarati", label: "Gujarati" },
  { id: "marathi", label: "Marathi" },
  { id: "french", label: "French" },
]

// Free slot duration options
const freeSlotsOptions = [
  { id: "15min", label: "15 Minutes", duration: 15 },
  { id: "30min", label: "30 Minutes", duration: 30 },
  { id: "45min", label: "45 Minutes", duration: 45 },
  { id: "60min", label: "1 Hour", duration: 60 },
]

export default function GuideRegistration() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    expertise: [] as string[],
    languages: [] as string[],
    imageUrl: "",
    contactInfo: {
      email: "",
      phone: "",
    },
    availability: [] as { day: string; time: string }[],
    freeSlots: [] as { 
      day: string; 
      startTime: string; 
      duration: number;
      maxSlots: number;
    }[],
  })

  // Correctly initialize form with user data using useEffect
  useEffect(() => {
    if (isLoaded && user) {
      setFormData((prev) => ({
        ...prev,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        contactInfo: {
          ...prev.contactInfo,
          email: user.primaryEmailAddress?.emailAddress || "",
        },
      }))
    }
  }, [isLoaded, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith("contactInfo.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleExpertiseChange = (expertise: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      expertise: checked ? [...prev.expertise, expertise] : prev.expertise.filter((item) => item !== expertise),
    }))
  }

  const handleLanguageChange = (language: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      languages: checked ? [...prev.languages, language] : prev.languages.filter((item) => item !== language),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoaded || !user) {
      toast({
        title: "Error",
        description: "You must be signed in to register as a guide.",
        variant: "destructive",
      })
      return
    }

    // Validate form
    if (
      !formData.name ||
      !formData.bio ||
      formData.expertise.length === 0 ||
      formData.languages.length === 0 ||
      !formData.contactInfo.phone
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Validate free slots
    const invalidFreeSlots = formData.freeSlots.some(
      slot => !slot.day || !slot.startTime || slot.maxSlots < 1
    )
    if (invalidFreeSlots) {
      toast({
        title: "Invalid Free Slots",
        description: "Please ensure all free slots have a day, start time, and at least one available slot.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/guides/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to register as guide")
      }

      toast({
        title: "Registration Successful",
        description: "Your guide registration has been submitted. You will be notified once approved.",
      })

      // Redirect to dashboard
      router.push("/dashboard/guide")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Guide Registration</CardTitle>
          <CardDescription>You need to be signed in to register as a guide.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guide Registration</CardTitle>
        <CardDescription>Share your expertise and become a guide at Rajpipla Palace</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about your experience and qualifications..."
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Areas of Expertise</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Profile Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/your-image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Provide a URL to your professional photo. If left blank, we'll use your profile picture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactInfo.email">Email</Label>
              <Input
                id="contactInfo.email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleChange}
                type="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo.phone">Phone Number</Label>
              <Input
                id="contactInfo.phone"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                required
              />
            </div>
          </div>
        </CardContent>

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

        <CardContent className="space-y-6">
          <Label className="text-lg font-semibold">Free Consultation Slots</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Offer free consultation slots to potential clients. These are short, complimentary sessions 
            to help clients get to know you.
          </p>

          {formData.freeSlots.map((slot, index) => (
            <div key={index} className="flex space-x-2 items-center mb-2">
              <select 
                className="flex-grow p-2 border rounded"
                value={slot.day} 
                onChange={(e) => handleFreeSlotChange(index, "day", e.target.value)}
              >
                <option value="">Select Day</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              
              <Input
                type="time"
                placeholder="Start Time"
                value={slot.startTime}
                onChange={(e) => handleFreeSlotChange(index, "startTime", e.target.value)}
                className="flex-grow"
              />
              
              <select
                value={slot.duration}
                onChange={(e) => handleFreeSlotChange(index, "duration", Number(e.target.value))}
                className="flex-grow p-2 border rounded"
              >
                {freeSlotsOptions.map((option) => (
                  <option key={option.id} value={option.duration}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <Input
                type="number"
                placeholder="Max Slots"
                value={slot.maxSlots}
                onChange={(e) => handleFreeSlotChange(index, "maxSlots", Number(e.target.value))}
                min="1"
                max="10"
                className="w-24"
              />
              
              <Button 
                variant="outline" 
                onClick={() => removeFreeSlotsSlot(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            onClick={addFreeSlotsSlot}
            className="w-full"
          >
            Add Free Consultation Slot
          </Button>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}