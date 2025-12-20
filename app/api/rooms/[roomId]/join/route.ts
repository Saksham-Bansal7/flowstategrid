// app/api/rooms/[roomId]/join/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";
import bcrypt from "bcryptjs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      if (!password) {
        return NextResponse.json(
          { error: "Password required" },
          { status: 400 }
        );
      }
      const isValid = await bcrypt.compare(password, room.password!);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }
    }

    // Check if already joined
    const alreadyJoined = room.participants.some(
      (p: any) => p.userId === session.user.id
    );

    if (!alreadyJoined) {
      room.participants.push({
        userId: session.user.id,
        userName: session.user.name || session.user.email!,
        joinedAt: new Date(),
      });
    }
    
    // Clear scheduled deletion since room is now occupied
    room.deleteAt = undefined;
    await room.save();

    return NextResponse.json({
      roomId: room._id.toString(),
      channelName: room._id.toString(),
      participants: room.participants,
    });
  } catch (error) {
    console.error("Join room error:", error);
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}