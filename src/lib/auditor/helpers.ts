/**
 * Design System Auditor Helper Functions
 */

import type {
  AuditViolation,
  AuditCategory,
  Inconsistency,
  InconsistencySummary,
  DesignSystemAuditReport,
} from "./types";

export function findPatterns(content: string, filePath: string, regex: RegExp): AuditViolation[] {
  const patterns: AuditViolation[] = [];
  const lines = content.split("\n");

  // Reset regex lastIndex for global regex
  regex.lastIndex = 0;

  let match;
  while ((match = regex.exec(content)) !== null) {
    // Find line number
    const textBeforeMatch = content.substring(0, match.index);
    const lineNumber = textBeforeMatch.split("\n").length;
    const lineContent = lines[lineNumber - 1] || "";

    // Find column
    const lastNewlineIndex = textBeforeMatch.lastIndexOf("\n");
    const column = match.index - lastNewlineIndex;

    patterns.push({
      file: filePath,
      line: lineNumber,
      column,
      code: match[0],
      context: lineContent.trim().substring(0, 100),
    });
  }

  return patterns;
}

export function countUniquePatterns(violations: AuditViolation[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const v of violations) {
    counts[v.code] = (counts[v.code] || 0) + 1;
  }
  return counts;
}

/**
 * Extract the base pattern from a class name.
 * Examples:
 *   "rounded-lg" -> "rounded"
 *   "p-4" -> "p"
 *   "text-gray-500" -> "text-gray" (color group)
 *   "bg-blue-600" -> "bg-blue" (color group)
 */
export function extractPatternBase(code: string): string {
  // Color patterns - group by color name (e.g., bg-blue, text-gray)
  const colorMatch = code.match(/^(bg|text|border|ring|outline|divide|from|via|to)-([a-z]+)/);
  if (colorMatch) {
    return `${colorMatch[1]}-${colorMatch[2]}`;
  }

  // Spacing patterns - group by direction (e.g., p, px, py, pt)
  const spacingMatch = code.match(/^(-?[pm][xytrbl]?)-/);
  if (spacingMatch) {
    return spacingMatch[1];
  }

  // Sizing patterns - group by dimension (w, h, max-w, etc.)
  const sizingMatch = code.match(/^(min-|max-)?(w|h)-/);
  if (sizingMatch) {
    return `${sizingMatch[1] || ""}${sizingMatch[2]}`;
  }

  // Rounded patterns - all are one group
  if (code.startsWith("rounded")) {
    return "rounded";
  }

  // Shadow patterns - all are one group
  if (code.startsWith("shadow")) {
    return "shadow";
  }

  // Font size - group text sizes
  const textSizeMatch = code.match(/^text-(xs|sm|base|lg|xl|[2-9]xl)/);
  if (textSizeMatch) {
    return "text-size";
  }

  // Gap patterns
  if (code.startsWith("gap")) {
    return "gap";
  }

  // Z-index patterns
  if (code.startsWith("z-")) {
    return "z-index";
  }

  // Default: use the first segment before "-" or the whole code
  const dashIndex = code.indexOf("-");
  return dashIndex > 0 ? code.substring(0, dashIndex) : code;
}

/**
 * Detect actual inconsistencies in a category.
 * An inconsistency is when:
 * 1. Multiple different patterns are used for the same styling purpose
 * 2. There's a clear dominant pattern (>50% usage) with outliers
 */
