import { redirect } from "next/navigation"
import { isUserGuide } from "@/lib/db-service"
import GuideRegistration from "../components/guide-registration"
import { errorResponse } from "@/lib/api-utils"
import { getTokenFromRequest, verifyAccessToken } from "@/lib/jwt"
import { NextRequest } from "next/server"

export default async function GuideRegistrationPage({ req }: { req: NextRequest }) {
  const token = await getTokenFromRequest(req)
  // Verify token
  const payload = await verifyAccessToken(token || "")
  if (!payload || typeof payload.userId !== "string") {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
  }
  const { userId } = payload

  if (!userId) {
    redirect("/login")
  }

  // Check if user is already a guide
  const isGuide = await isUserGuide(userId)

  if (isGuide) {
    redirect("/dashboard/guide")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Become a Guide</h1>
      <GuideRegistration />
    </div>
  )
}

