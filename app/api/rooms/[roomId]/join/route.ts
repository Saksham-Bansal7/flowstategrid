// app/api/rooms/[roomId]/join/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";
import { User } from "@/models/User";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // ✅ Check email verification
    const user = await User.findById(session.user.id).select("emailVerified");
    if (!user?.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before joining rooms." },
        { status: 403 }
      );
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if user is already a participant
    const isParticipant = room.participants.some(
      (p: { userId: string }) => p.userId === session.user.id
    );

    if (isParticipant) {
      return NextResponse.json(
        { error: "Already joined this room" },
        { status: 400 }
      );
    }

    // Add user to participants
    room.participants.push({
      userId: session.user.id,
      name: session.user.name || "Anonymous",
      joinedAt: new Date(),
    });

    await room.save();

    return NextResponse.json({
      message: "Successfully joined the room",
      room: {
        id: room._id.toString(),
        name: room.name,
        participants: room.participants,
      },
    });
  } catch (error) {
    console.error("Room join error:", error);
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}