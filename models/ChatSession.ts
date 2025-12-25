// models/ChatSession.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: {
    chunkId: string;
    content: string;
    score: number;
  }[];
  timestamp: Date;
}

export interface IChatSession {
  _id: string;
  userId: string;
  documentId: string;
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: String, required: true, index: true },
    documentId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        sources: [
          {
            chunkId: String,
            content: String,
            score: Number,
          },
        ],
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

if (models.ChatSession) {
  delete models.ChatSession;
}

export const ChatSession = model<IChatSession>('ChatSession', ChatSessionSchema);