export function detectCategoryInconsistencies(
  categoryName: string,
  categoryDescription: string,
  violations: AuditViolation[]
): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];

  if (violations.length < 2) return inconsistencies;

  // Count unique patterns
  const patternCounts = countUniquePatterns(violations);
  const uniquePatterns = Object.keys(patternCounts);

  // If only one pattern, no inconsistency
  if (uniquePatterns.length <= 1) return inconsistencies;

  // Group violations by their pattern for file references
  const violationsByPattern = new Map<string, AuditViolation[]>();
  for (const v of violations) {
    if (!violationsByPattern.has(v.code)) {
      violationsByPattern.set(v.code, []);
    }
    violationsByPattern.get(v.code)!.push(v);
  }

  // Group patterns by their base type
  const baseGroups = new Map<string, string[]>();
  for (const pattern of uniquePatterns) {
    const base = extractPatternBase(pattern);
    if (!baseGroups.has(base)) {
      baseGroups.set(base, []);
    }
    baseGroups.get(base)!.push(pattern);
  }

  // Check each base group for inconsistencies
  for (const [base, patterns] of baseGroups) {
    if (patterns.length < 2) continue;

    // Calculate totals for this group
    const groupTotal = patterns.reduce((sum, p) => sum + patternCounts[p], 0);

    // Sort by count descending
    const sortedPatterns = patterns.sort((a, b) => patternCounts[b] - patternCounts[a]);

    const dominantPattern = sortedPatterns[0];
    const dominantCount = patternCounts[dominantPattern];
    const dominantPercentage = Math.round((dominantCount / groupTotal) * 100);

    // Only flag as inconsistency if:
    // 1. There are multiple variants (patterns.length > 1)
    // 2. AND either:
    //    a. There's a clear dominant pattern (>60%) with outliers
    //    b. OR the distribution is too fragmented (no pattern > 40% and many variants)
    const outlierPatterns = sortedPatterns.slice(1);
    const hasSignificantOutliers = outlierPatterns.some(
      (p) => patternCounts[p] >= 2 // At least 2 occurrences to be significant
    );

    if (!hasSignificantOutliers) continue;

    // Determine severity
    let severity: "critical" | "warning" | "info";
    if (dominantPercentage >= 70 && outlierPatterns.length > 0) {
      // Clear dominant with outliers - likely accidental inconsistency
      severity = "warning";
    } else if (dominantPercentage < 40 && patterns.length >= 3) {
      // Highly fragmented - no clear standard
      severity = "critical";
    } else {
      severity = "info";
    }

    // Build outliers list
    const outliers = outlierPatterns
      .filter((p) => patternCounts[p] >= 2)
      .map((pattern) => {
        const count = patternCounts[pattern];
        const percentage = Math.round((count / groupTotal) * 100);
        const patternViolations = violationsByPattern.get(pattern) || [];

        return {
          pattern,
          count,
          percentage,
          files: patternViolations.slice(0, 5).map((v) => ({
            file: v.file,
            line: v.line,
          })),
        };
      });

    if (outliers.length === 0) continue;

    // Generate recommendation
    let recommendation: string;
    if (dominantPercentage >= 60) {
      recommendation = `Standardize on \`${dominantPattern}\` (currently ${dominantPercentage}% of usage). Update ${outliers.reduce((sum, o) => sum + o.count, 0)} outlier occurrences.`;
    } else {
      recommendation = `Define a standard for ${base} patterns. Consider using \`${dominantPattern}\` as the base and update inconsistent usages.`;
    }

    inconsistencies.push({
      category: categoryName,
      description: `${categoryDescription}: Multiple "${base}" variants detected`,
      dominantPattern,
      dominantCount,
      dominantPercentage,
      outliers,
      severity,
      recommendation,
    });
  }

  return inconsistencies;
}

/**
 * Detect inconsistencies across all categories
 */
export function detectAllInconsistencies(
  categories: DesignSystemAuditReport["categories"]
): InconsistencySummary {
  const allInconsistencies: Inconsistency[] = [];

  // Map of category groups to human-readable names
  const categoryNames: Record<string, string> = {
    colors: "Colors",
    spacing: "Spacing",
    sizing: "Sizing",
    borderRadius: "Border Radius",
    borders: "Borders",
    shadows: "Shadows",
    typography: "Typography",
    layout: "Layout",
    effects: "Effects",
  };

  // Process each category group
  for (const [groupKey, groupName] of Object.entries(categoryNames)) {
    const categoryGroup = categories[groupKey as keyof typeof categories];
    if (!categoryGroup) continue;

    // Combine all violations in this group for better analysis
    for (const [, category] of Object.entries(categoryGroup as Record<string, AuditCategory>)) {
      if (category.count < 2) continue;

      const inconsistencies = detectCategoryInconsistencies(
        groupName,
        category.description,
        category.violations
      );

      allInconsistencies.push(...inconsistencies);
    }
  }

  // Sort by severity (critical > warning > info)
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  allInconsistencies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    totalInconsistencies: allInconsistencies.length,
    critical: allInconsistencies.filter((i) => i.severity === "critical").length,
    warning: allInconsistencies.filter((i) => i.severity === "warning").length,
    info: allInconsistencies.filter((i) => i.severity === "info").length,
    inconsistencies: allInconsistencies,
  };
}
