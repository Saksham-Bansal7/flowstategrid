// models/Post.ts
import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IReaction {
  userId: string;
  type: 'like';
  createdAt: Date;
}

export interface IComment {
  _id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPost extends Document {
  userId: string;
  username: string;
  content: string;
  images?: string[];
  tags?: string[];
  reactions: IReaction[];
  comments: IComment[];
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<IReaction>({
  userId: { type: String, required: true },
  type: { type: String, enum: ['like'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: String, required: true },
    content: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const PostSchema = new Schema<IPost>(
  {
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true, index: true },
    content: { type: String, required: true, maxlength: 5000 },
    images: [{ type: String }],
    tags: [{ type: String, maxlength: 30 }],
    reactions: [ReactionSchema],
    comments: [CommentSchema],
    viewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
PostSchema.index({ createdAt: -1 });
PostSchema.index({ 'reactions.createdAt': -1 });

// Delete the cached model to ensure schema updates are applied
if (models.Post) {
  delete models.Post;
}

export const Post = model<IPost>('Post', PostSchema);