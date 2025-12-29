/**
 * Design System Audit Markdown Exporter
 * Exports audit reports to Markdown format
 */

import type { AuditCategory, DesignSystemAuditReport } from "./types";
import { countUniquePatterns } from "./helpers";

export function exportAuditToMarkdown(report: DesignSystemAuditReport): string {
  const lines: string[] = [];

  lines.push("# Design System Audit Report");
  lines.push("");
  lines.push(`**Generated:** ${new Date(report.generatedAt).toLocaleString()}`);
  lines.push(`**Files Scanned:** ${report.totalFiles}`);
  lines.push(`**Total Patterns Found:** ${report.totalPatterns}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push("");
  lines.push(report.summary);
  lines.push("");

  // Inconsistencies Section - Primary focus
  if (report.inconsistencies && report.inconsistencies.totalInconsistencies > 0) {
    lines.push("## Design System Inconsistencies");
    lines.push("");
    lines.push(`Found **${report.inconsistencies.totalInconsistencies}** inconsistencies:`);
    lines.push(`- ${report.inconsistencies.critical} Critical`);
    lines.push(`- ${report.inconsistencies.warning} Warnings`);
    lines.push(`- ${report.inconsistencies.info} Info`);
    lines.push("");

    // Group by severity
    const severityOrder = ["critical", "warning", "info"] as const;

    for (const severity of severityOrder) {
      const items = report.inconsistencies.inconsistencies.filter((i) => i.severity === severity);
      if (items.length === 0) continue;

      const emoji = severity === "critical" ? "🔴" : severity === "warning" ? "🟡" : "🔵";
      lines.push(
        `### ${emoji} ${severity.charAt(0).toUpperCase() + severity.slice(1)} (${items.length})`
      );
      lines.push("");

      for (const inc of items) {
        lines.push(`#### ${inc.description}`);
        lines.push("");
        lines.push(`**Recommendation:** ${inc.recommendation}`);
        lines.push("");
        lines.push(
          `**Dominant pattern:** \`${inc.dominantPattern}\` (${inc.dominantCount}x, ${inc.dominantPercentage}%)`
        );
        lines.push("");
        lines.push("**Outliers to fix:**");
        lines.push("");
        lines.push("| Pattern | Count | % | Locations |");
        lines.push("|---------|-------|---|-----------|");

        for (const outlier of inc.outliers) {
          const locations = outlier.files
            .slice(0, 3)
            .map((f) => `${f.file}:${f.line}`)
            .join(", ");
          const more = outlier.files.length > 3 ? ` (+${outlier.files.length - 3} more)` : "";
          lines.push(
            `| \`${outlier.pattern}\` | ${outlier.count} | ${outlier.percentage}% | ${locations}${more} |`
          );
        }
        lines.push("");
      }
    }

    lines.push("---");
    lines.push("");
  } else {
    lines.push("## Design System Inconsistencies");
    lines.push("");
    lines.push(
      "✅ **No significant inconsistencies detected.** Your design system patterns are consistent."
    );
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // Pattern frequency table
  lines.push("## Pattern Frequency (Top 50)");
  lines.push("");
  lines.push("| Pattern | Count |");
  lines.push("|---------|-------|");

  const sortedPatterns = Object.entries(report.patternSummary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

  for (const [pattern, count] of sortedPatterns) {
    lines.push(`| \`${pattern}\` | ${count} |`);
  }
  lines.push("");

  // Helper to add category section
  const addCategorySection = (title: string, categories: Record<string, AuditCategory>) => {
    const hasItems = Object.values(categories).some((cat) => cat.count > 0);
    if (!hasItems) return;

    lines.push(`## ${title}`);
    lines.push("");

    for (const [, category] of Object.entries(categories)) {
      if (category.count === 0) continue;

      // Count unique patterns
      const uniquePatterns = countUniquePatterns(category.violations);
      const uniqueCount = Object.keys(uniquePatterns).length;

      lines.push(`### ${category.description} (${uniqueCount} unique, ${category.count} total)`);
      lines.push("");

      // Show unique patterns with counts
      lines.push("**Unique patterns:**");
      const sorted = Object.entries(uniquePatterns).sort((a, b) => b[1] - a[1]);
      for (const [pattern, count] of sorted.slice(0, 20)) {
        lines.push(`- \`${pattern}\`: ${count}x`);
      }
      if (sorted.length > 20) {
        lines.push(`- ... and ${sorted.length - 20} more`);
      }
      lines.push("");

      // Show sample locations
      lines.push("**Sample locations:**");
      lines.push("| File | Line | Code |");
      lines.push("|------|------|------|");

      for (const violation of category.violations.slice(0, 20)) {
        const code = violation.code.replace(/\|/g, "\\|").substring(0, 50);
        lines.push(`| ${violation.file} | ${violation.line} | \`${code}\` |`);
      }

      if (category.violations.length > 20) {
        lines.push(`| ... | ... | *${category.violations.length - 20} more* |`);
      }

      lines.push("");
    }
  };

  // Add all category sections dynamically
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
    cssVariables: "CSS Variables",
    inlineStyles: "Inline Styles",
    interactivity: "Interactivity",
    visibility: "Visibility & Overflow",
    transforms: "Transforms",
    filters: "Filters",
    gradients: "Gradients",
    textStyles: "Text Styles",
    objectFit: "Object Fit",
    aspectRatio: "Aspect Ratio",
    outlines: "Outlines",
    rings: "Rings",
    divide: "Divide",
  };

  for (const [key, name] of Object.entries(categoryNames)) {
    const category = report.categories[key as keyof typeof report.categories];
    if (category) {
      addCategorySection(name, category);
    }
  }

  return lines.join("\n");
}
