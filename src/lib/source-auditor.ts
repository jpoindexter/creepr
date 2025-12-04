/**
 * Source Code Auditor
 * Scans .tsx/.ts files for design system inconsistencies
 * Outputs structured JSON that can be used to find and fix violations
 */

export interface AuditPattern {
  name: string;
  description: string;
  regex: RegExp;
  expected: "none" | "all"; // "none" = any match is a violation, "all" = missing is violation
  category: string;
}

export interface AuditMatch {
  file: string;
  line: number;
  column: number;
  match: string;
  context: string; // surrounding code
}

export interface AuditResult {
  pattern: string;
  category: string;
  description: string;
  expected: string;
  violationCount: number;
  matches: AuditMatch[];
}

export interface FullAuditReport {
  generatedAt: string;
  totalViolations: number;
  summary: Record<string, number>; // category -> count
  results: AuditResult[];
}

// Default patterns for terminal/brutalist design system audit
export const DEFAULT_AUDIT_PATTERNS: AuditPattern[] = [
  // Rounded corners (terminal = no rounded)
  {
    name: "rounded-sm",
    description: "Small rounded corners (should be rounded-none)",
    regex: /\brounded-sm\b/g,
    expected: "none",
    category: "roundedCorners",
  },
  {
    name: "rounded-md",
    description: "Medium rounded corners (should be rounded-none)",
    regex: /\brounded-md\b/g,
    expected: "none",
    category: "roundedCorners",
  },
  {
    name: "rounded-lg",
    description: "Large rounded corners (should be rounded-none)",
    regex: /\brounded-lg\b/g,
    expected: "none",
    category: "roundedCorners",
  },
  {
    name: "rounded-xl",
    description: "XL rounded corners (should be rounded-none)",
    regex: /\brounded-xl\b/g,
    expected: "none",
    category: "roundedCorners",
  },
  {
    name: "rounded-2xl",
    description: "2XL rounded corners (should be rounded-none)",
    regex: /\brounded-2xl\b/g,
    expected: "none",
    category: "roundedCorners",
  },
  {
    name: "rounded-full",
    description: "Full rounded corners (should be rounded-none)",
    regex: /\brounded-full\b/g,
    expected: "none",
    category: "roundedCorners",
  },

  // Shadows (terminal = no shadows)
  {
    name: "shadow-sm",
    description: "Small shadow (terminal = no shadows)",
    regex: /\bshadow-sm\b/g,
    expected: "none",
    category: "shadows",
  },
  {
    name: "shadow-md",
    description: "Medium shadow (terminal = no shadows)",
    regex: /\bshadow-md\b/g,
    expected: "none",
    category: "shadows",
  },
  {
    name: "shadow-lg",
    description: "Large shadow (terminal = no shadows)",
    regex: /\bshadow-lg\b/g,
    expected: "none",
    category: "shadows",
  },
  {
    name: "shadow-xl",
    description: "XL shadow (terminal = no shadows)",
    regex: /\bshadow-xl\b/g,
    expected: "none",
    category: "shadows",
  },
  {
    name: "shadow-2xl",
    description: "2XL shadow (terminal = no shadows)",
    regex: /\bshadow-2xl\b/g,
    expected: "none",
    category: "shadows",
  },

  // Hardcoded colors (should use design tokens)
  {
    name: "bg-white",
    description: "Hardcoded white background (use bg-background or bg-card)",
    regex: /\bbg-white\b/g,
    expected: "none",
    category: "hardcodedColors",
  },
  {
    name: "bg-black",
    description: "Hardcoded black background (use bg-foreground)",
    regex: /\bbg-black\b/g,
    expected: "none",
    category: "hardcodedColors",
  },
  {
    name: "text-white",
    description: "Hardcoded white text (use text-background)",
    regex: /\btext-white\b/g,
    expected: "none",
    category: "hardcodedColors",
  },
  {
    name: "text-black",
    description: "Hardcoded black text (use text-foreground)",
    regex: /\btext-black\b/g,
    expected: "none",
    category: "hardcodedColors",
  },
  {
    name: "text-gray-*",
    description: "Hardcoded gray text (use text-muted-foreground)",
    regex: /\btext-gray-\d{2,3}\b/g,
    expected: "none",
    category: "hardcodedColors",
  },
  {
    name: "bg-gray-*",
    description: "Hardcoded gray background (use bg-muted)",
    regex: /\bbg-gray-\d{2,3}\b/g,
    expected: "none",
    category: "hardcodedColors",
  },
  {
    name: "border-gray-*",
    description: "Hardcoded gray border (use border-border)",
    regex: /\bborder-gray-\d{2,3}\b/g,
    expected: "none",
    category: "hardcodedColors",
  },
  {
    name: "hex-colors",
    description: "Hardcoded hex colors in className",
    regex: /\[#[0-9a-fA-F]{3,8}\]/g,
    expected: "none",
    category: "hardcodedColors",
  },

  // Colored status dots (terminal headers)
  {
    name: "colored-dots-destructive",
    description: "Colored dot using bg-destructive/50 (terminal header pattern)",
    regex: /bg-destructive\/50.*?size-2|size-2.*?bg-destructive\/50/g,
    expected: "none",
    category: "terminalHeaders",
  },
  {
    name: "colored-dots-warning",
    description: "Colored dot using bg-warning/50 (terminal header pattern)",
    regex: /bg-warning\/50.*?size-2|size-2.*?bg-warning\/50/g,
    expected: "none",
    category: "terminalHeaders",
  },
  {
    name: "colored-dots-success",
    description: "Colored dot using bg-success/50 (terminal header pattern)",
    regex: /bg-success\/50.*?size-2|size-2.*?bg-success\/50/g,
    expected: "none",
    category: "terminalHeaders",
  },

  // Typography
  {
    name: "font-sans",
    description: "Sans font (terminal = mono font)",
    regex: /\bfont-sans\b/g,
    expected: "none",
    category: "typography",
  },

  // Non-8-point grid spacing
  {
    name: "p-3",
    description: "Padding 3 (not on 8-point grid, use p-2 or p-4)",
    regex: /\bp-3\b/g,
    expected: "none",
    category: "spacing",
  },
  {
    name: "p-5",
    description: "Padding 5 (not on 8-point grid, use p-4 or p-6)",
    regex: /\bp-5\b/g,
    expected: "none",
    category: "spacing",
  },
  {
    name: "p-7",
    description: "Padding 7 (not on 8-point grid, use p-6 or p-8)",
    regex: /\bp-7\b/g,
    expected: "none",
    category: "spacing",
  },
  {
    name: "m-3",
    description: "Margin 3 (not on 8-point grid, use m-2 or m-4)",
    regex: /\bm-3\b/g,
    expected: "none",
    category: "spacing",
  },
  {
    name: "m-5",
    description: "Margin 5 (not on 8-point grid, use m-4 or m-6)",
    regex: /\bm-5\b/g,
    expected: "none",
    category: "spacing",
  },
  {
    name: "m-7",
    description: "Margin 7 (not on 8-point grid, use m-6 or m-8)",
    regex: /\bm-7\b/g,
    expected: "none",
    category: "spacing",
  },
  {
    name: "gap-3",
    description: "Gap 3 (not on 8-point grid, use gap-2 or gap-4)",
    regex: /\bgap-3\b/g,
    expected: "none",
    category: "spacing",
  },
  {
    name: "gap-5",
    description: "Gap 5 (not on 8-point grid, use gap-4 or gap-6)",
    regex: /\bgap-5\b/g,
    expected: "none",
    category: "spacing",
  },
  {
    name: "gap-7",
    description: "Gap 7 (not on 8-point grid, use gap-6 or gap-8)",
    regex: /\bgap-7\b/g,
    expected: "none",
    category: "spacing",
  },
];

/**
 * Audit a single file's content against patterns
 */
export function auditFileContent(
  filePath: string,
  content: string,
  patterns: AuditPattern[]
): AuditResult[] {
  const lines = content.split("\n");
  const results: AuditResult[] = [];

  for (const pattern of patterns) {
    const matches: AuditMatch[] = [];

    lines.forEach((line, lineIndex) => {
      // Reset regex lastIndex for global patterns
      pattern.regex.lastIndex = 0;
      let match;

      while ((match = pattern.regex.exec(line)) !== null) {
        matches.push({
          file: filePath,
          line: lineIndex + 1,
          column: match.index + 1,
          match: match[0],
          context: line.trim().substring(0, 200), // First 200 chars of line
        });
      }
    });

    if (matches.length > 0) {
      results.push({
        pattern: pattern.name,
        category: pattern.category,
        description: pattern.description,
        expected: pattern.expected === "none" ? "0 matches" : "present in all files",
        violationCount: matches.length,
        matches,
      });
    }
  }

  return results;
}

/**
 * Merge results from multiple files into a single report
 */
export function mergeAuditResults(allResults: AuditResult[][]): FullAuditReport {
  const mergedByPattern: Record<string, AuditResult> = {};

  for (const fileResults of allResults) {
    for (const result of fileResults) {
      if (!mergedByPattern[result.pattern]) {
        mergedByPattern[result.pattern] = {
          ...result,
          matches: [...result.matches],
        };
      } else {
        mergedByPattern[result.pattern].matches.push(...result.matches);
        mergedByPattern[result.pattern].violationCount += result.violationCount;
      }
    }
  }

  const results = Object.values(mergedByPattern).sort((a, b) => b.violationCount - a.violationCount);

  // Build summary by category
  const summary: Record<string, number> = {};
  for (const result of results) {
    summary[result.category] = (summary[result.category] || 0) + result.violationCount;
  }

  const totalViolations = results.reduce((sum, r) => sum + r.violationCount, 0);

  return {
    generatedAt: new Date().toISOString(),
    totalViolations,
    summary,
    results,
  };
}
