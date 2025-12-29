// app/rooms/[roomId]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import StudyRoomVideo from "@/components/study-room-video";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [joined, setJoined] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState<
    Array<{ userId: string; userName: string }>
  >([]);

  // Cleanup on unmount + beforeunload popup
  useEffect(() => {
    if (!joined) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Show "leave site?" confirmation (preventDefault triggers browser's default message)
      e.preventDefault();

      // Use sendBeacon for reliable API call even when closing tab
      const blob = new Blob([JSON.stringify({})], { type: "application/json" });
      navigator.sendBeacon(`/api/rooms/${roomId}/leave`, blob);

      // Return value for older browsers (custom messages are ignored, browser shows default)
      return "";
    };

    const handlePopState = (e: PopStateEvent) => {
      // Immediately push state back to cancel navigation
      window.history.pushState(null, "", window.location.pathname);

      // Show confirmation when user clicks browser back button
      const confirmLeave = window.confirm(
        "Are you sure you want to leave the room?"
      );

      if (confirmLeave) {
        // User confirmed - cleanup and actually navigate back
        const blob = new Blob([JSON.stringify({})], {
          type: "application/json",
        });
        navigator.sendBeacon(`/api/rooms/${roomId}/leave`, blob);

        // Remove listeners to prevent loop
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);

        // Actually go back
        setJoined(false);
        window.history.back();
      }
      // If user cancelled, state is already pushed back so they stay on page
    };

    // Push initial state to enable popstate detection
    window.history.pushState(null, "", window.location.pathname);

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      // Also cleanup when unmounting (browser back button)
      if (joined) {
        // Use sendBeacon here too for reliability
        const blob = new Blob([JSON.stringify({})], {
          type: "application/json",
        });
        navigator.sendBeacon(`/api/rooms/${roomId}/leave`, blob);
      }
    };
  }, [joined, roomId]);

  const handleJoin = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        setParticipants(data.room?.participants || []);
        setJoined(true);
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (error) {
      setError("Failed to join room");
    }
  };

  const handleLeave = async () => {
    setJoined(false); // Prevent beforeunload popup
    await fetch(`/api/rooms/${roomId}/leave`, { method: "POST" });
    router.push("/rooms");
  };

  if (!session) {
    return <div className="p-10 text-center">Please sign in to join rooms</div>;
  }

  if (!joined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Join Study Room</h2>
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded mb-4">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter room password (if private)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full" onClick={handleJoin}>
              Join Room
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <StudyRoomVideo
          channelName={roomId}
          onLeave={handleLeave}
          participants={participants}
          currentUserId={session.user.id!}
          currentUserName={
            session.user.name || session.user.email?.split("@")[0] || "You"
          }
        />
      </div>
    </div>
  );
}
