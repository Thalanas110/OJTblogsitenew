import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import DOMPurify from 'dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes all scripts and dangerous attributes
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    KEEP_CONTENT: true,
  });
}

/**
 * Escape plain text to prevent HTML injection
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validate image URL is from trusted sources
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow https
    if (parsed.protocol !== 'https:') return false;
    // Whitelist trusted image hosts
    const allowedHosts = ['img.youtube.com', 'cdn.example.com', 'images.unsplash.com'];
    return allowedHosts.some(host => parsed.hostname.includes(host)) || parsed.hostname.endsWith('.cloudinary.com');
  } catch {
    return false;
  }
}

/**
 * Validate YouTube URL and extract video ID
 */
export function validateAndExtractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return null;
    
    // youtu.be/VIDEO_ID
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1).split("?")[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    
    // youtube.com/watch?v=VIDEO_ID
    if (parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
      // youtube.com/embed/VIDEO_ID
      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/)?.[1];
        return id || null;
      }
    }
  } catch {
    // invalid URL
  }
  return null;
}
