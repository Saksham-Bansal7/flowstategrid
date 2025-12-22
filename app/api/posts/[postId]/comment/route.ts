// app/api/posts/[postId]/comment/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { addCommentSchema } from "@/lib/validations/post";
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

    const body = await req.json();
    const validatedData = addCommentSchema.parse(body);

    await connectDB();

    // ✅ Check email verification
    const user = await User.findById(session.user.id)
      .select("_id name username image emailVerified")
      .lean();
      
    if (!user?.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before commenting on posts." },
        { status: 403 }
      );
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Add comment
    post.comments.push({
      userId: session.user.id,
      content: validatedData.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    await post.save();

    const newComment = post.comments[post.comments.length - 1];

    return NextResponse.json({
      message: "Comment added",
      comment: {
        _id: newComment._id.toString(),
        userId: newComment.userId,
        content: newComment.content,
        createdAt: newComment.createdAt,
        updatedAt: newComment.updatedAt,
        user: user
          ? {
              id: user._id.toString(),
              name: user.name,
              username: user.username,
              image: user.image,
            }
          : null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Comment error:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}