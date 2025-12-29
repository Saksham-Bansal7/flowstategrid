// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { generatePasswordResetToken, getPasswordResetTokenExpiry, sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = forgotPasswordSchema.parse(body);
    const { email } = validatedData;

    await connectDB();

    const user = await User.findOne({ email });

    // Don't reveal if user exists or not for security
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Check if user has a password (not OAuth user)
    if (!user.password) {
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();
    const resetTokenExpiry = getPasswordResetTokenExpiry();

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = resetTokenExpiry;
    await user.save();

    console.log('🔑 Password reset token generated for:', email);

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}