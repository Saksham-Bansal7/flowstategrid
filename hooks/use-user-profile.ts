// hooks/use-user-profile.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name?: string;
  email: string;
  username?: string;
  image?: string;
  bio?: string;
  location?: string;
  emailVerified?: string | null;
  hasPassword?: boolean; // Add this line
  createdAt: string;
  updatedAt: string;
}

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
      queryClient.setQueryData(["user-profile", session?.user?.id], data);
      queryClient.invalidateQueries({ 
        queryKey: ["user-profile", session?.user?.id] 
      });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete account");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}