import type React from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { isUserGuide } from "@/lib/db-service"
import { getTokenFromRequest, verifyAccessToken } from "@/lib/jwt"
import { headers } from "next/headers"
import { NextRequest } from "next/server"
import { errorResponse } from "@/lib/api-utils"

export default async function GuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const req = {
    headers: headersList,
    cookies: {
      get: (name: string) => ({ value: headersList.get(`cookie-${name}`) || null }),
    },
  } as unknown as NextRequest
  const token = await getTokenFromRequest(req)
  // Verify token
  const payload = await verifyAccessToken(token || "")
  if (!payload || typeof payload.userId !== "string") {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
  }
  const { userId } = payload

  if (!userId) {
    redirect("/login?redirect_url=/dashboard/guide")
  }

  const isGuide = await isUserGuide(userId)

  if (!isGuide) {
    redirect("/dashboard")
  }

  return <>{children}</>
}

