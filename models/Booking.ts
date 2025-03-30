import mongoose, { type Document, Schema } from "mongoose"

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId
  userName: string
  userEmail: string
  guideId: mongoose.Types.ObjectId
  guideName: string
  date: Date
  startTime: string
  endTime: string
  status: "pending" | "confirmed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    guideId: {
      type: Schema.Types.ObjectId,
      ref: "Guide",
      required: true,
    },
    guideName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
)

const Booking = mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema)

export default Booking

