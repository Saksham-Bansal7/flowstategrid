// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import { DocumentChunk } from '@/models/DocumentChunk';
import { ChatSession } from '@/models/ChatSession';
import { generateEmbedding } from '@/lib/embeddings';
import { groqClient } from '@/lib/groq';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question, documentId, sessionId } = await req.json();

    if (!question || !documentId) {
      return NextResponse.json({ error: 'Question and documentId are required' }, { status: 400 });
    }

    await connectDB();

    // Generate embedding for the question
    const queryEmbedding = await generateEmbedding(question);

    // Perform vector search using MongoDB Atlas Vector Search
    const relevantChunks = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 5,
          filter: {
            documentId: documentId,
          },
        },
      },
      {
        $project: {
          _id: 1,
          content: 1,
          chunkIndex: 1,
          pageNumber: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);

    // Build context from retrieved chunks
    const context = relevantChunks
      .map((chunk, idx) => `[Source ${idx + 1}]:\n${chunk.content}`)
      .join('\n\n---\n\n');

    // Generate response with Groq - FIXED PROMPT
    const response = await groqClient.post('/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful study assistant. Answer questions based ONLY on the provided context from the user\'s notes/question papers. Provide clear, well-formatted answers using markdown. Use bullet points, numbered lists for better readability. If the context contains mathematical formulas, format them using LaTeX notation (wrap in $ for inline or $$ for block). Cite which source you\'re referencing. If the question cannot be answered from the context, clearly state "I cannot find this information in the provided document."'
        },
        {
          role: 'user',
          content: `Context from document:\n${context}\n\nQuestion: ${question}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const answer = response.data.choices[0]?.message?.content || 'No response generated';

    // Save to chat session
    const sources = relevantChunks.map((chunk) => ({
      chunkId: chunk._id.toString(),
      content: chunk.content.substring(0, 200) + '...',
      score: chunk.score,
    }));

    if (sessionId) {
      // Add to existing session
      await ChatSession.findByIdAndUpdate(sessionId, {
        $push: {
          messages: [
            { role: 'user', content: question, timestamp: new Date() },
            { role: 'assistant', content: answer, sources, timestamp: new Date() },
          ],
        },
      });
    } else {
      // Create new session
      const newSession = await ChatSession.create({
        userId: session.user.id,
        documentId,
        title: question.substring(0, 100),
        messages: [
          { role: 'user', content: question, timestamp: new Date() },
          { role: 'assistant', content: answer, sources, timestamp: new Date() },
        ],
      });

      return NextResponse.json({
        answer,
        sessionId: newSession._id.toString(),
        sources: relevantChunks.map((chunk) => ({
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
          pageNumber: chunk.pageNumber,
          score: chunk.score,
        })),
      });
    }

    return NextResponse.json({
      answer,
      sources: relevantChunks.map((chunk) => ({
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber,
        score: chunk.score,
      })),
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}