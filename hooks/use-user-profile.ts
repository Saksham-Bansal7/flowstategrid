// hooks/use-user-profile.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface UserProfile {
  id: string;
  name?: string;
  email: string;
  image?: string;
  bio?: string;
  location?: string;
  emailVerified?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Query: Fetch user profile
export function useUserProfile() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["user-profile", session?.user?.id],
    queryFn: async () => {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      return response.json() as Promise<UserProfile>;
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation: Update user profile
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      return response.json() as Promise<UserProfile>;
    },
    onSuccess: (data) => {
      // Update cache with new data
      queryClient.setQueryData(["user-profile", session?.user?.id], data);
      
      // Also invalidate to ensure freshness
      queryClient.invalidateQueries({ 
        queryKey: ["user-profile", session?.user?.id] 
      });
    },
  });
}