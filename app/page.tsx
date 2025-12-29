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
  Target,
  Users,
  MessageSquare,
  Clock,
  Zap,
  Shield,
  TrendingUp,
  Award,
  CheckCircle,
  Brain,
  Calendar as CalendarIcon,
  Video,
  BookOpen,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-linear-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center space-y-8 relative z-10">
            <Badge variant="outline" className="mb-4">
              <Zap className="size-3 mr-1" />
              Be in your Flow State
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-linear-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
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
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to stay productive
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you focus, learn, and grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 - Video Study Rooms */}
            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg flex flex-col">
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

            {/* Feature 2 - RAG Assistant */}
            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg flex flex-col">
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

            {/* Feature 3 - Event Calendar */}
            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg flex flex-col">
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

            {/* Feature 4 - Study Feed */}
            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg flex flex-col">
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
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="size-3 mr-1" />
              Simple & Powerful
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and unlock your productivity potential
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="size-16 rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="font-semibold text-lg">Sign Up</h3>
              <p className="text-sm text-muted-foreground">
                Create your account in seconds.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="size-16 rounded-full bg-linear-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="font-semibold text-lg">Upload Documents</h3>
              <p className="text-sm text-muted-foreground">
                Upload your study materials and let AI help you learn faster.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="size-16 rounded-full bg-linear-to-br from-green-500 to-green-600 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="font-semibold text-lg">Join a Room</h3>
              <p className="text-sm text-muted-foreground">
                Study with others in video rooms and track your focus time.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="size-16 rounded-full bg-linear-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                4
              </div>
              <h3 className="font-semibold text-lg">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your productivity and celebrate your achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="border-2 border-primary bg-linear-to-br from-primary/5 to-primary/10">
            <CardHeader className="space-y-4">
              <div className="flex justify-center">
                <Shield className="size-16 text-primary" />
              </div>
              <CardTitle className="text-3xl">
                Ready to boost your productivity?
              </CardTitle>
              <CardDescription className="text-lg">
                Join the Grid and awaken your FlowState.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
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
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
