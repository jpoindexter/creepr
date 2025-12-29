import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// URL utilities

// Dangerous URL protocols that should be blocked for security
const BLOCKED_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:"];

/**
 * Check if a URL is valid and safe (not using dangerous protocols)
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Block dangerous protocols
    if (BLOCKED_PROTOCOLS.some((proto) => parsed.protocol === proto)) {
      return false;
    }
    // Only allow http and https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a URL uses a potentially dangerous protocol
 */
export function isDangerousUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return BLOCKED_PROTOCOLS.some((proto) => parsed.protocol === proto);
  } catch {
    // If we can't parse, check string prefix as fallback
    const lower = url.toLowerCase().trim();
    return BLOCKED_PROTOCOLS.some((proto) => lower.startsWith(proto));
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
    // Strip authentication credentials for security
    u.username = "";
    u.password = "";
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

/**
 * Extract the parent URL from a URL based on its path
 * Example: http://localhost:3000/blog/posts/article -> http://localhost:3000/blog/posts
 */
export function getPathParent(url: string): string | null {
  try {
    const u = new URL(url);
    const pathname = u.pathname;

    // Root path has no parent
    if (pathname === "/" || pathname === "") {
      return null;
    }

    // Remove trailing slash if present
    const cleanPath = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

    // Get parent path
    const lastSlash = cleanPath.lastIndexOf("/");
    if (lastSlash === -1 || lastSlash === 0) {
      // Parent is root
      u.pathname = "/";
      return u.toString();
    }

    // Parent is the path up to the last slash
    u.pathname = cleanPath.slice(0, lastSlash);
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Split a URL path into segments
 * Example: http://localhost:3000/blog/posts/article -> ['blog', 'posts', 'article']
 */
export function getPathSegments(url: string): string[] {
  try {
    const u = new URL(url);
    const pathname = u.pathname;

    // Remove leading and trailing slashes
    const cleanPath = pathname.replace(/^\/|\/$/g, "");

    if (!cleanPath) {
      return [];
    }

    return cleanPath.split("/");
  } catch {
    return [];
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

// SEO Score Calculation
export interface SEOScoreResult {
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  issues: string[];
  passed: string[];
}

export interface SEOPageData {
  title?: string;
  meta?: {
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonical?: string;
    robots?: string;
  };
  headings?: Array<{ tag: string; text: string }>;
  images?: Array<{ hasAlt: boolean }>;
  contentMetrics?: {
    wordCount: number;
  };
}

export function calculateSEOScore(page: SEOPageData): SEOScoreResult {
  const issues: string[] = [];
  const passed: string[] = [];
  let score = 0;
  const maxScore = 100;

  // Title checks (20 points)
  if (page.title && page.title.trim() !== "Untitled") {
    const titleLen = page.title.length;
    if (titleLen >= 30 && titleLen <= 60) {
      score += 20;
      passed.push("Title length is optimal (30-60 chars)");
    } else if (titleLen > 0 && titleLen < 30) {
      score += 10;
      issues.push(`Title too short (${titleLen} chars, aim for 30-60)`);
    } else if (titleLen > 60) {
      score += 15;
      issues.push(`Title too long (${titleLen} chars, may be truncated in search)`);
    }
  } else {
    issues.push("Missing page title");
  }

  // Meta description (15 points)
  if (page.meta?.description) {
    const descLen = page.meta.description.length;
    if (descLen >= 120 && descLen <= 160) {
      score += 15;
      passed.push("Meta description length is optimal");
    } else if (descLen > 0 && descLen < 120) {
      score += 8;
      issues.push(`Meta description too short (${descLen} chars, aim for 120-160)`);
    } else if (descLen > 160) {
      score += 10;
      issues.push(`Meta description too long (${descLen} chars, may be truncated)`);
    }
  } else {
    issues.push("Missing meta description");
  }

  // H1 heading (15 points)
  const h1s = page.headings?.filter((h) => h.tag === "h1") || [];
  if (h1s.length === 1) {
    score += 15;
    passed.push("Page has exactly one H1 heading");
  } else if (h1s.length === 0) {
    issues.push("Missing H1 heading");
  } else {
    score += 5;
    issues.push(`Multiple H1 headings found (${h1s.length})`);
  }

  // Open Graph tags (15 points)
  let ogScore = 0;
  if (page.meta?.ogTitle) ogScore += 5;
  if (page.meta?.ogDescription) ogScore += 5;
  if (page.meta?.ogImage) ogScore += 5;
  score += ogScore;
  if (ogScore === 15) {
    passed.push("All Open Graph tags present");
  } else if (ogScore > 0) {
    issues.push("Some Open Graph tags missing");
  } else {
    issues.push("No Open Graph tags found");
  }

  // Canonical URL (10 points)
  if (page.meta?.canonical) {
    score += 10;
    passed.push("Canonical URL is set");
  } else {
    issues.push("Missing canonical URL");
  }

  // Image alt texts (15 points)
  const images = page.images || [];
  if (images.length === 0) {
    score += 15; // No images = no issue
    passed.push("No images to check");
  } else {
    const withAlt = images.filter((img) => img.hasAlt).length;
    const altPercent = (withAlt / images.length) * 100;
    if (altPercent === 100) {
      score += 15;
      passed.push("All images have alt text");
    } else if (altPercent >= 80) {
      score += 10;
      issues.push(`${images.length - withAlt} images missing alt text`);
    } else {
      score += 5;
      issues.push(`Many images (${images.length - withAlt}) missing alt text`);
    }
  }

  // Content length (10 points)
  const wordCount = page.contentMetrics?.wordCount || 0;
  if (wordCount >= 300) {
    score += 10;
    passed.push(`Good content length (${wordCount} words)`);
  } else if (wordCount >= 100) {
    score += 5;
    issues.push(`Light content (${wordCount} words, aim for 300+)`);
  } else {
    issues.push(`Very light content (${wordCount} words)`);
  }

  // Calculate grade
  let grade: "A" | "B" | "C" | "D" | "F";
  if (score >= 90) grade = "A";
  else if (score >= 80) grade = "B";
  else if (score >= 70) grade = "C";
  else if (score >= 60) grade = "D";
  else grade = "F";

  return {
    score: Math.min(score, maxScore),
    grade,
    issues,
    passed,
  };
}
