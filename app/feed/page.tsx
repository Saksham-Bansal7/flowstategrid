// app/feed/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useInfinitePosts } from "@/hooks/use-posts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, TrendingUp, Clock, ThumbsUp, Search, X } from "lucide-react";
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
  
  const [sortBy, setSortBy] = useState<"newest" | "mostLiked" | "trending">("newest");
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Study Feed</h1>
              <p className="text-muted-foreground mt-2">
                Share and discover study content
              </p>
            </div>
            <Button onClick={() => setShowCreatePost(true)}>
              <Plus />
              New Post
            </Button>
          </div>
          {/* ✅ Email Verification Alert */}
          {profile && !profile.emailVerified && (
            <EmailVerificationAlert email={profile.email} />
          )}

          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by hashtag (e.g., study, mathematics)..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="size-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                <Button type="submit">Search</Button>
              </form>
              {searchQuery && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Searching for:</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                    #{searchQuery}
                  </span>
                  <button
                    onClick={clearSearch}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filter Tabs */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "newest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("newest")}
                >
                  <Clock className="size-4" />
                  Newest
                </Button>
                <Button
                  variant={sortBy === "mostLiked" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("mostLiked")}
                >
                  <ThumbsUp className="size-4" />
                  Most Liked
                </Button>
                <Button
                  variant={sortBy === "trending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("trending")}
                >
                  <TrendingUp className="size-4" />
                  Trending Today
                </Button>
              </div>
            </CardContent>
          </Card>

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