import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Masks an email address for privacy protection
 * Example: "user@example.com" -> "us***@example.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '***';
  
  const [user, domain] = email.split('@');
  if (!user || !domain) return '***';
  
  const visibleChars = Math.min(2, user.length);
  return `${user.slice(0, visibleChars)}***@${domain}`;
}

/**
 * Masks a username for privacy protection
 * Example: "PlayerName123" -> "Pl***123"
 */
export function maskUsername(username: string | null | undefined): string {
  if (!username) return '***';
  if (username.length <= 4) return '****';
  
  const start = username.slice(0, 2);
  const end = username.slice(-3);
  return `${start}***${end}`;
}

/**
 * Masks a user ID by showing only the first 8 characters
 * Example: "123e4567-e89b-12d3-a456-426614174000" -> "123e4567-..."
 */
export function maskUserId(userId: string | null | undefined): string {
  if (!userId) return '***';
  if (userId.length <= 8) return userId;
  
  return `${userId.slice(0, 8)}...`;
}
