/**
 * Markdown Report Generator
 * Modular markdown report generation for 404 audits
 */

export type {
  SourceLink,
  ReportData,
  UrlPattern,
  ErrorBreakdown,
  FixRecommendation,
  DetectedPattern,
} from "./types";

export {
  formatDuration,
  getStatusText,
  getSeverityBadge,
  getPriorityBadge,
  groupByPathPattern,
  groupByErrorType,
  detectCommonPatterns,
  generateRecommendations,
} from "./helpers";

export {
  generateHeader,
  generateExecutiveSummary,
  generateBrokenUrlsByCategory,
  generateBrokenUrlsByErrorType,
  generatePatternAnalysis,
  generateFixRecommendations,
  generateSourceReferences,
  generateAppendix,
} from "./sections";

import type { ReportData } from "./types";
import {
  generateHeader,
  generateExecutiveSummary,
  generateBrokenUrlsByCategory,
  generateBrokenUrlsByErrorType,
  generatePatternAnalysis,
  generateFixRecommendations,
  generateSourceReferences,
  generateAppendix,
} from "./sections";

/**
 * Generate a comprehensive markdown report for 404 audit
 */
export function generateMarkdownReport(data: ReportData): string {
  const sections: string[] = [];

  sections.push(generateHeader(data));
  sections.push(generateExecutiveSummary(data));
  sections.push(generateBrokenUrlsByCategory(data));
  sections.push(generateBrokenUrlsByErrorType(data));
  sections.push(generatePatternAnalysis(data));
  sections.push(generateFixRecommendations(data));
  sections.push(generateSourceReferences(data));
  sections.push(generateAppendix(data));

  return sections.join("\n\n---\n\n");
}
