// components/navbar.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User, Menu, X, Settings, UserCircle } from "lucide-react";
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
        <div className="flex items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold shrink-0"
          >
            <span>FlowStateGrid</span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-6">
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
            <Link
              href="/rag"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Assistant
            </Link>
            <Link
              href="/calendar"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Events
            </Link>
          </div>

          {/* Desktop Right Section - Auth */}
          <div className="hidden md:flex items-center space-x-3 shrink-0">
            {status === "loading" ? (
              <div className="h-9 w-24 animate-pulse bg-muted rounded-md" />
            ) : session ? (
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
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
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {profile?.username && (
                      <DropdownMenuItem asChild>
                        <Link href={`/u/${profile.username}`} className="cursor-pointer">
                          <UserCircle className="size-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">
                        <Settings className="size-4" />
                        Account Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} variant="destructive">
                      <LogOut className="size-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => signIn()}>
                  <LogIn className="size-4" />
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
            className="md:hidden p-2 rounded-md hover:bg-accent ml-auto"
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
            <Link
              href="/rag"
              className="block px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Assistant
            </Link>
            <Link
              href="/calendar"
              className="block px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
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
                    <LogOut className="size-4" />
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
                    <LogIn className="size-4" />
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