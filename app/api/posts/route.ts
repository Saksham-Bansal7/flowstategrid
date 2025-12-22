// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { createPostSchema } from "@/lib/validations/post";
import { z } from "zod";

// GET: Fetch all posts with filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "newest";
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");
    const search = searchParams.get("search") || "";

    await connectDB();

    let sortQuery: any = {};
    let matchQuery: any = {};

    // Add search filter for tags
    if (search.trim()) {
      matchQuery.tags = {
        $elemMatch: {
          $regex: search.trim(),
          $options: "i", // case-insensitive
        },
      };
    }

    switch (sortBy) {
      case "newest":
        sortQuery = { createdAt: -1 };
        break;
      case "mostLiked":
        sortQuery = { reactionsCount: -1, createdAt: -1 };
        break;
      case "trending":
        // Trending: most reactions in the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        matchQuery["reactions.createdAt"] = { $gte: oneDayAgo };
        sortQuery = { trendingScore: -1, createdAt: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const posts = await Post.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          reactionsCount: { $size: "$reactions" },
          commentsCount: { $size: "$comments" },
          trendingScore: {
            $size: {
              $filter: {
                input: "$reactions",
                cond: {
                  $gte: [
                    "$$this.createdAt",
                    new Date(Date.now() - 24 * 60 * 60 * 1000),
                  ],
                },
              },
            },
          },
        },
      },
      { $sort: sortQuery },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Populate user details
    const userIds = [...new Set(posts.map((p) => p.userId))];
    const users = await User.find({ _id: { $in: userIds } })
      .select("_id name username image")
      .lean();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const postsWithUsers = posts.map((post) => {
      const user = userMap.get(post.userId);
      return {
        ...post,
        user: user
          ? {
              id: user._id.toString(),
              name: user.name,
              username: user.username,
              image: user.image,
            }
          : null,
      };
    });

    return NextResponse.json({
      posts: postsWithUsers,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST: Create a new post
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createPostSchema.parse(body);

    await connectDB();

    // Get user's username and check email verification
    const user = await User.findById(session.user.id).select("username emailVerified");
    if (!user || !user.username) {
      return NextResponse.json(
        { error: "Username not found. Please set a username in your profile." },
        { status: 400 }
      );
    }

    // ✅ Check email verification
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before creating posts." },
        { status: 403 }
      );
    }

    const post = await Post.create({
      userId: session.user.id,
      username: user.username,
      content: validatedData.content,
      images: validatedData.images || [],
      tags: validatedData.tags || [],
      reactions: [],
      comments: [],
      viewCount: 0,
    });

    return NextResponse.json(
      {
        message: "Post created successfully",
        post: {
          id: post._id.toString(),
          userId: post.userId,
          username: post.username,
          content: post.content,
          images: post.images,
          tags: post.tags,
          reactions: post.reactions,
          comments: post.comments,
          viewCount: post.viewCount,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
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
    console.error("Post creation error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}