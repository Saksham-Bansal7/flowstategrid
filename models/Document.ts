// models/Document.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface IDocument {
  _id: string;
  userId: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'text';
  fileSize: number;
  totalChunks: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    pageCount?: number;
    subject?: string;
    tags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'image', 'text'], required: true },
    fileSize: { type: Number, required: true },
    totalChunks: { type: Number, default: 0 },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    metadata: {
      pageCount: Number,
      subject: String,
      tags: [String],
    },
  },
  {
    timestamps: true,
  }
);

if (models.Document) {
  delete models.Document;
}

export const Document = model<IDocument>('Document', DocumentSchema);