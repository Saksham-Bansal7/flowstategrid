// app/u/[username]/page.tsx
"use client";

import { use } from "react";
import { usePublicProfile } from "@/hooks/use-posts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Calendar, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const { data, isLoading, error } = usePublicProfile(resolvedParams.username);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  // Make sure the error handling is proper
if (error || !data?.user) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <p className="text-destructive">User not found</p>
          <Button asChild>
            <Link href="/feed">Back to Feed</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

  const { user, posts, stats } = data;

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || user.username}
                    width={120}
                    height={120}
                    className="rounded-full"
                  />
                ) : (
                  <div className="size-30 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-4xl font-semibold">
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="text-3xl font-bold">{user.name || "Anonymous"}</h1>
                  <p className="text-lg text-muted-foreground">@{user.username}</p>

                  {user.bio && (
                    <p className="mt-3 text-muted-foreground">{user.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="size-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      <span>
                        Joined {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalPosts}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Reactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalReactions}</p>
              </CardContent>
            </Card>
          </div>

          {/* Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {posts && posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/feed/${post.id}`}
                      className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <p className="line-clamp-3">{post.content}</p>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {post.tags.map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>{post.reactionsCount} reactions</span>
                        <span>{post.commentsCount} comments</span>
                        <span>
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No posts yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}