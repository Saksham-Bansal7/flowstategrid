// components/post-card.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAddReaction } from "@/hooks/use-posts";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: any;
}

export default function PostCard({ post }: PostCardProps) {
  const { data: session } = useSession();
  const addReaction = useAddReaction();

  const userReaction = post.reactions?.find(
    (r: any) => r.userId === session?.user?.id
  );

  const likeCount =
    post.reactions?.filter((r: any) => r.type === "like").length || 0;

  const handleReaction = () => {
    addReaction.mutate({ postId: post.id || post._id, type: "like" });
  };

  const copyLink = () => {
    const url = `${window.location.origin}/feed/${post.id || post._id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  // Use current username from user object, fallback to stored username
  const displayUsername = post.user?.username || post.username;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <Link
            href={`/u/${displayUsername}`}
            className="flex items-center gap-3 hover:opacity-80"
          >
            {post.user?.image ? (
              <Image
                src={post.user.image}
                alt={post.user.name || displayUsername}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {displayUsername?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold">{post.user?.name || "Anonymous"}</p>
              <p className="text-sm text-muted-foreground">
                @{displayUsername}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Post content link - WITHOUT tags inside */}
        <Link href={`/feed/${post.id || post._id}`} className="block">
          <p className="whitespace-pre-wrap">{post.content}</p>

          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {post.images.slice(0, 4).map((img: string, idx: number) => (
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
        </Link>

        {/* Tags OUTSIDE the post link */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string, idx: number) => (
              <Link
                key={idx}
                href={`/feed?search=${encodeURIComponent(tag)}`}
                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-1">
            <Button
              variant={userReaction?.type === "like" ? "default" : "ghost"}
              size="sm"
              onClick={handleReaction}
            >
              <Heart
                className="size-4"
                fill={userReaction?.type === "like" ? "currentColor" : "none"}
              />
              {likeCount > 0 && <span className="ml-1">{likeCount}</span>}
            </Button>
          </div>

          <div className="flex gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/feed/${post.id || post._id}`}>
                <MessageCircle className="size-4" />
                {post.commentsCount > 0 && (
                  <span className="ml-1">{post.commentsCount}</span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="sm">
              <Eye className="size-4" />
              <span className="ml-1">{post.viewCount}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={copyLink}>
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
