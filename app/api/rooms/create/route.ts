// app/api/rooms/create/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Room } from "@/models/Room";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(200).optional(),
  isPublic: z.boolean(),
  password: z.string().optional(),
  maxParticipants: z.number().min(2).max(20).default(20),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!session.user.emailVerified) {
          return NextResponse.json(
            { error: "Please verify your email before creating rooms." },
            { status: 403 }
          );
        }

    const body = await req.json();
    const data = createRoomSchema.parse(body);

    // Validate private room has password
    if (!data.isPublic) {
      if (!data.password || data.password.trim().length < 4) {
        return NextResponse.json(
          { error: "Password must be at least 4 characters for private rooms" },
          { status: 400 }
        );
      }
    }

    await connectDB();

    // Hash password if private
    const hashedPassword = data.password && data.password.trim()
      ? await bcrypt.hash(data.password, 10)
      : undefined;

    const room = await Room.create({
      name: data.name,
      description: data.description,
      creatorId: session.user.id,
      creatorName: session.user.name || session.user.email,
      isPublic: data.isPublic,
      password: hashedPassword,
      maxParticipants: data.maxParticipants,
      participants: [],
      deleteAt: new Date(Date.now() + 30 * 1000), // Delete in 30 seconds if no one joins
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });

    return NextResponse.json({
      id: room._id.toString(),
      name: room.name,
      isPublic: room.isPublic,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Create room error:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}