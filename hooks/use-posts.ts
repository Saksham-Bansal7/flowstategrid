// hooks/use-posts.ts
"use client";

import {  useInfiniteQuery,useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Post {
  id: string;
  userId: string;
  username: string;
  content: string;
  images?: string[];
  tags?: string[];
  reactions: Array<{
  userId: string;
  type: "like";
  createdAt: Date;
}>;
  comments: Array<{
    _id: string;
    userId: string;
    content: string;
    createdAt: Date;
    user?: {
      id: string;
      name?: string;
      username?: string;
      image?: string;
    };
  }>;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name?: string;
    username?: string;
    image?: string;
    bio?: string;
  };
  reactionsCount?: number;
  commentsCount?: number;
}
// Update the useInfinitePosts function to accept search parameter
export function useInfinitePosts(sortBy: string = "newest", search: string = "") {
  return useInfiniteQuery({
    queryKey: ["posts", sortBy, search],
    queryFn: async ({ pageParam = 0 }) => {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const res = await fetch(
        `/api/posts?sortBy=${sortBy}&skip=${pageParam}&limit=10${searchParam}`
      );
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length * 10 : undefined;
    },
    initialPageParam: 0,
  });
}

// Fetch posts
export function usePosts(sortBy: string = "newest") {
  return useQuery({
    queryKey: ["posts", sortBy],
    queryFn: async () => {
      const res = await fetch(`/api/posts?sortBy=${sortBy}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });
}

// Fetch single post
export function usePost(postId: string) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) throw new Error("Failed to fetch post");
      return res.json();
    },
    enabled: !!postId,
  });
}

// Create post
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      content: string;
      images?: string[];
      tags?: string[];
    }) => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create post");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// Add reaction
export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      type,
    }: {
      postId: string;
      type: "like";
    }) => {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error("Failed to add reaction");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// Add comment
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: string;
      content: string;
    }) => {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// Delete post
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// Fetch public profile
export function usePublicProfile(username: string) {
  return useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      const res = await fetch(`/api/users/${username}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!username,
  });
}