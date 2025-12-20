// app/api/rooms/[roomId]/leave/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";

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
    await connectDB();

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    room.participants = room.participants.filter(
      (p: any) => p.userId !== session.user.id
    );

    // Schedule deletion if room becomes empty
    if (room.participants.length === 0) {
      room.deleteAt = new Date(Date.now() + 30 * 1000); // Delete in 30 seconds
    }

    await room.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leave room error:", error);
    return NextResponse.json(
      { error: "Failed to leave room" },
      { status: 500 }
    );
  }
}