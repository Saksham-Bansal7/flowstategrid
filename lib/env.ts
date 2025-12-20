import { z } from "zod";

const envSchema = z.object({
  // Database
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  
  // OAuth (optional)
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Email (optional)
  RESEND_API_KEY: z.string().optional(),
  
  // Groq (optional)
  GROQ_API_KEY: z.string().optional(),
});

// Validate environment variables
export const env = envSchema.parse(process.env);

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
