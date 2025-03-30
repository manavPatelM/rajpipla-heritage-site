import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { signAccessToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongoose";
import UserModel from "@/models/User";

const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key");

export const GET = async (req: NextRequest) => {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const refreshToken = (await cookieStore).get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: { message: "No refresh token", code: "NO_REFRESH_TOKEN" } },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
      decoded = payload;
    } catch (error) {
      console.error("Refresh Token Error:", error);
      return NextResponse.json(
        { success: false, error: { message: "Invalid or expired refresh token", code: "INVALID_REFRESH" } },
        { status: 401 }
      );
    }

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "User not found", code: "USER_NOT_FOUND" } },
        { status: 404 }
      );
    }

    const newAccessToken = await signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set new accessToken cookie
    const response = NextResponse.json({ success: true, accessToken: newAccessToken });
    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 900, // 15 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Unexpected Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Something went wrong", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
};