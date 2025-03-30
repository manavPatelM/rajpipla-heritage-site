"use client"

import { useState } from "react"
import type { Guide } from "@/lib/models"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "@/hooks/use-toast"

export default function BookingForm({
  guide,
  userId,
}: {
  guide: Guide
  userId: string
}) {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>(undefined)

  // Get available dates from guide availability
  const availableDates = guide.availability.map((a) => new Date(a.date))

  // Get available slots for selected date
  const availableSlots = selectedDate
    ? guide.availability
        .find((a) => format(new Date(a.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
        ?.slots.filter((slot) => !slot.isBooked)
    : []

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !user) return

    setIsLoading(true)

    try {
      const selectedSlotObj = availableSlots?.find((slot) => `${slot.startTime}-${slot.endTime}` === selectedSlot)

      if (!selectedSlotObj) {
        throw new Error("Selected slot not found")
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guideId: guide._id,
          date: selectedDate.toISOString(),
          startTime: selectedSlotObj.startTime,
          endTime: selectedSlotObj.endTime,
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.primaryEmailAddress?.emailAddress,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to book guide")
      }

      toast({
        title: "Booking Confirmed",
        description: `Your booking with ${guide.name} has been confirmed. Check your email for details.`,
      })

      setIsOpen(false)
      setSelectedDate(undefined)
      setSelectedSlot(undefined)
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Book Guide</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book a Tour with {guide.name}</DialogTitle>
          <DialogDescription>Select a date and time slot for your guided tour of Rajpipla Palace.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Select Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                // Disable dates that are not in the guide's availability
                return !availableDates.some(
                  (availableDate) => format(availableDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
                )
              }}
              className="rounded-md border"
            />
          </div>

          {selectedDate && availableSlots && availableSlots.length > 0 ? (
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Select Time Slot</h3>
              <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={`${slot.startTime}-${slot.endTime}`} value={`${slot.startTime}-${slot.endTime}`}>
                      {slot.startTime} - {slot.endTime}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : selectedDate ? (
            <div className="text-center py-4 text-muted-foreground">No available slots for the selected date.</div>
          ) : null}
        </div>

        <DialogFooter>
          <Button onClick={handleBooking} disabled={!selectedDate || !selectedSlot || isLoading}>
            {isLoading ? "Booking..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

