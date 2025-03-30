import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

// Load and validate secrets
if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are missing! Add them to your .env.local file.");
}

const JWT_ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Generate Access Token
export async function signAccessToken(payload: JwtPayload): Promise<string> {
  const token = await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" }) // Explicitly set JWT type
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(JWT_ACCESS_SECRET);

  // console.log("✅ Generated Access Token:", token);
  return token;
}

// Generate Refresh Token
export async function signRefreshToken(payload: JwtPayload): Promise<string> {
  const token = await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" }) // Explicitly set JWT type
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_REFRESH_SECRET);

  // console.log("✅ Generated Refresh Token:", token);
  return token;
}

// Verify Access Token
export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    if (!token) throw new Error("NO_TOKEN_PROVIDED");

    const { payload } = await jwtVerify(token, JWT_ACCESS_SECRET);
    
    // console.log("✅ Decoded Access Token Payload:", payload);
    // console.log("📅 Access Token Expiry:", new Date(payload.exp! * 1000));

    return payload as unknown as JwtPayload;
  } catch (error: any) {
    console.error("❌ Access Token Verification Failed:", error.message);

    if (error.code === "ERR_JWT_EXPIRED") {
      throw new Error("TOKEN_EXPIRED");
    }
    if (error.code === "ERR_JWS_INVALID") {
      throw new Error("INVALID_TOKEN");
    }

    return null;
  }
}

// Verify Refresh Token
export async function verifyRefreshToken(token: string): Promise<JwtPayload | null> {
  try {
    if (!token) throw new Error("NO_TOKEN_PROVIDED");

    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    
    console.log("✅ Decoded Refresh Token Payload:", payload);
    console.log("📅 Refresh Token Expiry:", new Date(payload.exp! * 1000));

    return payload as unknown as JwtPayload;
  } catch (error: any) {
    console.error("❌ Refresh Token Verification Failed:", error.message);

    return null;
  }
}

// Get Access Token from Cookies
export async function getTokenFromRequest(req: NextRequest): Promise<string | null> {
  const token = (await cookies()).get("access_token")?.value || null;
  // console.log("🍪 Token from Request:", token);
  return token;
}

// Get Refresh Token from Cookies
export function getRefreshTokenFromRequest(req: NextRequest): string | null {
  const token = req.cookies.get("refresh_token")?.value || null;
  // console.log("🍪 Refresh Token from Request:", token);
  return token;
}

// Get User from Access Token
export async function getUserFromToken(req: NextRequest): Promise<JwtPayload | null> {
  const token = await getTokenFromRequest(req);
  if (!token) return null;

  try {
    return await verifyAccessToken(token);
  } catch (error) {
    return null;
  }
}

// Set Token in Cookies
export function setTokenCookies(response: NextResponse, accessToken: string, refreshToken: string): NextResponse {
  console.log("🍪 Setting tokens in cookies...");

  response.cookies.set({
    name: "access_token",
    value: accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 60, // 30 minutes
    path: "/",
  });

  response.cookies.set({
    name: "refresh_token",
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  console.log("✅ Tokens successfully stored in cookies.");
  return response;
}