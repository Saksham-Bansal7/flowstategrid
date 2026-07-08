// app/rooms/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Users, Lock, Globe } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { MotionBlock, MotionCard, MotionMain } from "@/components/motion-shell";

export default function StudyRoomsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
    password: "",
    maxParticipants: 20,
  });
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const response = await fetch("/api/rooms");
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const handleCreateRoom = async () => {
    setCreateError("");

    // Validation
    if (!formData.name.trim()) {
      setCreateError("Room name is required");
      return;
    }

    if (!formData.isPublic && !formData.password) {
      setCreateError("Password is required for private rooms");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsCreateDialogOpen(false);
        // Reset form
        setFormData({
          name: "",
          description: "",
          isPublic: true,
          password: "",
          maxParticipants: 20,
        });
        router.push(`/rooms/${data.id}`);
      } else {
        setCreateError(data.error || "Failed to create room");
      }
    } catch (error) {
      setCreateError("An error occurred. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    router.push(`/rooms/${roomId}`);
  };

  return (
    <MotionMain className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <MotionBlock className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">Study Rooms</h1>
              <p className="text-muted-foreground mt-2">
                Join a room and study together with others
              </p>
            </div>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Study Room</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {createError && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
                      {createError}
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Room Name</label>
                    <Input
                      placeholder="Math Study Session"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="Studying for finals..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Room Type</label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant={formData.isPublic ? "default" : "outline"}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            isPublic: true,
                            password: "",
                          })
                        }
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Public
                      </Button>
                      <Button
                        type="button"
                        variant={!formData.isPublic ? "default" : "outline"}
                        onClick={() =>
                          setFormData({ ...formData, isPublic: false })
                        }
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Private
                      </Button>
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {!formData.isPublic && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="text-sm font-medium">Password</label>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button
                    className="w-full"
                    onClick={handleCreateRoom}
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Room"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </MotionBlock>

          {/* Rooms Grid */}
          {isLoading ? (
            <MotionBlock className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="soft-card h-48 animate-pulse" />
              ))}
            </MotionBlock>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms?.map((room: any) => (
                <MotionCard key={room.id}>
                <Card
                  className="soft-card h-full transition-colors hover:border-primary/30"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {room.name}
                        {!room.isPublic && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {room.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {room.participantCount}/{room.maxParticipants} studying
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created by {room.creatorName}
                      </div>
                      <Button
                        className="w-full"
                        disabled={room.isFull}
                        onClick={() => handleJoinRoom(room.id)}
                      >
                        {room.isFull ? "Room Full" : "Join Room"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                </MotionCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </MotionMain>
  );
}
