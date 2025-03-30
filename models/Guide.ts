import mongoose, { type Document, Schema } from "mongoose"

interface Slot {
  startTime: string
  endTime: string
  isBooked: boolean
}

interface Availability {
  date: Date
  slots: Slot[]
}

interface Review {
  userId: mongoose.Types.ObjectId
  userName: string
  rating: number
  comment: string
  date: Date
}

export interface IGuide extends Document {
  userId?: mongoose.Types.ObjectId
  name: string
  bio: string
  expertise: string[]
  languages: string[]
  imageUrl: string
  contactInfo: {
    email: string
    phone: string
  }
  availability: Availability[]
  rating: number
  reviews: Review[]
  createdAt: Date
  updatedAt: Date
}

const SlotSchema = new Schema<Slot>({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
})

const AvailabilitySchema = new Schema<Availability>({
  date: {
    type: Date,
    required: true,
  },
  slots: {
    type: [SlotSchema],
    default: [],
  },
})

const ReviewSchema = new Schema<Review>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

const GuideSchema = new Schema<IGuide>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    expertise: {
      type: [String],
      default: [], // Ensure expertise is always an array
    },
    languages: {
      type: [String],
      default: [], // Ensure languages is always an array
    },
    imageUrl: {
      type: String,
      default: "/images/default-guide-avatar.png",
    },
    contactInfo: {
      email: {
        type: String,
        required: [true, "Please provide an email"],
        lowercase: true,
        trim: true,
        // match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
      },
      phone: {
        type: String,
        required: [true, "Please provide a phone number"],
      },
    },
    availability: {
      type: [AvailabilitySchema],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (v: number) => Number(v.toFixed(1)),
    },
    reviews: {
      type: [ReviewSchema],
      default: [], // Ensure reviews are always an array
    },
  },
  { timestamps: true }
);



GuideSchema.pre("save", function (next) {
  console.log("Pre-save hook triggered for Guide model");

  console.log("Expertise before processing:", this.expertise);
  console.log("Languages before processing:", this.languages);
  console.log("Reviews before processing:", this.reviews);

  this.expertise = Array.isArray(this.expertise) ? this.expertise.map(exp => exp.toLowerCase()) : [];
  this.languages = Array.isArray(this.languages) ? this.languages.map(lang => lang.toLowerCase()) : [];
  this.reviews = Array.isArray(this.reviews)
    ? this.reviews.map(review => ({
        ...review,
        userName: review.userName.toLowerCase(),
      }))
    : [];

  if (typeof this.rating === "number") {
    this.rating = Number(this.rating.toFixed(1));
  } else {
    this.rating = 0;
  }

  console.log("Processed Expertise:", this.expertise);
  console.log("Processed Languages:", this.languages);
  console.log("Processed Reviews:", this.reviews);

  next();
});




const Guide = mongoose.models.Guide || mongoose.model<IGuide>("Guide", GuideSchema)

export default Guide