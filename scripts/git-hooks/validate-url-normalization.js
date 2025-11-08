#!/usr/bin/env node

/**
 * URL Normalization Validator
 *
 * Ensures normalizeUrl() is used before Set operations in creepr.
 * Critical for preventing duplicate pages in sitemap (e.g., /about vs /about/).
 */

const { execSync } = require("child_process");
const fs = require("fs");

// Get list of staged TypeScript files
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM "*.ts" "*.tsx"', {
      encoding: "utf-8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch (error) {
    return [];
  }
}

// Validate URL normalization usage
function validateUrlNormalization(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const violations = [];

  // Check if file uses URLs/Sets (only relevant for crawler/tree builder)
  const usesUrls = /\b(url|URL|href)\b/i.test(content);
  const usesSets = /new\s+Set\s*\(/.test(content);

  if (!usesUrls || !usesSets) {
    return violations; // Not relevant
  }

  let hasNormalizeUrl = /normalizeUrl\s*\(/.test(content);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Detect Set operations without normalization
    if (/new\s+Set\s*\(/.test(line) || /\.add\s*\(/.test(line)) {
      // Check if normalizeUrl is used in context (allow both normalizeUrl( and .map(normalizeUrl))
      const contextStart = Math.max(0, index - 3);
      const contextEnd = Math.min(lines.length, index + 3);
      const context = lines.slice(contextStart, contextEnd).join("\n");

      if (!/normalizeUrl/.test(context)) {
        violations.push({
          line: lineNumber,
          code: line.trim(),
          type: "MISSING_NORMALIZATION",
          fix: "Call normalizeUrl() before adding URLs to Set to prevent duplicates",
        });
      }
    }

    // Detect URL comparisons without normalization
    if (
      (/===|!==|==|!=/.test(line) && /url|href/i.test(line)) ||
      /\.includes\s*\(\s*['"`].*?\//.test(line)
    ) {
      const contextStart = Math.max(0, index - 2);
      const contextEnd = Math.min(lines.length, index + 2);
      const context = lines.slice(contextStart, contextEnd).join("\n");

      if (!/normalizeUrl\s*\(/.test(context) && /^http/.test(line)) {
        violations.push({
          line: lineNumber,
          code: line.trim(),
          type: "URL_COMPARISON_WITHOUT_NORMALIZATION",
          fix: "Normalize URLs before comparison to handle trailing slashes, case, etc.",
        });
      }
    }
  });

  return violations;
}

// Main validation
function main() {
  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    process.exit(0);
  }

  let hasViolations = false;
  const allViolations = [];

  for (const file of stagedFiles) {
    if (!fs.existsSync(file)) {
      continue;
    }

    // Only check crawler and tree-related files
    if (!file.includes("crawler") && !file.includes("tree") && !file.includes("flow")) {
      continue;
    }

    const violations = validateUrlNormalization(file);

    if (violations.length > 0) {
      hasViolations = true;
      allViolations.push({ file, violations });
    }
  }

  if (hasViolations) {
    console.error("\n❌ URL NORMALIZATION VIOLATIONS\n");

    allViolations.forEach(({ file, violations }) => {
      violations.forEach(({ line, code, type, fix }) => {
        console.error(`  ${file}:${line}`);
        console.error(`    Issue: ${type}`);
        console.error(`    Code: ${code}`);
        console.error(`    Fix: ${fix}\n`);
      });
    });

    console.error("💡 Why URL Normalization Matters:");
    console.error("    - /about and /about/ are treated as different URLs by Set");
    console.error("    - Causes duplicate nodes in sitemap visualization");
    console.error("    - Breaks parent-child relationships in tree structure");
    console.error("    - normalizeUrl() handles: trailing slashes, case, hash fragments\n");

    console.error("Example:");
    console.error("    import { normalizeUrl } from '@/lib/utils';");
    console.error("");
    console.error("    // Bad - duplicates possible");
    console.error("    const visitedUrls = new Set<string>();");
    console.error("    visitedUrls.add(url);");
    console.error("");
    console.error("    // Good - consistent normalization");
    console.error("    const visitedUrls = new Set<string>();");
    console.error("    visitedUrls.add(normalizeUrl(url));\n");

    console.error("normalizeUrl() implementation:");
    console.error("    - Removes trailing slashes");
    console.error("    - Removes hash fragments (#...)");
    console.error("    - Converts to lowercase");
    console.error("    - Ensures consistency for Set operations\n");

    process.exit(1);
  }

  process.exit(0);
}

main();
