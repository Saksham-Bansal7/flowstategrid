// models/DocumentChunk.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface IDocumentChunk {
  _id: string;
  documentId: string;
  userId: string;
  content: string;
  embedding: number[];
  chunkIndex: number;
  pageNumber?: number;
  metadata?: {
    headings?: string[];
    isQuestion?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DocumentChunkSchema = new Schema<IDocumentChunk>(
  {
    documentId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
    chunkIndex: { type: Number, required: true },
    pageNumber: { type: Number },
    metadata: {
      headings: [String],
      isQuestion: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

DocumentChunkSchema.index({ documentId: 1, chunkIndex: 1 });
DocumentChunkSchema.index({ userId: 1, createdAt: -1 });

if (models.DocumentChunk) {
  delete models.DocumentChunk;
}

export const DocumentChunk = model<IDocumentChunk>('DocumentChunk', DocumentChunkSchema);