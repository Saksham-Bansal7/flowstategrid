// app/api/users/[username]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Post } from "@/models/Post";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    
    await connectDB();

    const user = await User.findOne({ username: username })
      .select("_id name username email image bio location createdAt")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's posts
    const posts = await Post.find({ userId: user._id.toString() })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const postsWithStats = posts.map((post) => ({
      id: post._id.toString(),
      content: post.content,
      images: post.images,
      tags: post.tags,
      reactionsCount: post.reactions?.length || 0,
      commentsCount: post.comments?.length || 0,
      viewCount: post.viewCount,
      createdAt: post.createdAt,
    }));

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        image: user.image,
        bio: user.bio,
        location: user.location,
        createdAt: user.createdAt,
      },
      posts: postsWithStats,
      stats: {
        totalPosts: postsWithStats.length,
        totalReactions: postsWithStats.reduce(
          (sum, p) => sum + p.reactionsCount,
          0
        ),
      },
    });
  } catch (error) {
    console.error("Public profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
