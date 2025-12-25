// app/api/chat/sessions/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import { ChatSession } from '@/models/ChatSession';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    await connectDB();

    const chatSessions = await ChatSession.find({
      userId: session.user.id,
      documentId,
    })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      sessions: chatSessions.map((s) => ({
        id: s._id.toString(),
        title: s.title,
        messages: s.messages,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat sessions' }, { status: 500 });
  }
}