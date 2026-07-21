import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();
    const { roomId } = await params;

    const room = await Room.findById(roomId)
      .select("participants name creatorName isPublic maxParticipants")
      .lean();

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: room._id.toString(),
      name: room.name,
      creatorName: room.creatorName,
      isPublic: room.isPublic,
      maxParticipants: room.maxParticipants,
      participants: room.participants,
    });
  } catch (error) {
    console.error("Fetch room error:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}