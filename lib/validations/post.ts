// lib/validations/post.ts
import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content must be less than 5000 characters"),
  images: z.array(z.string().url()).max(4, "Maximum 4 images allowed").optional(),
  tags: z.array(z.string().max(30)).max(10, "Maximum 10 tags allowed").optional(),
});

export const addCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be less than 1000 characters"),
});

export const addReactionSchema = z.object({
  type: z.enum(['like']),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type AddReactionInput = z.infer<typeof addReactionSchema>;