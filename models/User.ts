// models/User.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  _id: string;
  name?: string;
  email: string;
  username?: string; // New field
  emailVerified?: Date | null;
  image?: string;
  password?: string;
  bio?: string;
  location?: string;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true }, // sparse allows multiple null values
    emailVerified: { type: Date, default: null },
    image: { type: String },
    password: { type: String },
    bio: { type: String, maxlength: 500 },
    location: { type: String, maxlength: 100 },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Delete the cached model to ensure schema updates are applied
if (models.User) {
  delete models.User;
}

export const User = model<IUser>('User', UserSchema);