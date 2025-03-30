import { seedSampleData } from "./db-service"
import dbConnect from "./mongoose"

export async function seed() {
  try {
    await dbConnect()
    await seedSampleData()
    console.log("Database seeded successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error seeding database:", error)
      process.exit(1)
    })
}