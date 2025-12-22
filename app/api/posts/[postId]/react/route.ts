// app/api/posts/[postId]/react/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { addReactionSchema } from "@/lib/validations/post";
import { z } from "zod";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // ✅ Check email verification
    const user = await User.findById(session.user.id).select("emailVerified");
    if (!user?.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before reacting to posts." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = addReactionSchema.parse(body);

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user already reacted
    const existingReactionIndex = post.reactions.findIndex(
      (r) => r.userId === session.user.id
    );

    if (existingReactionIndex !== -1) {
      // Update existing reaction or remove if same type
      if (post.reactions[existingReactionIndex].type === validatedData.type) {
        // Remove reaction (toggle off)
        post.reactions.splice(existingReactionIndex, 1);
      } else {
        // Update reaction type
        post.reactions[existingReactionIndex].type = validatedData.type;
        post.reactions[existingReactionIndex].createdAt = new Date();
      }
    } else {
      // Add new reaction
      post.reactions.push({
        userId: session.user.id,
        type: validatedData.type,
        createdAt: new Date(),
      });
    }

    await post.save();

    return NextResponse.json({
      message: "Reaction updated",
      reactions: post.reactions,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Reaction error:", error);
    return NextResponse.json(
      { error: "Failed to update reaction" },
      { status: 500 }
    );
  }
}