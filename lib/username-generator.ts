// lib/username-generator.ts
import { User } from "@/models/User";
import { connectDB } from "./db";

/**
 * Generates a unique username based on a base name
 * Format: basename + random alphanumeric string (e.g., jones3a1b2c3d)
 */
export async function generateUniqueUsername(baseName: string): Promise<string> {
  await connectDB();
  
  // Clean the base name (remove special chars, spaces, lowercase)
  const cleanBaseName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10); // Limit base to 10 chars to leave room for suffix
  
  let username = cleanBaseName;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    // Check if username exists
    const existingUser = await User.findOne({ username }).lean();
    
    if (!existingUser) {
      return username;
    }
    
    // Generate random suffix (8 alphanumeric characters)
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    username = cleanBaseName + randomSuffix;
    attempts++;
  }
  
  // Fallback: use timestamp if all attempts fail
  return cleanBaseName + Date.now().toString(36);
}

/**
 * Check if a username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  await connectDB();
  const existingUser = await User.findOne({ username: username.toLowerCase() }).lean();
  return !existingUser;
}