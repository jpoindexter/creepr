/**
 * Comprehensive Design System Auditor
 * Re-exports from modular auditor package
 *
 * This file provides backward compatibility for existing imports.
 * For new code, import directly from '@/lib/auditor'.
 */

export type {
  AuditViolation,
  Inconsistency,
  InconsistencySummary,
  AuditCategory,
  DesignSystemAuditReport,
} from "./auditor";

export {
  AUDIT_PATTERNS,
  findPatterns,
  countUniquePatterns,
  extractPatternBase,
  detectCategoryInconsistencies,
  detectAllInconsistencies,
  createEmptyReport,
  runDesignSystemAudit,
  exportAuditToMarkdown,
} from "./auditor";
