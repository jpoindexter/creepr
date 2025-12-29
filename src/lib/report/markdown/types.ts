/**
 * Markdown Report Types
 */

import type { PageInfo } from "../../crawler/types";

export interface SourceLink {
  brokenUrl: string;
  referrerUrl: string;
  referrerTitle: string;
}

export interface ReportData {
  crawlResults: PageInfo[];
  sourceLinks: SourceLink[];
  baseUrl: string;
  timestamp: Date;
  crawlDuration?: number;
}

export interface UrlPattern {
  pattern: string;
  count: number;
  urls: string[];
  severity: "critical" | "high" | "medium" | "low";
}

export interface ErrorBreakdown {
  status: number;
  statusText: string;
  count: number;
  urls: string[];
}

export interface FixRecommendation {
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  action: string;
  affectedUrls: string[];
  estimatedEffort: string;
}

export interface DetectedPattern {
  description: string;
  count: number;
  examples: string[];
  rootCause: string;
}
