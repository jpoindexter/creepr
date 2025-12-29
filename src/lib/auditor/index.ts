/**
 * Design System Auditor
 * Comprehensive pattern detection for design systems
 */

// Re-export all types
export type {
  AuditViolation,
  Inconsistency,
  InconsistencySummary,
  AuditCategory,
  DesignSystemAuditReport,
} from "./types";

// Re-export patterns
export { AUDIT_PATTERNS } from "./patterns";

// Re-export helpers
export {
  findPatterns,
  countUniquePatterns,
  extractPatternBase,
  detectCategoryInconsistencies,
  detectAllInconsistencies,
} from "./helpers";

// Re-export factory
export { createEmptyReport } from "./report-factory";

// Re-export main functions
export { runDesignSystemAudit } from "./run-audit";
export { exportAuditToMarkdown } from "./markdown-exporter";
