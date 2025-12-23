// models/FocusSession.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface IFocusSession {
  _id: string;
  userId: string;
  roomId: string;
  roomName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // Duration in minutes
  isActive: boolean; // Whether the session is still ongoing
  createdAt: Date;
  updatedAt: Date;
}

const FocusSessionSchema = new Schema<IFocusSession>(
  {
    userId: { type: String, required: true, index: true },
    roomId: { type: String, required: true, index: true },
    roomName: { type: String, required: true },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number }, // in minutes
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
FocusSessionSchema.index({ userId: 1, isActive: 1 });
FocusSessionSchema.index({ userId: 1, createdAt: -1 });

// Delete the cached model to ensure schema updates are applied
if (models.FocusSession) {
  delete models.FocusSession;
}

export const FocusSession = model<IFocusSession>('FocusSession', FocusSessionSchema);