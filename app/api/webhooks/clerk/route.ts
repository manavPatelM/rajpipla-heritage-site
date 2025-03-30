import type { NextRequest } from "next/server"
import { Webhook } from "svix"
import { headers } from "next/headers"
import { createOrUpdateUser, getUserById } from "@/lib/db-service"
import { asyncHandler, successResponse, errorResponse } from "@/lib/api-utils"

export const POST = asyncHandler(async (req: NextRequest) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET")
    return errorResponse("Server misconfigured", "INTERNAL_SERVER_ERROR", 500)
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return errorResponse("Missing svix headers", "BAD_REQUEST", 400)
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return errorResponse("Error verifying webhook", "UNAUTHORIZED", 401)
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data

    const primaryEmail = email_addresses[0]?.email_address

    if (id && primaryEmail) {
      // Check if user already exists to preserve role
      const existingUser = await getUserById(id)
      const role = existingUser?.role || public_metadata?.role || "user"

      await createOrUpdateUser({
        id,
        email: primaryEmail,
        firstName: first_name || "",
        lastName: last_name || "",
        imageUrl: image_url || "",
        role,
        guideId: existingUser?.guideId,
      })
    }
  }

  return successResponse({ received: true })
})

