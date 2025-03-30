import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Standard success response
export function successResponse<T>(data: T, pagination?: ApiResponse["pagination"]): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
  }

  if (pagination) {
    response.pagination = pagination
  }

  return NextResponse.json(response)
}

// Standard error response
export function errorResponse(
  message: string,
  code = "INTERNAL_SERVER_ERROR",
  status = 500,
  details?: any,
): NextResponse {
  console.error(`API Error: ${code} - ${message}`, details)

  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  }

  return NextResponse.json(response, { status })
}

// Async handler wrapper for consistent error handling
export const asyncHandler = (fn: (req: NextRequest, context: any) => Promise<NextResponse>) =>
  async (req: NextRequest, context: any): Promise<NextResponse> => {
    try {
      return await fn(req, context)
    } catch (error: any) {
      console.error("API Error:", error)

      // Handle known error types
      if (error.name === "ValidationError") {
        return errorResponse("Validation failed", "VALIDATION_ERROR", 400, error.errors)
      }

      // Handle MongoDB duplicate entry errors
      if (error.code === 11000) {
        return errorResponse("Duplicate entry", "DUPLICATE_ERROR", 409)
      }

      return errorResponse(error.message || "Something went wrong", "INTERNAL_SERVER_ERROR", 500)
    }
  }