// models/Session.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface ISession {
  sessionToken: string;
  userId: mongoose.Types.ObjectId;
  expires: Date;
}

const SessionSchema = new Schema<ISession>({
  sessionToken: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expires: { type: Date, required: true },
});

export const Session = models.Session || model<ISession>('Session', SessionSchema);