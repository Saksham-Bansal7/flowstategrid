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
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Welcome back, {session?.user?.name || session?.user?.email}! 👋
              </p>
            </div>
            <Badge variant="outline" className="text-sm px-4 py-2">
              <Calendar className="size-4 mr-2" />
              {new Date().toLocaleDateString("en-US", { 
                weekday: "long", 
                month: "short", 
                day: "numeric" 
              })}
            </Badge>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Posts */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Posts
                </CardTitle>
                <FileText className="size-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{stats?.totalPosts || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Content shared
                </p>
              </CardContent>
            </Card>

            {/* Total Reactions */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Reactions
                </CardTitle>
                <Heart className="size-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{stats?.totalReactions || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Likes received
                </p>
              </CardContent>
            </Card>

            {/* Total Focus Time */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Focus Time
                </CardTitle>
                <Clock className="size-4 text-green-500" />
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
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Focus
                </CardTitle>
                <Timer className="size-4 text-purple-500" />
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

            {/*Comment */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                <MessageCircle className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalComments || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Comments received
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="size-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Jump into your favorite activities</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3">
                    <Button asChild className="h-20 flex-col gap-2">
                      <Link href="/feed">
                        <FileText className="size-5" />
                        <span>Create Post</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-20 flex-col gap-2">
                      <Link href="/rooms">
                        <Users className="size-5" />
                        <span>Join Room</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-20 flex-col gap-2">
                      <Link href="/feed">
                        <Activity className="size-5" />
                        <span>Browse Feed</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-20 flex-col gap-2">
                      <Link href={`/u/${profile?.username}`}>
                        <Award className="size-5" />
                        <span>My Profile</span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Profile Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Summary</CardTitle>
                    <CardDescription>Your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Name</span>
                        <span className="font-medium">{profile?.name || "Not set"}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Username</span>
                        <span className="font-medium">@{profile?.username || "Not set"}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="font-medium text-sm">{profile?.email}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Email Verified</span>
                        <Badge variant={profile?.emailVerified ? "default" : "secondary"}>
                          {profile?.emailVerified ? "✓ Verified" : "Not Verified"}
                        </Badge>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full mt-4">
                      <Link href="/account">Edit Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                  <CardDescription>Your latest content</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentPosts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No posts yet. Create your first post!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/feed/${post.id}`}
                          className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <p className="text-sm mb-2">{post.content}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="size-3" />
                              {post.reactionsCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="size-3" />
                              {post.commentsCount}
                            </span>
                            <span>
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
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
