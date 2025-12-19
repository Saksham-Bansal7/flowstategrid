// hooks/use-user-profile.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useSession } from "next-auth/react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  location?: string;
}

// Query: Fetch user profile
export function useUserProfile() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["user-profile", session?.user?.id],
    queryFn: () => apiClient.get<UserProfile>(`/api/user/profile`),
    enabled: !!session?.user?.id, // Only fetch if user is logged in
  });
}

// Mutation: Update user profile
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (data: Partial<UserProfile>) =>
      apiClient.put<UserProfile>("/api/user/profile", data),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["user-profile", session?.user?.id] });
      // Or optimistically update
      queryClient.setQueryData(["user-profile", session?.user?.id], data);
    },
  });
}