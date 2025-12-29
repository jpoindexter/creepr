/**
 * Markdown Report Helper Functions
 */

import type { PageInfo } from "../../crawler/types";
import type {
  ReportData,
  UrlPattern,
  ErrorBreakdown,
  FixRecommendation,
  DetectedPattern,
} from "./types";

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function getStatusText(statusCode: number): string {
  const statusTexts: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    408: "Request Timeout",
    410: "Gone",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
  };

  return statusTexts[statusCode] || "Unknown Error";
}

export function getSeverityBadge(severity: string): string {
  const badges: Record<string, string> = {
    critical: "🔴 CRITICAL",
    high: "🟠 HIGH",
    medium: "🟡 MEDIUM",
    low: "🟢 LOW",
  };
  return badges[severity] || severity.toUpperCase();
}

export function getPriorityBadge(priority: string): string {
  const badges: Record<string, string> = {
    critical: "🔴 CRITICAL",
    high: "🟠 HIGH",
    medium: "🟡 MEDIUM",
    low: "🟢 LOW",
  };
  return badges[priority] || priority.toUpperCase();
}

export function groupByPathPattern(pages: PageInfo[]): UrlPattern[] {
  const patterns: Map<string, string[]> = new Map();

  pages.forEach((page) => {
    try {
      const url = new URL(page.url);
      const pathParts = url.pathname.split("/").filter(Boolean);

      const pattern = pathParts
        .map((part) => {
          if (/^\d+$/.test(part)) return "*";
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(part))
            return "*";
          if (/^[a-z0-9]{20,}$/i.test(part)) return "*";
          return part;
        })
        .join("/");

      const patternKey = `/${pattern}`;
      if (!patterns.has(patternKey)) {
        patterns.set(patternKey, []);
      }
      patterns.get(patternKey)!.push(page.url);
    } catch {
      // Skip invalid URLs
    }
  });

  const result: UrlPattern[] = Array.from(patterns.entries())
    .map(([pattern, urls]) => {
      let severity: "critical" | "high" | "medium" | "low";
      if (urls.length >= 10) {
        severity = "critical";
      } else if (urls.length >= 5) {
        severity = "high";
      } else if (urls.length >= 3) {
        severity = "medium";
      } else {
        severity = "low";
      }

      return { pattern, count: urls.length, urls, severity };
    })
    .sort((a, b) => b.count - a.count);

  return result;
}

export function groupByErrorType(pages: PageInfo[]): ErrorBreakdown[] {
  const errors: Map<number, string[]> = new Map();

  pages.forEach((page) => {
    if (!errors.has(page.statusCode)) {
      errors.set(page.statusCode, []);
    }
    errors.get(page.statusCode)!.push(page.url);
  });

  return Array.from(errors.entries())
    .map(([status, urls]) => ({
      status,
      statusText: getStatusText(status),
      count: urls.length,
      urls,
    }))
    .sort((a, b) => b.count - a.count);
}

