// app/api/user/stats/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { Room } from "@/models/Room";
import { FocusSession } from "@/models/FocusSession";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get total posts created by user
    const totalPosts = await Post.countDocuments({ userId: session.user.id });

    // Get total reactions received on user's posts
    const posts = await Post.find({ userId: session.user.id }).lean();
    const totalReactions = posts.reduce((sum, post) => sum + (post.reactions?.length || 0), 0);

    // Get total comments on user's posts
    const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);

    // Calculate total focus time from focus sessions
    const allSessions = await FocusSession.find({
      userId: session.user.id,
      isActive: false, // Only count completed sessions
    }).lean();

    const totalFocusTime = allSessions.reduce(
      (sum, session) => sum + (session.duration || 0),
      0
    );

    // Calculate today's focus time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = await FocusSession.find({
      userId: session.user.id,
      isActive: false,
      startTime: { $gte: today },
    }).lean();

    const todayFocusTime = todaySessions.reduce(
      (sum, session) => sum + (session.duration || 0),
      0
    );

    // Get recent posts (last 5)
    const recentPosts = await Post.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentPostsData = recentPosts.map((post) => ({
      id: post._id.toString(),
      content: post.content.substring(0, 100) + (post.content.length > 100 ? "..." : ""),
      reactionsCount: post.reactions?.length || 0,
      commentsCount: post.comments?.length || 0,
      createdAt: post.createdAt,
    }));

    // Get active rooms count
    const activeRooms = await Room.countDocuments({
      endTime: null,
    });

    return NextResponse.json({
      stats: {
        totalPosts,
        totalReactions,
        totalComments,
        totalFocusTime, // in minutes
        todayFocusTime, // in minutes
        activeRooms,
      },
      recentPosts: recentPostsData,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}