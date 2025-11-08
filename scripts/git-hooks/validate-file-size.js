#!/usr/bin/env node

/**
 * File Size Validator
 *
 * Enforces 300-line limit per file to ensure modularity.
 * Large files are harder to understand, test, and maintain.
 */

const { execSync } = require("child_process");
const fs = require("fs");

const MAX_LINES = 300;

// Get list of staged files
function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf-8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch (error) {
    return [];
  }
}

// Check if file should be excluded
function shouldExclude(filePath) {
  const excludePatterns = [
    /\.md$/, // Markdown files
    /\.mdx$/, // MDX files
    /\.json$/, // JSON files
    /^scripts\/git-hooks\//, // Git hooks themselves
    /^node_modules\//,
    /^\.next\//,
    /^dist\//,
    /^build\//,
    /^playwright-report\//,
    /^test-results\//,
    /^storage\//,
    /^crawlee_storage\//,
    /package-lock\.json$/,
  ];
  return excludePatterns.some((pattern) => pattern.test(filePath));
}

// Count lines in file
function countLines(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  return content.split("\n").length;
}

// Suggest refactoring strategies
function getRefactoringTips(lineCount, filePath) {
  const overage = lineCount - MAX_LINES;
  const tips = [];

  tips.push(`File has ${lineCount} lines (${overage} over limit)`);

  if (filePath.endsWith(".tsx") || filePath.endsWith(".jsx")) {
    tips.push("💡 For React components:");
    tips.push("  - Extract child components into separate files");
    tips.push("  - Move hooks to custom hook files (use*/...)");
    tips.push("  - Extract utility functions to lib/utils/");
  } else if (filePath.endsWith(".ts") || filePath.endsWith(".js")) {
    tips.push("💡 For TypeScript/JavaScript files:");
    tips.push("  - Split into multiple modules by responsibility");
    tips.push("  - Extract helper functions to separate files");
    tips.push("  - Use barrel exports (index.ts) to maintain clean imports");
  }

  return tips;
}

// Main validation
function main() {
  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    process.exit(0);
  }

  let hasViolations = false;
  const violations = [];

  for (const file of stagedFiles) {
    if (shouldExclude(file)) {
      continue;
    }

    if (!fs.existsSync(file)) {
      continue;
    }

    const lineCount = countLines(file);

    if (lineCount > MAX_LINES) {
      hasViolations = true;
      violations.push({
        file,
        lineCount,
        overage: lineCount - MAX_LINES,
      });
    }
  }

  if (hasViolations) {
    console.error("\n❌ FILE SIZE LIMIT EXCEEDED (300 lines)\n");

    violations.forEach(({ file, lineCount, overage }) => {
      console.error(`  ${file}`);
      console.error(`    Current: ${lineCount} lines`);
      console.error(`    Limit: ${MAX_LINES} lines`);
      console.error(`    Overage: ${overage} lines\n`);

      const tips = getRefactoringTips(lineCount, file);
      tips.forEach((tip) => console.error(`    ${tip}`));
      console.error("");
    });

    console.error("💡 Tip: Smaller files are easier to understand, test, and maintain.");
    console.error("    Aim for single responsibility principle - one file, one job.\n");

    process.exit(1);
  }

  process.exit(0);
}

main();
