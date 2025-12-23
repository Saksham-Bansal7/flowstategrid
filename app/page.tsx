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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="size-6 text-primary" />
                </div>
                <CardTitle>Study Rooms</CardTitle>
                <CardDescription>
                  Join virtual study rooms with others. Track your focus time
                  and stay accountable.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-primary" />
                    Be productive together
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-primary" />
                    Focus time tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-primary" />
                    See other being productive
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="size-6 text-primary" />
                </div>
                <CardTitle>Study Feed</CardTitle>
                <CardDescription>
                  Share notes, ask questions, and engage with a community of
                  learners.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-primary" />
                    Share study content
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-primary" />
                    Hashtag organization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-primary" />
                    Comments & reactions
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="size-6 text-primary" />
                </div>
                <CardTitle>Focus Analytics</CardTitle>
                <CardDescription>
                  Track your progress with analytics and schedule your tasks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-primary" />
                    Daily focus goals
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-primary" />
                    Schedule tasks
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-primary" />
                    Progress tracking
                  </li>
                </ul>
              </CardContent>
            </Card>
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
