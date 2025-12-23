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
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold">{user.name || "Anonymous"}</h1>
                      <p className="text-lg text-muted-foreground">@{user.username}</p>
                    </div>
                    
                    {isOwnProfile && (
                      <Button asChild>
                        <Link href="/account">
                          <Edit className="size-4" />
                          Edit Profile
                        </Link>
                      </Button>
                    )}
                  </div>

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
                    <div
                      key={post.id}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/feed/${post.id}`}
                          className="flex-1"
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

                        {isOwnProfile && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setPostToDelete(post.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="size-4" />
                                Delete Post
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
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

      {/* Delete Post Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your post.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePost}
              disabled={deletePost.isPending}
            >
              {deletePost.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}