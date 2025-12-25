// app/api/documents/[documentId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import { Document } from '@/models/Document';
import { DocumentChunk } from '@/models/DocumentChunk';
import { ChatSession } from '@/models/ChatSession';

export async function DELETE(req: Request, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId } = await params;
    await connectDB();

    const document = await Document.findById(documentId);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete all chunks
    await DocumentChunk.deleteMany({ documentId });

    // Delete all chat sessions
    await ChatSession.deleteMany({ documentId });

    // Delete document
    await document.deleteOne();

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}