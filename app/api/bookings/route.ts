import type { NextRequest } from "next/server";
import { asyncHandler, successResponse, errorResponse } from "@/lib/api-utils";
import { createBooking, getGuideById, getUserBookings } from "@/lib/db-service";
import { sendBookingConfirmation } from "@/lib/email-service";
import { ObjectId } from "mongodb";
import { Booking, Guide } from "@/lib/models";
import { getTokenFromRequest, verifyAccessToken } from "@/lib/jwt";

export const GET = asyncHandler(async (req: NextRequest) => {
  const token = await getTokenFromRequest(req)
  // Verify token
  const payload = await verifyAccessToken(token || "")
  if (!payload || typeof payload.userId !== "string") {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
  }
  const { userId } = payload;

  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const bookings = await getUserBookings(userId);
  return successResponse(bookings);
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const token = await getTokenFromRequest(req)
  // Verify token
  const payload = await verifyAccessToken(token || "")
  if (!payload || typeof payload.userId !== "string") {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401)
  }
  const { userId } = payload;

  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const { guideId, date, startTime, endTime, userName, userEmail } = await req.json();

  if (!guideId || !date || !startTime || !endTime || !userName || !userEmail) {
    return errorResponse("Missing required fields", "BAD_REQUEST", 400);
  }

  // Validate guide exists
  const guide = await getGuideById(guideId);
  if (!guide) {
    return errorResponse("Guide not found", "NOT_FOUND", 404);
  }

  // Create booking object
  const booking = {
    userId: new ObjectId(userId),
    userName,
    userEmail,
    guideId,
    guideName: guide.name,
    date: new Date(date),
    startTime,
    endTime,
    status: "confirmed",
  };

  // Store booking in database
  await createBooking(booking as any);

  // Send confirmation email
  await sendBookingConfirmation(booking as unknown as Booking, guide as unknown as Guide);

  return successResponse(booking);
});
