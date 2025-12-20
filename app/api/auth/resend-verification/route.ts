// app/api/auth/resend-verification/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { generateVerificationToken, getVerificationTokenExpiry, sendVerificationEmail } from "@/lib/email";
import { resendVerificationSchema } from "@/lib/validations/auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input with Zod
    const validatedData = resendVerificationSchema.parse(body);
    const { email } = validatedData;

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = getVerificationTokenExpiry();

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}