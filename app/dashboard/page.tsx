// app/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Users,
  MessageCircle,
  Calendar,
  Zap,
  Award,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MotionBlock, MotionCard, MotionMain } from "@/components/motion-shell";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

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

  const dashboardStats = [
    {
      title: "Total Posts",
      value: String(stats?.totalPosts || 0),
      caption: "Content shared",
      icon: FileText,
      tone: "blue",
      progress: 40,
    },
    {
      title: "Total Reactions",
      value: String(stats?.totalReactions || 0),
      caption: "Likes received",
      icon: Heart,
      tone: "rose",
      progress: 40,
    },
    {
      title: "Total Focus Time",
      value: `${totalHours}h ${totalMinutes}m`,
      caption: "In study rooms",
      icon: Clock,
      tone: "emerald",
      progress: 40,
    },
    {
      title: "Today's Focus",
      value: `${todayHours}h ${todayMinutes}m`,
      caption: "Focus time today",
      icon: Timer,
      tone: "violet",
      progress: 40,
    },
    {
      title: "Total Comments",
      value: String(stats?.totalComments || 0),
      caption: "Comments received",
      icon: MessageCircle,
      tone: "slate",
      progress: 40,
    },
  ];

  return (
    <MotionMain className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-8">
          {/* Header */}
          <MotionBlock className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
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
          </MotionBlock>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
            {dashboardStats.map((item) => (
              <DashboardStatCard key={item.title} {...item} />
            ))}
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
                <MotionCard>
                <Card className="soft-card h-full">
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
                </MotionCard>

                {/* Profile Summary */}
                <MotionCard>
                <Card className="soft-card h-full">
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
                </MotionCard>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6 mt-6">
              <MotionBlock>
              <Card className="soft-card">
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
              </MotionBlock>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MotionMain>
  );
}

function DashboardStatCard({
  title,
  value,
  caption,
  icon: Icon,
  tone,
  progress,
}: {
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone: string;
  progress: number;
}) {
  const toneClass =
    {
      blue: {
        card: "from-blue-500/12 via-card to-card",
        icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        value: "text-blue-600 dark:text-blue-400",
        rail: "bg-blue-500/10",
        bar: "bg-blue-500/55",
      },
      rose: {
        card: "from-rose-500/12 via-card to-card",
        icon: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
        value: "text-rose-600 dark:text-rose-400",
        rail: "bg-rose-500/10",
        bar: "bg-rose-500/55",
      },
      emerald:
        {
          card: "from-emerald-500/12 via-card to-card",
          icon: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
          value: "text-emerald-600 dark:text-emerald-400",
          rail: "bg-emerald-500/10",
          bar: "bg-emerald-500/55",
        },
      violet:
        {
          card: "from-violet-500/12 via-card to-card",
          icon: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
          value: "text-violet-600 dark:text-violet-400",
          rail: "bg-violet-500/10",
          bar: "bg-violet-500/55",
        },
      slate:
        {
          card: "from-slate-500/10 via-card to-card",
          icon: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
          value: "text-slate-600 dark:text-slate-300",
          rail: "bg-slate-500/10",
          bar: "bg-slate-500/55",
        },
    }[tone] || {
      card: "from-primary/10 via-card to-card",
      icon: "bg-primary/10 text-primary",
      value: "text-primary",
      rail: "bg-primary/10",
      bar: "bg-primary/55",
    };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.015 }}
      className="h-full"
    >
      <Card
        className={`group relative h-full min-h-[210px] overflow-hidden rounded-lg border-border/80 bg-linear-to-br ${toneClass.card} shadow-sm transition-shadow hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/25`}
      >
        <motion.div
          aria-hidden
          className="absolute -right-12 -top-12 size-32 rounded-full bg-current/5 blur-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.12 }}
        />
        <CardContent className="relative flex h-full min-h-[210px] flex-col justify-between p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 pt-1">
              <p className="text-base font-semibold text-muted-foreground">
                {title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{caption}</p>
            </div>
            <motion.div
              whileHover={{ rotate: -6, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 340, damping: 18 }}
              className={`grid size-14 shrink-0 place-items-center rounded-full ${toneClass.icon}`}
            >
              <Icon className="size-6" />
            </motion.div>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12 }}
              className={`text-4xl font-bold tracking-tight md:text-5xl ${toneClass.value}`}
            >
              {value}
            </motion.div>
            <div className={`h-2 rounded-full ${toneClass.rail}`}>
              <motion.div
                className={`h-full origin-left rounded-full ${toneClass.bar}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: Math.max(0.08, Math.min(progress, 100) / 100) }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
