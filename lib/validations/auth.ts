import { z } from "zod";

// Signup validation
export const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

// Signin validation
export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Profile update validation
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
});

// Resend verification validation
export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Types
export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
