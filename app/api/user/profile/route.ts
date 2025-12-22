// app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Post } from "@/models/Post"; // Add this import
import { updateProfileSchema } from "@/lib/validations/auth";
import { isUsernameAvailable } from "@/lib/username-generator";
import { z } from "zod";

// GET: Fetch user profile
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).select("-password").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      username: user.username,
      image: user.image,
      bio: user.bio,
      location: user.location,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT: Update user profile
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate input with Zod
    const validatedData = updateProfileSchema.parse(body);
    const { name, username, bio, location } = validatedData;

    await connectDB();

    // Check if username is being changed and if it's available
    let usernameChanged = false;
    if (username) {
      const currentUser = await User.findById(session.user.id);
      if (currentUser && currentUser.username !== username.toLowerCase()) {
        const available = await isUsernameAvailable(username);
        if (!available) {
          return NextResponse.json(
            { error: "Username is already taken" },
            { status: 400 }
          );
        }
        usernameChanged = true;
      }
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { 
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username: username.toLowerCase() }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update username in all user's posts if username changed
    if (usernameChanged && username) {
      await Post.updateMany(
        { userId: session.user.id },
        { $set: { username: username.toLowerCase() } }
      );
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      username: user.username,
      image: user.image,
      bio: user.bio,
      location: user.location,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}