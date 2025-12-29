import { PageInfo } from "../crawler/types";

/**
 * Source link reference - where a broken URL is referenced from
 */
export interface SourceLink {
  brokenUrl: string;
  referrerUrl: string;
  referrerTitle: string;
}

/**
 * Report data structure
 */
export interface ReportData {
  crawlResults: PageInfo[];
  sourceLinks: SourceLink[];
  baseUrl: string;
  timestamp: Date;
  crawlDuration?: number; // in milliseconds
}

/**
 * URL pattern analysis result
 */
interface UrlPattern {
  pattern: string;
  count: number;
  urls: string[];
  severity: "critical" | "high" | "medium" | "low";
}

/**
 * Error type breakdown
 */
interface ErrorBreakdown {
  status: number;
  statusText: string;
  count: number;
  urls: string[];
}

/**
 * Fix recommendation
 */
interface FixRecommendation {
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  action: string;
  affectedUrls: string[];
  estimatedEffort: string;
}

/**
 * Generate a comprehensive markdown report for 404 audit
 */
export function generateMarkdownReport(data: ReportData): string {
  const sections: string[] = [];

  // Header
  sections.push(generateHeader(data));

  // Executive Summary
  sections.push(generateExecutiveSummary(data));

  // Broken URLs by Category
  sections.push(generateBrokenUrlsByCategory(data));

  // Broken URLs by Error Type
  sections.push(generateBrokenUrlsByErrorType(data));

  // Pattern Analysis
  sections.push(generatePatternAnalysis(data));

  // Fix Recommendations
  sections.push(generateFixRecommendations(data));

  // Source References
  sections.push(generateSourceReferences(data));

  // Appendix - Full URL List
  sections.push(generateAppendix(data));

  return sections.join("\n\n---\n\n");
}

/**
 * Generate report header
 */
