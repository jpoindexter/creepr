/**
 * Markdown Report Section Generators
 */

import type { ReportData, SourceLink } from "./types";
import {
  formatDuration,
  getSeverityBadge,
  getPriorityBadge,
  groupByPathPattern,
  groupByErrorType,
  detectCommonPatterns,
  generateRecommendations,
} from "./helpers";

export function generateHeader(data: ReportData): string {
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

export function generateExecutiveSummary(data: ReportData): string {
  const totalPages = data.crawlResults.length;
  const brokenUrls = data.crawlResults.filter((page) => page.statusCode >= 400);
  const brokenCount = brokenUrls.length;
  const errorRate = totalPages > 0 ? ((brokenCount / totalPages) * 100).toFixed(1) : "0.0";

  const clientErrors = brokenUrls.filter((p) => p.statusCode >= 400 && p.statusCode < 500).length;
  const serverErrors = brokenUrls.filter((p) => p.statusCode >= 500).length;
  const timeouts = brokenUrls.filter((p) => p.error?.toLowerCase().includes("timeout")).length;

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

export function generateBrokenUrlsByCategory(data: ReportData): string {
  const brokenUrls = data.crawlResults.filter((page) => page.statusCode >= 400);

  if (brokenUrls.length === 0) {
    return `## Broken URLs by Category

✅ No broken URLs found! Your site is healthy.`;
  }

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

export function generateBrokenUrlsByErrorType(data: ReportData): string {
  const brokenUrls = data.crawlResults.filter((page) => page.statusCode >= 400);

  if (brokenUrls.length === 0) {
    return `## Broken URLs by Error Type

✅ No broken URLs found!`;
  }

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

export function generatePatternAnalysis(data: ReportData): string {
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

export function generateFixRecommendations(data: ReportData): string {
  const brokenUrls = data.crawlResults.filter((page) => page.statusCode >= 400);

  if (brokenUrls.length === 0) {
    return `## Fix Recommendations

✅ No fixes needed - your site is healthy!`;
  }

  const recommendations = generateRecommendations(data);

  let output = `## Fix Recommendations

### Priority Actions

`;

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort(
    (a, b) =>
      priorityOrder[a.priority as keyof typeof priorityOrder] -
      priorityOrder[b.priority as keyof typeof priorityOrder]
  );

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

export function generateSourceReferences(data: ReportData): string {
  if (data.sourceLinks.length === 0) {
    return `## Source References

ℹ️ No source reference data available.`;
  }

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

export function generateAppendix(data: ReportData): string {
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
