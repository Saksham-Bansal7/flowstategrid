// components/navbar.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useUserProfile } from "@/hooks/use-user-profile";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { data: profile } = useUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold"
          >
            <span>FlowStateGrid</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/feed"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Feed
            </Link>
            <Link
              href="/rooms"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Rooms
            </Link>
            {session && profile?.username && (
              <Link
                href={`/u/${profile.username}`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Profile
              </Link>
            )}
            {session && (
              <Link
                href="/account"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Account
              </Link>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {status === "loading" ? (
              <div className="h-9 w-24 animate-pulse bg-muted rounded-md" />
            ) : session ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-muted/50">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="size-5" />
                  )}
                  <span className="text-sm font-medium">
                    {session.user.name || session.user.email}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  <LogOut />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => signIn()}>
                  <LogIn />
                  Sign In
                </Button>
                <Button size="sm" onClick={() => signIn()}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/feed"
              className="block px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Feed
            </Link>
            <Link
              href="/rooms"
              className="block px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Rooms
            </Link>
            {session && profile?.username && (
              <Link
                href={`/u/${profile.username}`}
                className="block px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
            )}
            {session && (
              <Link
                href="/account"
                className="block px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Account
              </Link>
            )}

            <div className="pt-3 border-t space-y-2">
              {status === "loading" ? (
                <div className="h-9 animate-pulse bg-muted rounded-md" />
              ) : session ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-muted/50">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="size-5" />
                    )}
                    <span className="text-sm font-medium">
                      {session.user.name || session.user.email}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      signIn();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogIn />
                    Sign In
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      signIn();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}