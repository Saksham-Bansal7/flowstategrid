// components/study-room-video.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, LogOut } from "lucide-react";

interface StudyRoomVideoProps {
  channelName: string;
  onLeave: () => void;
  participants: Array<{userId: string, userName: string}>;
  currentUserId: string;
}

export default function StudyRoomVideo({
  channelName,
  onLeave,
  participants,
  currentUserId,
}: StudyRoomVideoProps) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ICameraVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Map<number, IRemoteVideoTrack>>(
    new Map()
  );
  const [userIdMapping, setUserIdMapping] = useState<Map<number, string>>(new Map());
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [localUid, setLocalUid] = useState<number | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const getUserName = (userId: string) => {
    const participant = participants.find(p => p.userId === userId);
    return participant?.userName || "User";
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initAgora();
    }
    return () => {
      cleanup();
    };
  }, []);

  const initAgora = async () => {
    try {
      // Get token from backend
      const response = await fetch("/api/agora/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName }),
      });
      const { token, appId } = await response.json();

      // Create client
      const agoraClient = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });

      setClient(agoraClient);

      // Listen to remote users
      agoraClient.on("user-published", async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);

        if (mediaType === "video") {
          const remoteVideoTrack = user.videoTrack!;
          // Don't add own video to remote users
          setRemoteUsers((prev) => {
            const newMap = new Map(prev);
            newMap.set(user.uid as number, remoteVideoTrack);
            return newMap;
          });
        }
      });

      agoraClient.on("user-unpublished", (user) => {
        setRemoteUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(user.uid as number);
          return newMap;
        });
      });

      // Join channel
      const uid = await agoraClient.join(appId, channelName, token, null);
      setLocalUid(uid as number);

      // Create and publish local video track
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      setLocalVideoTrack(videoTrack);

      await agoraClient.publish([videoTrack]);

      // Play local video
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }
    } catch (error) {
      console.error("Agora init error:", error);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const cleanup = async () => {
    try {
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }
      if (client) {
        await client.unpublish();
        await client.leave();
        setClient(null);
      }
      setRemoteUsers(new Map());
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  const handleLeave = async () => {
    await cleanup();
    onLeave();
  };

  useEffect(() => {
    // Render remote videos
    remoteUsers.forEach((track, uid) => {
      const container = document.getElementById(`remote-${uid}`);
      if (container && !container.hasChildNodes()) {
        track.play(container);
      }
    });
  }, [remoteUsers]);

  return (
    <div className="space-y-4">
      {/* Local Video */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <div ref={localVideoRef} className="w-full h-full" />
        <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-sm text-white">
          You
        </div>
      </div>

      {/* Remote Videos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from(remoteUsers.entries()).map(([uid]) => {
          // Find the participant by checking all participants except current user
          const otherParticipants = participants.filter(p => p.userId !== currentUserId);
          const index = Array.from(remoteUsers.keys()).indexOf(uid);
          const participant = otherParticipants[index];
          
          return (
            <div
              key={uid}
              className="relative bg-black rounded-lg overflow-hidden aspect-video"
            >
              <div id={`remote-${uid}`} className="w-full h-full" />
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-full text-xs text-white">
                {participant?.userName || `User ${uid}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          variant={isVideoOn ? "default" : "destructive"}
          onClick={toggleVideo}
        >
          {isVideoOn ? <Video /> : <VideoOff />}
          {isVideoOn ? "Turn Off Video" : "Turn On Video"}
        </Button>
        <Button variant="outline" onClick={handleLeave}>
          <LogOut />
          Leave Room
        </Button>
      </div>
    </div>
  );
}