// models/User.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  _id: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string; // For credentials provider
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date },
    image: { type: String },
    password: { type: String }, // Only for credentials login
  },
  {
    timestamps: true,
  }
);

export const User = models.User || model<IUser>('User', UserSchema);