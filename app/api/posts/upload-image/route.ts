// app/api/posts/upload-image/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { uploadToCloudinary } from "@/lib/cloudinary";

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

    // Upload to Cloudinary (different folder for post images)
    const uploadResult = await uploadToCloudinary(image, 'flowstategrid/posts');

    return NextResponse.json({
      message: "Image uploaded successfully",
      image: uploadResult.url,
    });
  } catch (error) {
    console.error("Post image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}