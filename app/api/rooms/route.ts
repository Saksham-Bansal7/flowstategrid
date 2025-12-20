// app/api/rooms/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();

    // Delete rooms scheduled for deletion (empty for 30+ seconds)
    await Room.deleteMany({
      deleteAt: { $lte: now },
    });

    // Delete expired rooms (older than 24 hours)
    await Room.deleteMany({
      expiresAt: { $lt: now },
    });

    const rooms = await Room.find({})
      .select("name description creatorName isPublic participants maxParticipants createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(
      rooms.map((room) => ({
        id: room._id.toString(),
        name: room.name,
        description: room.description,
        creatorName: room.creatorName,
        isPublic: room.isPublic,
        participantCount: room.participants.length,
        maxParticipants: room.maxParticipants,
        isFull: room.participants.length >= room.maxParticipants,
        createdAt: room.createdAt,
      }))
    );
  } catch (error) {
    console.error("Fetch rooms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}