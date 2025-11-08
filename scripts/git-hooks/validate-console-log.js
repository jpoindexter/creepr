#!/usr/bin/env node

/**
 * Console.log Validator
 *
 * Blocks console.log statements in staged files (allows console.error/warn/info).
 * console.log is typically debugging noise that should not be committed.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Get list of staged TypeScript/JavaScript files
function getStagedFiles() {
  try {
    const output = execSync(
      'git diff --cached --name-only --diff-filter=ACM "*.ts" "*.tsx" "*.js" "*.jsx" "*.mjs"',
      { encoding: "utf-8" }
    );
    return output.trim().split("\n").filter(Boolean);
  } catch (error) {
    return [];
  }
}

// Check if file should be excluded
function shouldExclude(filePath) {
  const excludePatterns = [
    /^scripts\/git-hooks\//, // Exclude git hooks themselves
    /^node_modules\//,
    /^\.next\//,
    /^dist\//,
    /^build\//,
  ];
  return excludePatterns.some((pattern) => pattern.test(filePath));
}

// Find console.log statements in file
function findConsoleLogs(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const violations = [];

  // Pattern matches: console.log (but not console.error, console.warn, console.info)
  const consoleLogPattern = /\bconsole\.log\s*\(/;

  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
      return;
    }

    if (consoleLogPattern.test(line)) {
      violations.push({
        line: index + 1,
        code: line.trim(),
      });
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
    if (shouldExclude(file)) {
      continue;
    }

    if (!fs.existsSync(file)) {
      continue;
    }

    const violations = findConsoleLogs(file);

    if (violations.length > 0) {
      hasViolations = true;
      allViolations.push({ file, violations });
    }
  }

  if (hasViolations) {
    console.error("\n❌ CONSOLE.LOG DETECTED\n");

    allViolations.forEach(({ file, violations }) => {
      violations.forEach(({ line, code }) => {
        console.error(`  ${file}:${line}`);
        console.error(`    Issue: console.log() statement found`);
        console.error(`    Code: ${code}`);
        console.error(
          `    Fix: Remove console.log() or use console.error/warn/info for legitimate logging\n`
        );
      });
    });

    console.error(
      "💡 Tip: Use console.error() for errors, console.warn() for warnings, or a proper logging library\n"
    );
    console.error("    Allowed: console.error(), console.warn(), console.info()");
    console.error("    Blocked: console.log() (debugging noise)\n");

    process.exit(1);
  }

  process.exit(0);
}

main();
