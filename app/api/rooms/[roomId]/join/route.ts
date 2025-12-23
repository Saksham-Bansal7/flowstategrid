// app/api/rooms/[roomId]/join/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";
import { User } from "@/models/User";
import { FocusSession } from "@/models/FocusSession";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if email is verified
    const user = await User.findById(session.user.id);
    if (!user?.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before joining rooms" },
        { status: 403 }
      );
    }

    const { roomId } = await params;
    const { password } = await req.json();

    await connectDB();

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if room is full
    if (room.participants.length >= room.maxParticipants) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 });
    }

    // Check password for private rooms
    if (!room.isPublic) {
      if (!password || password !== room.password) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 403 }
        );
      }
    }

    // Check if user is already in the room
    const isAlreadyParticipant = room.participants.some(
      (p: any) => p.userId === session.user.id
    );

    if (isAlreadyParticipant) {
      return NextResponse.json(
        { error: "Already in this room" },
        { status: 400 }
      );
    }

    // Get username from user document
    const userName = user.username || user.name || user.email.split('@')[0];

    // Add participant to room
    room.participants.push({
      userId: session.user.id,
      userName: userName,
      joinedAt: new Date(),
    });

    // Clear deleteAt if it was scheduled for deletion
    if (room.deleteAt) {
      room.deleteAt = undefined;
    }

    await room.save();

    // Create focus session
    await FocusSession.create({
      userId: session.user.id,
      roomId: room._id.toString(),
      roomName: room.name,
      startTime: new Date(),
      isActive: true,
    });

    return NextResponse.json({ success: true, room });
  } catch (error) {
    console.error("Join room error:", error);
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}