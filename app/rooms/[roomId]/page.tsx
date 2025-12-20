// app/rooms/[roomId]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import StudyRoomVideo from "@/components/study-room-video";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [joined, setJoined] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState<Array<{userId: string, userName: string}>>([]);

  const handleJoin = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        setParticipants(data.participants || []);
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
    await fetch(`/api/rooms/${roomId}/leave`, { method: "POST" });
    router.push("/rooms");
  };

  if (!session) {
    return <div>Please sign in to join rooms</div>;
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <StudyRoomVideo
          channelName={roomId}
          onLeave={handleLeave}
          participants={participants}
          currentUserId={session.user.id!}
        />
      </div>
    </div>
  );
}