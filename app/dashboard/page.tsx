// app/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { useUserProfile } from "@/hooks/use-user-profile";
import {
  FileText,
  Heart,
  Clock,
  Timer,
  TrendingUp,
  Users,
  MessageCircle,
  Calendar,
  Target,
  Zap,
  Award,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data: dashboardData, isLoading } = useDashboardStats();
  const { data: profile } = useUserProfile();

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  if (status === "loading" || isLoading) {
    return <DashboardSkeleton />;
  }

  const stats = dashboardData?.stats;
  const recentPosts = dashboardData?.recentPosts || [];

  // Calculate focus time in hours and minutes
  const totalHours = Math.floor((stats?.totalFocusTime || 0) / 60);
  const totalMinutes = (stats?.totalFocusTime || 0) % 60;
  const todayHours = Math.floor((stats?.todayFocusTime || 0) / 60);
  const todayMinutes = (stats?.todayFocusTime || 0) % 60;

  // Calculate engagement rate
  const engagementRate = stats?.totalPosts
    ? Math.round(((stats.totalReactions + stats.totalComments) / stats.totalPosts) * 10) / 10
    : 0;

  // Calculate today's progress (goal: 2 hours = 120 minutes)
  const todayGoal = 120; // 2 hours
  const todayProgress = Math.min((stats?.todayFocusTime || 0) / todayGoal * 100, 100);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Welcome back, <span className="font-medium text-foreground">{session?.user?.name || session?.user?.email}</span>! 👋
              </p>
            </div>
            <Badge variant="outline" className="text-sm px-4 py-2 w-fit">
              <Calendar className="size-4 mr-2" />
              {new Date().toLocaleDateString("en-US", { 
                weekday: "long", 
                month: "short", 
                day: "numeric" 
              })}
            </Badge>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            {/* Total Posts */}
            <Card className="border-l-4 border-l-blue-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-linear-to-br from-card to-blue-500/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Posts
                </CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <FileText className="size-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{stats?.totalPosts || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Content shared
                </p>
              </CardContent>
            </Card>

            {/* Total Reactions */}
            <Card className="border-l-4 border-l-red-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-linear-to-br from-card to-red-500/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Reactions
                </CardTitle>
                <div className="p-2 bg-red-500/10 rounded-full">
                  <Heart className="size-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{stats?.totalReactions || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Likes received
                </p>
              </CardContent>
            </Card>

            {/* Total Focus Time */}
            <Card className="border-l-4 border-l-green-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-linear-to-br from-card to-green-500/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Focus Time
                </CardTitle>
                <div className="p-2 bg-green-500/10 rounded-full">
                  <Clock className="size-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {totalHours}h {totalMinutes}m
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  In study rooms
                </p>
              </CardContent>
            </Card>

            {/* Today's Focus */}
            <Card className="border-l-4 border-l-purple-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-linear-to-br from-card to-purple-500/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Focus
                </CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <Timer className="size-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">
                  {todayHours}h {todayMinutes}m
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Focus time today
                </p>
              </CardContent>
            </Card>

            {/* Total Comments */}
            <Card className="border-l-4 border-l-primary hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-linear-to-br from-card to-primary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Comments
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-full">
                  <MessageCircle className="size-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats?.totalComments || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Comments received
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="overview" className="text-sm md:text-base">Overview</TabsTrigger>
              <TabsTrigger value="activity" className="text-sm md:text-base">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Zap className="size-5 text-primary" />
                      </div>
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Jump into your favorite activities</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 md:gap-4">
                    <Button asChild className="h-24 flex-col gap-2 group hover:scale-105 transition-transform">
                      <Link href="/feed">
                        <FileText className="size-6 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Create Post</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-24 flex-col gap-2 group hover:scale-105 transition-transform hover:border-primary hover:bg-primary/5">
                      <Link href="/rooms">
                        <Users className="size-6 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Join Room</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-24 flex-col gap-2 group hover:scale-105 transition-transform hover:border-primary hover:bg-primary/5">
                      <Link href="/feed">
                        <Activity className="size-6 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Browse Feed</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-24 flex-col gap-2 group hover:scale-105 transition-transform hover:border-primary hover:bg-primary/5">
                      <Link href={`/u/${profile?.username}`}>
                        <Award className="size-6 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">My Profile</span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Profile Summary */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">Profile Summary</CardTitle>
                    <CardDescription>Your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <span className="text-sm font-medium text-muted-foreground">Name</span>
                        <span className="font-semibold">{profile?.name || "Not set"}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <span className="text-sm font-medium text-muted-foreground">Username</span>
                        <span className="font-semibold">@{profile?.username || "Not set"}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <span className="text-sm font-medium text-muted-foreground">Email</span>
                        <span className="font-semibold text-sm truncate max-w-50">{profile?.email}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <span className="text-sm font-medium text-muted-foreground">Email Verified</span>
                        <Badge variant={profile?.emailVerified ? "default" : "secondary"} className="shadow-sm">
                          {profile?.emailVerified ? "✓ Verified" : "Not Verified"}
                        </Badge>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full mt-4 hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Link href="/account">Edit Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6 mt-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Posts</CardTitle>
                  <CardDescription>Your latest content</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="size-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground font-medium">No posts yet.</p>
                      <p className="text-sm text-muted-foreground mt-1">Create your first post to get started!</p>
                      <Button asChild className="mt-6">
                        <Link href="/feed">Create Post</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/feed/${post.id}`}
                          className="block p-4 rounded-xl border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:shadow-md"
                        >
                          <p className="text-sm font-medium mb-3 line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-6 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Heart className="size-3.5 text-red-500" />
                              {post.reactionsCount}
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <MessageCircle className="size-3.5 text-primary" />
                              {post.commentsCount}
                            </span>
                            <span className="ml-auto">
                              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    </div>
  );
}