// app/feed/[postId]/page.tsx
"use client";

import { use } from "react";
import { usePost, useAddComment } from "@/hooks/use-posts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  ArrowLeft,
  Heart,
  Lightbulb,
  Sparkles,
  Eye,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAddReaction } from "@/hooks/use-posts";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { data, isLoading, error } = usePost(resolvedParams.postId);
  const addReaction = useAddReaction();
  const addComment = useAddComment();

  const [commentContent, setCommentContent] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (error || !data?.post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">Post not found</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.push("/feed")}>
                <ArrowLeft />
                Back to Feed
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const post = data.post;

  const userReaction = post.reactions?.find(
    (r: any) => r.userId === session?.user?.id
  );

  const likeCount =
    post.reactions?.filter((r: any) => r.type === "like").length || 0;

  const handleReaction = () => {
    addReaction.mutate({ postId: post.id, type: "like" });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      await addComment.mutateAsync({
        postId: post.id,
        content: commentContent.trim(),
      });
      setCommentContent("");
    } catch (error) {
      alert("Failed to add comment");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.push("/feed")}>
            <ArrowLeft />
            Back to Feed
          </Button>

          {/* Post Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <Link
                  href={`/u/${post.username}`}
                  className="flex items-center gap-3 hover:opacity-80"
                >
                  {post.user?.image ? (
                    <Image
                      src={post.user.image}
                      alt={post.user.name || post.username}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-semibold">
                        {post.username?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">
                      {post.user?.name || "Anonymous"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{post.username}
                    </p>
                    {post.user?.bio && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {post.user.bio}
                      </p>
                    )}
                  </div>
                </Link>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg whitespace-pre-wrap">{post.content}</p>

              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {post.images.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative aspect-video rounded-lg overflow-hidden"
                    >
                      <Image
                        src={img}
                        alt={`Post image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant={
                      userReaction?.type === "like" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={handleReaction}
                  >
                    <Heart
                      className="size-4"
                      fill={
                        userReaction?.type === "like" ? "currentColor" : "none"
                      }
                    />
                    <span className="ml-1">{likeCount}</span>
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="size-4" />
                    <span className="ml-1">{post.viewCount}</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyLink}>
                    <Share2 className="size-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                Comments ({post.comments?.length || 0})
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment Form */}
              {session && (
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    maxLength={1000}
                  />
                  <Button
                    type="submit"
                    disabled={!commentContent.trim() || addComment.isPending}
                  >
                    {addComment.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Post"
                    )}
                  </Button>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment: any) => (
                    <div
                      key={comment._id}
                      className="flex gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Link href={`/u/${comment.user?.username}`}>
                        {comment.user?.image ? (
                          <Image
                            src={comment.user.image}
                            alt={comment.user.name || "User"}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-semibold">
                              {comment.user?.username?.[0]?.toUpperCase() ||
                                "U"}
                            </span>
                          </div>
                        )}
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/u/${comment.user?.username}`}
                            className="font-semibold text-sm hover:underline"
                          >
                            {comment.user?.name || "Anonymous"}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            @{comment.user?.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