export function detectCommonPatterns(pages: PageInfo[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  const oldCategoryPattern = pages.filter(
    (p) => p.url.includes("/old/") || p.url.includes("/archive/")
  );
  if (oldCategoryPattern.length > 0) {
    patterns.push({
      description: "Old/Archive Category Structure",
      count: oldCategoryPattern.length,
      examples: oldCategoryPattern.slice(0, 5).map((p) => p.url),
      rootCause: "URLs reference deprecated category paths that were restructured",
    });
  }

  const missingExtensions = pages.filter((p) => {
    const url = p.url.toLowerCase();
    return !url.endsWith("/") && !url.match(/\.(html|php|aspx|jsp|htm)$/);
  });
  if (missingExtensions.length >= 3) {
    patterns.push({
      description: "Missing File Extensions",
      count: missingExtensions.length,
      examples: missingExtensions.slice(0, 5).map((p) => p.url),
      rootCause: "URLs missing expected file extensions (possibly from CMS migration)",
    });
  }

  const queryParamIssues = pages.filter(
    (p) => p.url.includes("?") && new URL(p.url).searchParams.toString().length > 0
  );
  if (queryParamIssues.length >= 3) {
    patterns.push({
      description: "Query Parameter Issues",
      count: queryParamIssues.length,
      examples: queryParamIssues.slice(0, 5).map((p) => p.url),
      rootCause: "Dynamic URLs with query parameters returning 404 (routing configuration issue)",
    });
  }

  const trailingSlashIssues = pages.filter((p) => {
    const url = p.url;
    const hasTrailingSlash = url.endsWith("/");
    return hasTrailingSlash || !url.match(/\.[a-z]{2,4}$/i);
  });
  if (trailingSlashIssues.length >= 5) {
    patterns.push({
      description: "Trailing Slash Inconsistency",
      count: trailingSlashIssues.length,
      examples: trailingSlashIssues.slice(0, 5).map((p) => p.url),
      rootCause: "Server not handling trailing slashes consistently (needs redirect rules)",
    });
  }

  const caseSensitivityIssues = pages.filter((p) => p.url.match(/[A-Z]/));
  if (caseSensitivityIssues.length >= 3) {
    patterns.push({
      description: "Case Sensitivity Issues",
      count: caseSensitivityIssues.length,
      examples: caseSensitivityIssues.slice(0, 5).map((p) => p.url),
      rootCause: "URLs with uppercase letters failing (server is case-sensitive)",
    });
  }

  return patterns;
}

export function generateRecommendations(data: ReportData): FixRecommendation[] {
  const brokenUrls = data.crawlResults.filter((page) => page.statusCode >= 400);
  const recommendations: FixRecommendation[] = [];

  const byStatus = groupByErrorType(brokenUrls);

  const notFoundUrls = byStatus.find((e) => e.status === 404);
  if (notFoundUrls && notFoundUrls.count > 0) {
    recommendations.push({
      category: "Implement 301 Redirects",
      priority:
        notFoundUrls.count >= 20 ? "critical" : notFoundUrls.count >= 10 ? "high" : "medium",
      action: "Create redirect rules mapping old URLs to new locations",
      affectedUrls: notFoundUrls.urls,
      estimatedEffort: `${Math.ceil(notFoundUrls.count / 10)} hours (bulk redirect setup)`,
    });
  }

  const internalBrokenLinks = data.sourceLinks.filter((link) =>
    link.brokenUrl.includes(data.baseUrl)
  );
  if (internalBrokenLinks.length > 0) {
    const uniqueBrokenUrls = Array.from(new Set(internalBrokenLinks.map((l) => l.brokenUrl)));
    recommendations.push({
      category: "Update Internal Links",
      priority: uniqueBrokenUrls.length >= 15 ? "high" : "medium",
      action: "Update hardcoded links in templates, components, and content files",
      affectedUrls: uniqueBrokenUrls,
      estimatedEffort: `${Math.ceil(internalBrokenLinks.length / 20)} hours (search & replace)`,
    });
  }

  const serverErrors = byStatus.find((e) => e.status >= 500);
  if (serverErrors && serverErrors.count > 0) {
    recommendations.push({
      category: "Fix Server Errors",
      priority: "critical",
      action: "Investigate and resolve server-side errors causing 5xx responses",
      affectedUrls: serverErrors.urls,
      estimatedEffort: `${Math.ceil(serverErrors.count / 5)} hours (debugging & fixes)`,
    });
  }

  if (brokenUrls.length >= 5) {
    recommendations.push({
      category: "Update XML Sitemap",
      priority: "medium",
      action: "Remove broken URLs from sitemap.xml to prevent search engine indexing issues",
      affectedUrls: brokenUrls.slice(0, 10).map((p) => p.url),
      estimatedEffort: "30 minutes (sitemap regeneration)",
    });
  }

  if (notFoundUrls && notFoundUrls.count >= 10) {
    recommendations.push({
      category: "Enhance 404 Experience",
      priority: "low",
      action: "Create helpful custom 404 page with search, popular links, and contact info",
      affectedUrls: ["All 404 URLs"],
      estimatedEffort: "2-4 hours (design & implementation)",
    });
  }

  return recommendations;
}
