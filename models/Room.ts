// models/Room.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface IRoom {
  _id: string;
  name: string;
  description?: string;
  creatorId: mongoose.Types.ObjectId;
  creatorName: string;
  isPublic: boolean;
  password?: string; // For private rooms
  maxParticipants: number;
  participants: {
    userId: string;
    userName: string;
    joinedAt: Date;
  }[];
  deleteAt?: Date; // Scheduled deletion timestamp when room becomes empty
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true },
    description: { type: String, maxlength: 200 },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    creatorName: { type: String, required: true },
    isPublic: { type: Boolean, default: true },
    password: { type: String }, // Hashed password for private rooms
    maxParticipants: { type: Number, default: 20 },
    participants: [{
      userId: { type: String, required: true },
      userName: { type: String, required: true },
      joinedAt: { type: Date, default: Date.now }
    }],
    deleteAt: { type: Date }, // Scheduled deletion time (30 seconds after room becomes empty)
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24 hours
  },
  {
    timestamps: true,
  }
);

export const Room = models.Room || model<IRoom>('Room', RoomSchema);