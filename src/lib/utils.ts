import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// URL utilities
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isSameDomain(url1: string, url2: string): boolean {
  try {
    const u1 = new URL(url1);
    const u2 = new URL(url2);
    return u1.hostname === u2.hostname;
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Remove trailing slash and hash
    u.hash = "";
    let pathname = u.pathname;
    if (pathname.endsWith("/") && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }
    u.pathname = pathname;
    return u.toString();
  } catch {
    return url;
  }
}

// Status code utilities
export function getStatusColor(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return "#10b981"; // Green
  if (statusCode >= 300 && statusCode < 400) return "#f59e0b"; // Orange
  if (statusCode >= 400 && statusCode < 500) return "#ef4444"; // Red
  if (statusCode >= 500) return "#dc2626"; // Dark red
  return "#6b7280"; // Gray
}

export function isBrokenLink(statusCode: number): boolean {
  return statusCode >= 400;
}

// Format utilities
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
