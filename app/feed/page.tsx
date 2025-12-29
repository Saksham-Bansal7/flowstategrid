// app/feed/page.tsx
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useInfinitePosts } from "@/hooks/use-posts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Plus,
  TrendingUp,
  Clock,
  ThumbsUp,
  Search,
  X,
} from "lucide-react";
import PostCard from "@/components/post-card";
import CreatePostDialog from "@/components/create-post-dialog";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import EmailVerificationAlert from "@/components/email-verification-alert";
import { useUserProfile } from "@/hooks/use-user-profile";

function FeedContent() {
  const { data: session, status } = useSession();
  const { data: profile } = useUserProfile();
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [sortBy, setSortBy] = useState<"newest" | "mostLiked" | "trending">(
    "newest"
  );
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts(sortBy, searchQuery);

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchInput(query);
      setSearchQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="space-y-6 sm:space-y-8">
          <EmailVerificationAlert email={profile?.email || session?.user?.email || ""} />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Study Feed
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Share your achievements and stay motivated
              </p>
            </div>
            <Button
              onClick={() => setShowCreatePost(true)}
              className="w-full sm:w-auto"
              size="lg"
            >
              <Plus className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">Create Post</span>
              <span className="sm:hidden">New Post</span>
            </Button>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search posts..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </form>

                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                  <Button
                    variant={sortBy === "newest" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("newest")}
                    className="whitespace-nowrap"
                  >
                    <Clock className="size-4 mr-2" />
                    Newest
                  </Button>
                  <Button
                    variant={sortBy === "mostLiked" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("mostLiked")}
                    className="whitespace-nowrap"
                  >
                    <ThumbsUp className="size-4 mr-2" />
                    Most Liked
                  </Button>
                  <Button
                    variant={sortBy === "trending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("trending")}
                    className="whitespace-nowrap"
                  >
                    <TrendingUp className="size-4 mr-2" />
                    Trending
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {searchQuery && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Searching for: <strong>{searchQuery}</strong>
              </p>
              <Button variant="ghost" size="sm" onClick={clearSearch}>
                Clear
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-destructive">
                  Failed to load posts: {error.message}
                </p>
              </CardContent>
            </Card>
          ) : allPosts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">
                  {searchQuery
                    ? "No posts found matching your search."
                    : "No posts yet. Be the first to share something!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {allPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              <div ref={loadMoreRef} className="py-4">
                {isFetchingNextPage && (
                  <div className="flex items-center justify-center">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreatePostDialog
  open={showCreatePost}
  onClose={() => setShowCreatePost(false)}
/>
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    }>
      <FeedContent />
    </Suspense>
  );
}