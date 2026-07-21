// app/api/auth/verify-email/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");


    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const allUsersWithToken = await User.findOne({ verificationToken: token });
    
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }, // Token not expired
    });

    if (!user) {
      // More detailed error
      if (allUsersWithToken) {
        return NextResponse.json(
          { error: "Verification token has expired. Please request a new one." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Invalid verification token. Please check your email for the correct link." },
        { status: 400 }
      );
    }

    // Mark email as verified
    user.emailVerified = new Date();
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    console.log("✅ Email verified successfully for:", user.email);

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/auth/verify-success", req.url)
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}