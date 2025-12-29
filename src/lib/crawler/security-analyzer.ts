import { SecurityHeaders } from "./types";

/**
 * Security headers to check and their importance
 */
const SECURITY_HEADERS = {
  // Critical headers (high weight)
  "content-security-policy": { name: "Content-Security-Policy", weight: 25 },
  "strict-transport-security": { name: "Strict-Transport-Security", weight: 20 },
  "x-frame-options": { name: "X-Frame-Options", weight: 15 },
  "x-content-type-options": { name: "X-Content-Type-Options", weight: 15 },
  // Important headers (medium weight)
  "referrer-policy": { name: "Referrer-Policy", weight: 10 },
  "permissions-policy": { name: "Permissions-Policy", weight: 10 },
  // Optional headers (low weight)
  "x-xss-protection": { name: "X-XSS-Protection", weight: 3 },
  "cache-control": { name: "Cache-Control", weight: 2 },
} as const;

/**
 * Analyze response headers for security best practices
 */
export function analyzeSecurityHeaders(
  headers: Record<string, string> | null | undefined
): SecurityHeaders {
  const presentHeaders: string[] = [];
  const missingHeaders: string[] = [];
  let score = 0;

  // Normalize header keys to lowercase
  const normalizedHeaders: Record<string, string> = {};
  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      normalizedHeaders[key.toLowerCase()] = value;
    }
  }

  // Check each security header
  for (const [headerKey, config] of Object.entries(SECURITY_HEADERS)) {
    if (normalizedHeaders[headerKey]) {
      presentHeaders.push(config.name);
      score += config.weight;
    } else {
      missingHeaders.push(config.name);
    }
  }

  return {
    contentSecurityPolicy: normalizedHeaders["content-security-policy"],
    strictTransportSecurity: normalizedHeaders["strict-transport-security"],
    xFrameOptions: normalizedHeaders["x-frame-options"],
    xContentTypeOptions: normalizedHeaders["x-content-type-options"],
    referrerPolicy: normalizedHeaders["referrer-policy"],
    permissionsPolicy: normalizedHeaders["permissions-policy"],
    xXssProtection: normalizedHeaders["x-xss-protection"],
    cacheControl: normalizedHeaders["cache-control"],
    score: Math.min(100, score), // Cap at 100
    missingHeaders,
    presentHeaders,
  };
}

/**
 * Get a security grade based on score
 */
export function getSecurityGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}
