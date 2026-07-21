// app/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Zap,
  Shield,
  CheckCircle,
  Brain,
  Calendar as CalendarIcon,
  Video,
  Sparkles,
} from "lucide-react";
import { MotionBlock, MotionCard, MotionMain } from "@/components/motion-shell";

export default function Home() {
  const { data: session } = useSession();

  return (
    <MotionMain className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center space-y-8 relative z-10">
            <MotionBlock>
            <Badge variant="outline" className="mb-4 bg-background/70">
              <Zap className="size-3 mr-1" />
              Be in your Flow State
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
              <span className="bg-linear-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
                FlowStateGrid
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Your all-in-one productivity companion for achieving deep focus,
              sharing knowledge, and building better study habits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              {session ? (
                <>
                  <Button asChild size="lg" className="text-lg px-8">
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-lg px-8"
                  >
                    <Link href="/feed">Browse Feed</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-8">
                    <Link href="/auth/signup">
                      Get Started Free
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-lg px-8"
                  >
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
            </MotionBlock>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background/55">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionBlock className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to stay productive
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you focus, learn, and grow.
            </p>
          </MotionBlock>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 - Video Study Rooms */}
            <MotionCard>
            <Card className="soft-card h-full flex flex-col transition-colors hover:border-primary/40">
              <CardHeader>
                <div className="size-12 rounded-lg bg-linear-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center mb-4">
                  <Video className="size-6 text-blue-500" />
                </div>
                <CardTitle>Video Study Rooms</CardTitle>
                <CardDescription className="min-h-12">
                  Join virtual study rooms with live video. Study together in
                  real-time with others.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-blue-500" />
                    Live video & no audio distractions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-blue-500" />
                    Automatic focus time tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-blue-500" />
                    See who's being productive
                  </li>
                </ul>
              </CardContent>
            </Card>
            </MotionCard>

            {/* Feature 2 - RAG Assistant */}
            <MotionCard>
            <Card className="soft-card h-full flex flex-col transition-colors hover:border-primary/40">
              <CardHeader>
                <div className="size-12 rounded-lg bg-linear-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center mb-4">
                  <Brain className="size-6 text-purple-500" />
                </div>
                <CardTitle>AI Study Assistant</CardTitle>
                <CardDescription className="min-h-12">
                  Chat with your documents using AI. Upload PDFs, ask questions,
                  get instant answers.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-purple-500" />
                    PDF support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-purple-500" />
                    Context-aware chat memory
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-purple-500" />
                    Math equations with KaTeX
                  </li>
                </ul>
              </CardContent>
            </Card>
            </MotionCard>

            {/* Feature 3 - Event Calendar */}
            <MotionCard>
            <Card className="soft-card h-full flex flex-col transition-colors hover:border-primary/40">
              <CardHeader>
                <div className="size-12 rounded-lg bg-linear-to-br from-green-500/10 to-green-600/20 flex items-center justify-center mb-4">
                  <CalendarIcon className="size-6 text-green-500" />
                </div>
                <CardTitle>Event Scheduler</CardTitle>
                <CardDescription className="min-h-12">
                  Plan your study sessions with a powerful calendar. Drag, drop,
                  and organize your time.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    Drag & drop scheduling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    Color-coded events
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-500" />
                    Recurring tasks support
                  </li>
                </ul>
              </CardContent>
            </Card>
            </MotionCard>

            {/* Feature 4 - Study Feed */}
            <MotionCard>
            <Card className="soft-card h-full flex flex-col transition-colors hover:border-primary/40">
              <CardHeader>
                <div className="size-12 rounded-lg bg-linear-to-br from-pink-500/10 to-pink-600/20 flex items-center justify-center mb-4">
                  <MessageSquare className="size-6 text-pink-500" />
                </div>
                <CardTitle>Study Feed</CardTitle>
                <CardDescription className="min-h-12">
                  Share notes, resources, and insights with a community of
                  learners. Get feedback and help others.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-pink-500" />
                    Share study content & images
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-pink-500" />
                    Hashtag organization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-pink-500" />
                    Comments & reactions
                  </li>
                </ul>
              </CardContent>
            </Card>
            </MotionCard>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionBlock className="text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-background/70">
              <Sparkles className="size-3 mr-1" />
              Simple & Powerful
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and unlock your productivity potential
            </p>
          </MotionBlock>

          <div className="relative grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-5">
            <div className="absolute left-8 right-8 top-10 hidden h-px bg-linear-to-r from-transparent via-border to-transparent md:block" />
            <MotionCard className="relative rounded-md border bg-card/70 p-5 text-center shadow-sm backdrop-blur">
              <div className="mx-auto flex size-14 items-center justify-center rounded-md bg-blue-500 text-xl font-bold text-white shadow-sm shadow-blue-500/20">
                1
              </div>
              <h3 className="mt-5 font-semibold text-lg">Sign Up</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create your account in seconds.
              </p>
            </MotionCard>

            <MotionCard className="relative rounded-md border bg-card/70 p-5 text-center shadow-sm backdrop-blur">
              <div className="mx-auto flex size-14 items-center justify-center rounded-md bg-violet-500 text-xl font-bold text-white shadow-sm shadow-violet-500/20">
                2
              </div>
              <h3 className="mt-5 font-semibold text-lg">Upload Documents</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Upload your study materials and let AI help you learn faster.
              </p>
            </MotionCard>

            <MotionCard className="relative rounded-md border bg-card/70 p-5 text-center shadow-sm backdrop-blur">
              <div className="mx-auto flex size-14 items-center justify-center rounded-md bg-emerald-500 text-xl font-bold text-white shadow-sm shadow-emerald-500/20">
                3
              </div>
              <h3 className="mt-5 font-semibold text-lg">Join a Room</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Study with others in video rooms and track your focus time.
              </p>
            </MotionCard>

            <MotionCard className="relative rounded-md border bg-card/70 p-5 text-center shadow-sm backdrop-blur">
              <div className="mx-auto flex size-14 items-center justify-center rounded-md bg-orange-500 text-xl font-bold text-white shadow-sm shadow-orange-500/20">
                4
              </div>
              <h3 className="mt-5 font-semibold text-lg">Track Progress</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Monitor your productivity and celebrate your achievements.
              </p>
            </MotionCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionBlock>
          <Card className="soft-card overflow-hidden border-primary/20 bg-linear-to-br from-card via-card to-primary/10">
            <CardContent className="grid items-center gap-6 p-6 text-left md:grid-cols-[1fr_auto] md:p-8">
              <div className="flex items-start gap-4">
                <div className="hidden rounded-md bg-primary/10 p-3 text-primary sm:block">
                  <Shield className="size-7" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl">
                    Ready to boost your productivity?
                  </CardTitle>
                  <CardDescription className="mt-2 text-base md:text-lg">
                    Join the Grid and awaken your FlowState.
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              {!session && (
                <>
                  <Button asChild size="lg" className="text-lg px-8">
                    <Link href="/auth/signup">
                      Get Started Free
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-lg px-8"
                  >
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                </>
              )}
              {session && (
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight />
                  </Link>
                </Button>
              )}
              </div>
            </CardContent>
          </Card>
          </MotionBlock>
        </div>
      </section>
    </MotionMain>
  );
}
