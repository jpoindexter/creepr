/**
 * Markdown Report Generator
 * Re-exports from modular markdown package for backward compatibility.
 */

export { generateMarkdownReport } from "./markdown/index";
export type {
  SourceLink,
  ReportData,
  UrlPattern,
  ErrorBreakdown,
  FixRecommendation,
  DetectedPattern,
} from "./markdown/index";
