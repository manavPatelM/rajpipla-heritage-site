import mongoose, { type Document, Schema } from "mongoose"

interface Position {
  x: number
  y: number
  z: number
}

export interface Hotspot {
  id: string
  position: Position
  title: string
  description: string
  linkedTourId?: string
}

export interface IVirtualTour extends Document {
  [x: string]: any
  name: string
  description: string
  location: string
  panoramaUrl: string
  hotspots: Hotspot[]
  createdAt: Date
  updatedAt: Date
}

const PositionSchema = new Schema<Position>({
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  z: {
    type: Number,
    required: true,
  },
})

const HotspotSchema = new Schema<Hotspot>({
  id: {
    type: String,
    required: true,
  },
  position: {
    type: PositionSchema,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  linkedTourId: {
    type: Schema.Types.ObjectId,
    ref: "VirtualTour",
  },
})

const VirtualTourSchema = new Schema<IVirtualTour>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    location: {
      type: String,
      required: [true, "Please provide a location"],
    },
    panoramaUrl: {
      type: String,
      required: [true, "Please provide a panorama URL"],
    },
    hotspots: {
      type: [HotspotSchema],
      default: [],
    },
  },
  { timestamps: true },
)

const VirtualTour = mongoose.models.VirtualTour || mongoose.model<IVirtualTour>("VirtualTour", VirtualTourSchema)

export default VirtualTour

