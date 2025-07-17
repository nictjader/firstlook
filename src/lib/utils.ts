import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Capitalizes the first letter of each word in a string.
 * Handles space-separated and dash-separated words.
 * @param text The input string.
 * @returns The capitalized string.
 */
export function capitalizeWords(text: string): string {
  if (!text) return "";
  return text
    .split(/[\s-]+/) // Split by spaces or dashes
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}


export function extractBase64FromDataUri(dataUri: string): { base64Data: string; mimeType: string | null } {
  const match = dataUri.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    // Handle cases where the data URI might be malformed or not an image.
    const fallbackMatch = dataUri.match(/^data:([^;]+);base64,(.+)$/);
    if (fallbackMatch) {
      console.warn(`Unexpected MIME type in data URI: ${fallbackMatch[1]}`);
      return { mimeType: fallbackMatch[1], base64Data: fallbackMatch[2] };
    }
    console.error('Invalid data URI format received:', dataUri);
    throw new Error('Invalid data URI format');
  }
  return { mimeType: match[1], base64Data: match[2] };
}
