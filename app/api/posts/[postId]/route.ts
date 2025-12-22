// app/api/posts/[postId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { User } from "@/models/User";

// GET: Fetch a single post
export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    
    await connectDB();

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    // Get user details
    const user = await User.findById(post.userId)
      .select("_id name username image bio")
      .lean();

    // Get comment authors
    const commentUserIds = [...new Set(post.comments.map((c) => c.userId))];
    const commentUsers = await User.find({ _id: { $in: commentUserIds } })
      .select("_id name username image")
      .lean();

    const userMap = new Map(
      commentUsers.map((u) => [u._id.toString(), u])
    );

    const commentsWithUsers = post.comments.map((comment) => {
      const commentUser = userMap.get(comment.userId);
      return {
        _id: comment._id.toString(),
        userId: comment.userId,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: commentUser
          ? {
              id: commentUser._id.toString(),
              name: commentUser.name,
              username: commentUser.username,
              image: commentUser.image,
            }
          : null,
      };
    });

    return NextResponse.json({
      post: {
        id: post._id.toString(),
        userId: post.userId,
        username: post.username,
        content: post.content,
        images: post.images,
        tags: post.tags,
        reactions: post.reactions,
        comments: commentsWithUsers,
        viewCount: post.viewCount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: user
          ? {
              id: user._id.toString(),
              name: user.name,
              username: user.username,
              image: user.image,
              bio: user.bio,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Post fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a post
export async function DELETE(
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

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user owns the post
    if (post.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Post.findByIdAndDelete(postId);

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Post deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}