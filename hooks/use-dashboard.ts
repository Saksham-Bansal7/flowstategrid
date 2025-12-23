// hooks/use-dashboard.ts
"use client";

import { useQuery } from "@tanstack/react-query";

export interface DashboardStats {
  totalPosts: number;
  totalReactions: number;
  totalComments: number;
  totalFocusTime: number;
  todayFocusTime: number;
  activeRooms: number;
}

export interface RecentPost {
  id: string;
  content: string;
  reactionsCount: number;
  commentsCount: number;
  createdAt: Date;
}

export interface DashboardData {
  stats: DashboardStats;
  recentPosts: RecentPost[];
}

export function useDashboardStats() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/user/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
