// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { generateVerificationToken, getVerificationTokenExpiry, sendVerificationEmail } from "@/lib/email";
import { signupSchema } from "@/lib/validations/auth";
import { z } from "zod";
import { isUsernameAvailable } from "@/lib/username-generator";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input with Zod
    const validatedData = signupSchema.parse(body);
    const { name, email, password, username } = validatedData;

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if username is available
    const usernameAvailable = await isUsernameAvailable(username);
    if (!usernameAvailable) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = getVerificationTokenExpiry();

    const user = await User.create({
      name: name || email.split("@")[0],
      email,
      username: username.toLowerCase(),
      password: hashedPassword,
      emailVerified: null,
      verificationToken,
      verificationTokenExpiry,
    });

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      {
        message: "User created successfully. Please check your email to verify your account.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}