function generateHeader(data: ReportData): string {
  const formattedDate = data.timestamp.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return `# 404 Audit Report

**Website**: ${data.baseUrl}
**Generated**: ${formattedDate}
**Crawl Duration**: ${data.crawlDuration ? formatDuration(data.crawlDuration) : "N/A"}`;
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(data: ReportData): string {
  const totalPages = data.crawlResults.length;
  const brokenUrls = data.crawlResults.filter((page) => page.statusCode >= 400);
  const brokenCount = brokenUrls.length;
  const errorRate = totalPages > 0 ? ((brokenCount / totalPages) * 100).toFixed(1) : "0.0";

  // Error breakdown
  const clientErrors = brokenUrls.filter((p) => p.statusCode >= 400 && p.statusCode < 500).length;
  const serverErrors = brokenUrls.filter((p) => p.statusCode >= 500).length;
  const timeouts = brokenUrls.filter((p) => p.error?.toLowerCase().includes("timeout")).length;

  // Health score (0-100)
  const healthScore = Math.max(0, Math.round(100 - parseFloat(errorRate) * 2));
  const healthEmoji =
    healthScore >= 80 ? "🟢" : healthScore >= 60 ? "🟡" : healthScore >= 40 ? "🟠" : "🔴";

  return `## Executive Summary

${healthEmoji} **Health Score**: ${healthScore}/100

### Overview
- **Total Pages Crawled**: ${totalPages}
- **Broken URLs Found**: ${brokenCount} (${errorRate}% error rate)
- **Client Errors (4xx)**: ${clientErrors}
- **Server Errors (5xx)**: ${serverErrors}
- **Timeouts**: ${timeouts}

### Quick Stats
| Metric | Value |
|--------|-------|
| Total Pages | ${totalPages} |
| Broken URLs | ${brokenCount} |
| Error Rate | ${errorRate}% |
| Client Errors | ${clientErrors} |
| Server Errors | ${serverErrors} |
| Timeouts | ${timeouts} |
| Health Score | ${healthScore}/100 |`;
}

/**
 * Generate broken URLs grouped by category/pattern
 */
function generateBrokenUrlsByCategory(data: ReportData): string {
  const brokenUrls = data.crawlResults.filter((page) => page.statusCode >= 400);

  if (brokenUrls.length === 0) {
    return `## Broken URLs by Category

✅ No broken URLs found! Your site is healthy.`;
  }

  // Group by URL path patterns
  const categories = groupByPathPattern(brokenUrls);

  let output = `## Broken URLs by Category

Found ${brokenUrls.length} broken URLs across ${categories.length} categories:

`;

  categories.forEach((category, index) => {
    output += `### ${index + 1}. ${category.pattern} (${category.count} URLs)\n\n`;
    output += `**Severity**: ${getSeverityBadge(category.severity)}\n\n`;
    output += `**Affected URLs**:\n`;
    category.urls.slice(0, 10).forEach((url) => {
      output += `- ${url}\n`;
    });
    if (category.urls.length > 10) {
      output += `- *...and ${category.urls.length - 10} more*\n`;
    }
    output += "\n";
  });

  return output.trim();
}

/**
 * Generate broken URLs grouped by error type
 */
function generateBrokenUrlsByErrorType(data: ReportData): string {
  const brokenUrls = data.crawlResults.filter((page) => page.statusCode >= 400);

  if (brokenUrls.length === 0) {
    return `## Broken URLs by Error Type

✅ No broken URLs found!`;
  }

  // Group by status code
  const errorBreakdown = groupByErrorType(brokenUrls);

  let output = `## Broken URLs by Error Type

`;

  errorBreakdown.forEach((error) => {
    output += `### ${error.status} ${error.statusText} (${error.count} URLs)\n\n`;
    output += `\`\`\`\n`;
    error.urls.slice(0, 15).forEach((url) => {
      output += `${url}\n`;
    });
    if (error.urls.length > 15) {
      output += `...and ${error.urls.length - 15} more\n`;
    }
    output += `\`\`\`\n\n`;
  });

  return output.trim();
}

/**
 * Generate pattern analysis section
 */
function generatePatternAnalysis(data: ReportData): string {
  const brokenUrls = data.crawlResults.filter((page) => page.statusCode >= 400);

  if (brokenUrls.length === 0) {
    return `## Pattern Analysis

✅ No patterns detected - no broken URLs found.`;
  }

  const patterns = detectCommonPatterns(brokenUrls);

  let output = `## Pattern Analysis

Detected ${patterns.length} common patterns in broken URLs:

`;

  patterns.forEach((pattern, index) => {
    output += `### Pattern ${index + 1}: ${pattern.description}\n\n`;
    output += `**Frequency**: ${pattern.count} occurrences\n\n`;
    output += `**Example URLs**:\n`;
    pattern.examples.slice(0, 5).forEach((url) => {
      output += `- ${url}\n`;
    });
    output += `\n**Root Cause**: ${pattern.rootCause}\n\n`;
  });

  return output.trim();
}

/**
 * Generate fix recommendations
 */
function generateFixRecommendations(data: ReportData): string {
  const brokenUrls = data.crawlResults.filter((page) => page.statusCode >= 400);

  if (brokenUrls.length === 0) {
    return `## Fix Recommendations

✅ No fixes needed - your site is healthy!`;
  }

  const recommendations = generateRecommendations(data);

  let output = `## Fix Recommendations

### Priority Actions

`;

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  recommendations.forEach((rec, index) => {
    const priorityBadge = getPriorityBadge(rec.priority);
    output += `#### ${index + 1}. ${rec.category} ${priorityBadge}\n\n`;
    output += `**Action**: ${rec.action}\n\n`;
    output += `**Affected URLs**: ${rec.affectedUrls.length}\n\n`;
    output += `**Estimated Effort**: ${rec.estimatedEffort}\n\n`;

    if (rec.affectedUrls.length <= 5) {
      output += `**URLs**:\n`;
      rec.affectedUrls.forEach((url) => {
        output += `- ${url}\n`;
      });
    } else {
      output += `**Sample URLs**:\n`;
      rec.affectedUrls.slice(0, 3).forEach((url) => {
        output += `- ${url}\n`;
      });
      output += `- *...and ${rec.affectedUrls.length - 3} more*\n`;
    }
    output += "\n";
  });

  return output.trim();
}

/**
 * Generate source references section
 */
function generateSourceReferences(data: ReportData): string {
  if (data.sourceLinks.length === 0) {
    return `## Source References

ℹ️ No source reference data available.`;
  }

  // Group by broken URL
  const groupedByBroken = data.sourceLinks.reduce(
    (acc, link) => {
      if (!acc[link.brokenUrl]) {
        acc[link.brokenUrl] = [];
      }
      acc[link.brokenUrl].push(link);
      return acc;
    },
    {} as Record<string, SourceLink[]>
  );

  let output = `## Source References

Shows where each broken URL is referenced from:

`;

  Object.entries(groupedByBroken)
    .slice(0, 20)
    .forEach(([brokenUrl, sources]) => {
      output += `### ${brokenUrl}\n\n`;
      output += `Referenced by ${sources.length} page(s):\n\n`;
      sources.slice(0, 10).forEach((source) => {
        output += `- [${source.referrerTitle || "Untitled"}](${source.referrerUrl})\n`;
      });
      if (sources.length > 10) {
        output += `- *...and ${sources.length - 10} more*\n`;
      }
      output += "\n";
    });

  if (Object.keys(groupedByBroken).length > 20) {
    output += `*...and ${Object.keys(groupedByBroken).length - 20} more broken URLs*\n\n`;
  }

  return output.trim();
}

/**
 * Generate appendix with full URL list
 */
function generateAppendix(data: ReportData): string {
  const brokenUrls = data.crawlResults.filter((page) => page.statusCode >= 400);

  if (brokenUrls.length === 0) {
    return `## Appendix: Full URL List

✅ No broken URLs to list.`;
  }

  let output = `## Appendix: Full URL List

Complete list of all broken URLs with status codes:

| # | URL | Status | Error |
|---|-----|--------|-------|
`;

  brokenUrls.forEach((page, index) => {
    const errorMsg = page.error ? page.error.substring(0, 50) : "-";
    output += `| ${index + 1} | ${page.url} | ${page.statusCode} | ${errorMsg} |\n`;
  });

  return output.trim();
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Group broken URLs by path pattern
 */
function groupByPathPattern(pages: PageInfo[]): UrlPattern[] {
  const patterns: Map<string, string[]> = new Map();

  pages.forEach((page) => {
    try {
      const url = new URL(page.url);
      const pathParts = url.pathname.split("/").filter(Boolean);

      // Create pattern by replacing IDs/UUIDs with wildcards
      const pattern = pathParts
        .map((part) => {
          // Replace numbers
          if (/^\d+$/.test(part)) return "*";
          // Replace UUIDs
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(part))
            return "*";
          // Replace long alphanumeric strings (likely IDs)
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

  // Convert to sorted array
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

      return {
        pattern,
        count: urls.length,
        urls,
        severity,
      };
    })
    .sort((a, b) => b.count - a.count);

  return result;
}

/**
 * Group by error type
 */
function groupByErrorType(pages: PageInfo[]): ErrorBreakdown[] {
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

/**
 * Detect common patterns in broken URLs
 */
function detectCommonPatterns(pages: PageInfo[]): Array<{
  description: string;
  count: number;
  examples: string[];
  rootCause: string;
}> {
  const patterns: Array<{
    description: string;
    count: number;
    examples: string[];
    rootCause: string;
  }> = [];

  // Pattern 1: Old category structure
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

  // Pattern 2: Missing file extensions
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

  // Pattern 3: Query parameters causing issues
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

  // Pattern 4: Trailing slash inconsistency
  const trailingSlashIssues = pages.filter((p) => {
    const url = p.url;
    const hasTrailingSlash = url.endsWith("/");
    // Check if removing/adding slash might fix it
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

  // Pattern 5: Case sensitivity issues
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

/**
 * Generate fix recommendations based on broken URLs
 */
function generateRecommendations(data: ReportData): FixRecommendation[] {
  const brokenUrls = data.crawlResults.filter((page) => page.statusCode >= 400);
  const recommendations: FixRecommendation[] = [];

  // Group by status code
  const byStatus = groupByErrorType(brokenUrls);

  // Recommendation 1: 404 redirects
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

  // Recommendation 2: Fix internal links
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

  // Recommendation 3: Server errors
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

  // Recommendation 4: Update sitemap
  if (brokenUrls.length >= 5) {
    recommendations.push({
      category: "Update XML Sitemap",
      priority: "medium",
      action: "Remove broken URLs from sitemap.xml to prevent search engine indexing issues",
      affectedUrls: brokenUrls.slice(0, 10).map((p) => p.url),
      estimatedEffort: "30 minutes (sitemap regeneration)",
    });
  }

  // Recommendation 5: Add custom 404 page
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

/**
 * Get HTTP status text
 */
function getStatusText(statusCode: number): string {
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

/**
 * Format duration in milliseconds to human-readable string
 */
function formatDuration(ms: number): string {
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

/**
 * Get severity badge
 */
function getSeverityBadge(severity: string): string {
  const badges: Record<string, string> = {
    critical: "🔴 CRITICAL",
    high: "🟠 HIGH",
    medium: "🟡 MEDIUM",
    low: "🟢 LOW",
  };
  return badges[severity] || severity.toUpperCase();
}

/**
 * Get priority badge
 */
function getPriorityBadge(priority: string): string {
  const badges: Record<string, string> = {
    critical: "🔴 CRITICAL",
    high: "🟠 HIGH",
    medium: "🟡 MEDIUM",
    low: "🟢 LOW",
  };
  return badges[priority] || priority.toUpperCase();
}
