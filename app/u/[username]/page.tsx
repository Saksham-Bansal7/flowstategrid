// app/u/[username]/page.tsx
"use client";

import { use, useState } from "react";
import { usePublicProfile } from "@/hooks/use-posts";
import { useDeletePost } from "@/hooks/use-posts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Calendar, Trash2, Edit, MoreVertical } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { data, isLoading, error } = usePublicProfile(resolvedParams.username);
  const deletePost = useDeletePost();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

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
  const isOwnProfile = session?.user?.id === user.id;

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await deletePost.mutateAsync(postToDelete);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      alert("Failed to delete post");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 lg:py-12">
        <div className="space-y-4 sm:space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || user.username}
                    width={80}
                    height={80}
                    className="rounded-full sm:w-30 sm:h-30 mx-auto sm:mx-0"
                  />
                ) : (
                  <div className="size-20 sm:size-30 rounded-full bg-muted flex items-center justify-center mx-auto sm:mx-0">
                    <span className="text-2xl sm:text-4xl font-semibold">
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}

                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
                    <div className="text-center sm:text-left w-full sm:w-auto">
                      <h1 className="text-2xl sm:text-3xl font-bold">{user.name || "Anonymous"}</h1>
                      <p className="text-base sm:text-lg text-muted-foreground">@{user.username}</p>
                    </div>
                    
                    {isOwnProfile && (
                      <Button asChild className="w-full sm:w-auto">
                        <Link href="/account">
                          <Edit className="size-4 mr-2" />
                          Edit Profile
                        </Link>
                      </Button>
                    )}
                  </div>

                  {user.bio && (
                    <p className="mt-3 text-muted-foreground text-sm sm:text-base text-center sm:text-left">{user.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 text-xs sm:text-sm text-muted-foreground justify-center sm:justify-start">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="size-3 sm:size-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3 sm:size-4" />
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
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm">Posts</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <p className="text-2xl sm:text-3xl font-bold">{stats.totalPosts}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm">Total Reactions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <p className="text-2xl sm:text-3xl font-bold">{stats.totalReactions}</p>
              </CardContent>
            </Card>
          </div>

          {/* Posts */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Posts</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {posts && posts.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {posts.map((post: any) => (
                    <div
                      key={post.id}
                      className="p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/feed/${post.id}`} className="flex-1 min-w-0">
                          <p className="line-clamp-3 text-sm sm:text-base">{post.content}</p>

                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                              {post.tags.map((tag: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
                            <span>{post.reactionsCount} reactions</span>
                            <span>{post.commentsCount} comments</span>
                            <span className="hidden sm:inline">
                              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </Link>

                        {isOwnProfile && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setPostToDelete(post.id);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm sm:text-base text-muted-foreground py-8">
                  No posts yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePost} className="w-full sm:w-auto">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}