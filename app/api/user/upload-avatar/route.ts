// app/api/user/upload-avatar/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Validate base64 image
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get current user to check if they have an existing image
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upload new image to Cloudinary
    const uploadResult = await uploadToCloudinary(image);

    // Delete old image from Cloudinary if it exists and is a Cloudinary URL
    if (currentUser.image?.includes('cloudinary.com')) {
      // Extract public_id from URL
      const urlParts = currentUser.image.split('/');
      const publicIdWithExt = urlParts.slice(-2).join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ''); // Remove extension
      await deleteFromCloudinary(publicId);
    }

    // Update user with new image URL
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { image: uploadResult.url },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Profile picture updated successfully",
      image: uploadResult.url,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        image: updatedUser.image,
        bio: updatedUser.bio,
        location: updatedUser.location,
      },
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}