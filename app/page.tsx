// app/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="text-center space-y-6 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          FlowStateGrid
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground">
          Your productivity companion for achieving flow state
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          {session ? (
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Go to Dashboard
                <ArrowRight />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight />
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </>
          )}
        </div>

        {session && (
          <p className="text-sm text-muted-foreground pt-4">
            Welcome back, {session.user.name || session.user.email}! 👋
          </p>
        )}
      </div>
    </main>
  );
}