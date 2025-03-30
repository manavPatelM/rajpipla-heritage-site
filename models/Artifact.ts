import mongoose, { type Document, Schema } from "mongoose"

export interface StoryPoint {
  title: string
  description: string
}

export interface IArtifact extends Document {
  name: string
  description: string
  era: string
  type: string
  significance: string
  imageUrl: string
  highResImageUrl: string
  pdfGuideUrl?: string
  storyPoints: StoryPoint[]
  createdAt: Date
  updatedAt: Date
}

const StoryPointSchema = new Schema<StoryPoint>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})

const ArtifactSchema = new Schema<IArtifact>(
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
    era: {
      type: String,
      required: [true, "Please provide an era"],
      enum: ["ancient", "colonial", "modern"],
    },
    type: {
      type: String,
      required: [true, "Please provide a type"],
      enum: ["painting", "sculpture", "jewelry", "furniture", "weapon", "textile", "manuscript"],
    },
    significance: {
      type: String,
      required: [true, "Please provide a significance"],
      enum: ["royal", "cultural", "historical", "religious"],
    },
    imageUrl: {
      type: String,
      required: [true, "Please provide an image URL"],
    },
    highResImageUrl: {
      type: String,
    },
    pdfGuideUrl: {
      type: String,
    },
    storyPoints: {
      type: [StoryPointSchema],
      default: [],
    },
  },
  { timestamps: true },
)

const Artifact = mongoose.models.Artifact || mongoose.model<IArtifact>("Artifact", ArtifactSchema)

export default Artifact

