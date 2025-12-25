// app/api/documents/upload/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import { Document } from '@/models/Document';
import { DocumentChunk } from '@/models/DocumentChunk';
import { extractTextFromPDF, chunkText, cleanText, detectQuestions } from '@/lib/text-processor';
import { generateBatchEmbeddings } from '@/lib/embeddings';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const subject = formData.get('subject') as string | undefined;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (only PDF and text for now)
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and text files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine file type
    let fileType: 'pdf' | 'text';
    if (file.type === 'application/pdf') {
      fileType = 'pdf';
    } else {
      fileType = 'text';
    }

    // Create document record
    const document = await Document.create({
      userId: session.user.id,
      title: title || file.name,
      fileName: file.name,
      fileType,
      fileSize: file.size,
      processingStatus: 'processing',
      metadata: {
        subject,
      },
    });

    try {
      // Extract text
      let extractedText = '';
      let pageCount = 1;

      console.log('Starting text extraction for:', fileType);

      if (fileType === 'pdf') {
        try {
          const result = await extractTextFromPDF(buffer);
          extractedText = result.text;
          pageCount = result.pageCount;
          console.log('PDF extraction successful. Pages:', pageCount, 'Text length:', extractedText.length);
        } catch (pdfError) {
          console.error('PDF extraction error:', pdfError);
          throw new Error(`Failed to extract text from PDF: ${pdfError}`);
        }
      } else if (fileType === 'text') {
        extractedText = buffer.toString('utf-8');
        console.log('Text file read successfully. Length:', extractedText.length);
      }

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the document');
      }

      // Clean and chunk text
      console.log('Chunking text...');
      const cleanedText = cleanText(extractedText);
      const chunks = chunkText(cleanedText, 512, 50);
      console.log('Created', chunks.length, 'chunks');

      if (chunks.length === 0) {
        throw new Error('No chunks created from document');
      }

      // Generate embeddings for all chunks
      console.log('Generating embeddings...');
      const embeddings = await generateBatchEmbeddings(chunks);
      console.log('Embeddings generated:', embeddings.length);

      // Detect if it's a question paper
      const isQuestionPaper = detectQuestions(cleanedText);

      // Create chunk documents
      const chunkDocuments = chunks.map((content, index) => ({
        documentId: document._id.toString(),
        userId: session.user.id,
        content,
        embedding: embeddings[index],
        chunkIndex: index,
        metadata: {
          isQuestion: isQuestionPaper,
        },
      }));

      // Save all chunks
      console.log('Saving chunks to database...');
      await DocumentChunk.insertMany(chunkDocuments);

      // Update document
      document.totalChunks = chunks.length;
      document.processingStatus = 'completed';
      if (!document.metadata) document.metadata = {};
      document.metadata.pageCount = pageCount;
      await document.save();

      console.log('Document processing completed successfully');

      return NextResponse.json({
        success: true,
        documentId: document._id.toString(),
        totalChunks: chunks.length,
        message: 'Document processed successfully',
      });
    } catch (processingError: any) {
      console.error('Processing error:', processingError);
      document.processingStatus = 'failed';
      await document.save();
      
      return NextResponse.json(
        { error: processingError.message || 'Failed to process document' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload and process document' },
      { status: 500 }
    );
  }
}