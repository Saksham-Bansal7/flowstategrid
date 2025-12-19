// models/User.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  _id: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
  bio?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date },
    image: { type: String },
    password: { type: String },
    bio: { type: String, maxlength: 500 },
    location: { type: String, maxlength: 100 },
  },
  {
    timestamps: true,
  }
);

export const User = models.User || model<IUser>('User', UserSchema);