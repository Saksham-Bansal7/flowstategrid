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
import { useSession } from "next-auth/react";

interface StudyRoomVideoProps {
  channelName: string;
  onLeave: () => void;
  participants: Array<{ userId: string; userName: string }>;
  currentUserId: string;
  currentUserName: string;
}

export default function StudyRoomVideo({
  channelName,
  onLeave,
  participants,
  currentUserId,
  currentUserName,
}: StudyRoomVideoProps) {
  const { data: session, status } = useSession();
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ICameraVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<
    Map<number, { track: IRemoteVideoTrack; userName: string }>
  >(new Map());
  const [isVideoOn, setIsVideoOn] = useState(true);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const videoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const remoteUserCountRef = useRef(0);

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

      clientRef.current = agoraClient;

      // Listen to remote users
      agoraClient.on("user-published", async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);

        if (mediaType === "video") {
          const remoteVideoTrack = user.videoTrack!;

          // Get the next participant who is not the current user
          const otherParticipants = participants.filter(
            (p) => p.userId !== currentUserId
          );

          const participantIndex = remoteUserCountRef.current;
          const participant = otherParticipants[participantIndex] || {
            userName: `User ${user.uid}`,
          };

          setRemoteUsers((prev) => {
            const newMap = new Map(prev);
            newMap.set(user.uid as number, {
              track: remoteVideoTrack,
              userName: participant.userName,
            });
            return newMap;
          });

          remoteUserCountRef.current++;
        }
      });

      agoraClient.on("user-unpublished", (user) => {
        setRemoteUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(user.uid as number);
          return newMap;
        });
        remoteUserCountRef.current = Math.max(
          0,
          remoteUserCountRef.current - 1
        );
      });

      // Join channel
      await agoraClient.join(appId, channelName, token, null);

      // Create and publish local video track
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      setLocalVideoTrack(videoTrack);
      videoTrackRef.current = videoTrack;

      await agoraClient.publish([videoTrack]);

      // Play local video
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }
    } catch (error) {}
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const cleanup = () => {
    try {
      if (videoTrackRef.current) {
        videoTrackRef.current.stop();
        videoTrackRef.current.close();
        videoTrackRef.current = null;
        setLocalVideoTrack(null);
      }
      if (clientRef.current) {
        clientRef.current.unpublish();
        clientRef.current.leave();
        clientRef.current = null;
      }
      setRemoteUsers(new Map());
      remoteUserCountRef.current = 0;
    } catch (error) {}
  };

  const handleLeave = () => {
    cleanup();
    onLeave();
  };

  useEffect(() => {
    // Render remote videos
    remoteUsers.forEach((user, uid) => {
      const container = document.getElementById(`remote-${uid}`);
      if (container && !container.hasChildNodes()) {
        user.track.play(container);
      }
    });
  }, [remoteUsers]);

  return (
    <div className="space-y-4">
      {/* Local Video */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <div ref={localVideoRef} className="w-full h-full" />
        <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-sm text-white">
          {currentUserName} (You)
        </div>
      </div>

      {/* Remote Videos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from(remoteUsers.entries()).map(([uid, user]) => (
          <div
            key={uid}
            className="relative bg-black rounded-lg overflow-hidden aspect-video"
          >
            <div id={`remote-${uid}`} className="w-full h-full" />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-full text-xs text-white">
              {session?.user?.name || user.userName}
            </div>
          </div>
        ))}
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
