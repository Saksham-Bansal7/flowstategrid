// app/feed/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
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

export default function FeedPage() {
  // ✅ ALL HOOKS AT THE TOP - BEFORE ANY CONDITIONS
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

  // Initialize search from URL params
  useEffect(() => {
    const urlSearch = searchParams?.get("search");
    if (urlSearch) {
      setSearchInput(urlSearch);
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ✅ NOW CHECK CONDITIONS AFTER ALL HOOKS
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="space-y-4 sm:space-y-6">
          {/* Header - Stack on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Feed</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Share and discover study resources
              </p>
            </div>
            <Button
              onClick={() => setShowCreatePost(true)}
              size="default"
              className="w-full sm:w-auto"
            >
              <Plus className="size-4 mr-2" />
              Create Post
            </Button>
          </div>

          {/* Search Bar - Full width on mobile */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-10 w-full"
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

          {/* Sort Buttons - Horizontal scroll on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <Button
              variant={sortBy === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("newest")}
              className="shrink-0"
            >
              <Clock className="size-4 mr-2" />
              Newest
            </Button>
            <Button
              variant={sortBy === "mostLiked" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("mostLiked")}
              className="shrink-0"
            >
              <ThumbsUp className="size-4 mr-2" />
              Most Liked
            </Button>
            <Button
              variant={sortBy === "trending" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("trending")}
              className="shrink-0"
            >
              <TrendingUp className="size-4 mr-2" />
              Trending
            </Button>
          </div>

          {/* Posts Feed */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-destructive">
                  Failed to load posts
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {allPosts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? `No posts found with hashtag "${searchQuery}"`
                        : "No posts yet. Be the first to share!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {allPosts.map((post: any) => (
                    <PostCard key={post.id || post._id} post={post} />
                  ))}

                  {/* Intersection Observer Target */}
                  {hasNextPage && (
                    <div ref={loadMoreRef} className="flex justify-center py-8">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {/* End Message */}
                  {!hasNextPage && allPosts.length > 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      🎉 You've reached the end!
                    </p>
                  )}
                </>
              )}
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
