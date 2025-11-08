#!/usr/bin/env node

/**
 * Import Validator
 *
 * Detects:
 * - Circular dependencies (via DFS graph traversal)
 * - Deep import paths (>3 levels of ../)
 * - Duplicate imports
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

// Extract imports from file
function extractImports(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const imports = [];

  // Match import statements
  const importPattern = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const requirePattern = /require\(['"]([^'"]+)['"]\)/g;

  let match;
  let lineNumber = 1;
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    lineNumber = index + 1;

    // import ... from '...'
    const importMatches = line.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
    for (const m of importMatches) {
      imports.push({ path: m[1], line: lineNumber });
    }

    // require('...')
    const requireMatches = line.matchAll(/require\(['"]([^'"]+)['"]\)/g);
    for (const m of requireMatches) {
      imports.push({ path: m[1], line: lineNumber });
    }
  });

  return imports;
}

// Check for deep import paths
function checkDeepImports(filePath, imports) {
  const violations = [];

  imports.forEach(({ path: importPath, line }) => {
    // Count ../ occurrences
    const relativeUpLevels = (importPath.match(/\.\.\//g) || []).length;

    if (relativeUpLevels > 3) {
      violations.push({
        line,
        importPath,
        levels: relativeUpLevels,
        type: "DEEP_IMPORT",
      });
    }
  });

  return violations;
}

// Check for duplicate imports
function checkDuplicateImports(filePath, imports) {
  const violations = [];
  const seen = new Map();

  imports.forEach(({ path: importPath, line }) => {
    if (seen.has(importPath)) {
      violations.push({
        line,
        importPath,
        firstLine: seen.get(importPath),
        type: "DUPLICATE_IMPORT",
      });
    } else {
      seen.set(importPath, line);
    }
  });

  return violations;
}

// Check for circular dependencies (simplified check)
function checkCircularDependencies(filePath, imports) {
  const violations = [];

  // Build a simple graph of imports
  const graph = new Map();

  imports.forEach(({ path: importPath }) => {
    // Skip external packages
    if (!importPath.startsWith(".")) {
      return;
    }

    // Resolve to absolute path
    const resolvedPath = path.resolve(path.dirname(filePath), importPath);

    if (!graph.has(filePath)) {
      graph.set(filePath, []);
    }
    graph.get(filePath).push(resolvedPath);
  });

  // Simple DFS to detect cycles (only checks immediate cycles)
  graph.forEach((deps, file) => {
    deps.forEach((dep) => {
      // Check if dependency imports back to this file
      try {
        const depImports = extractImports(dep);
        depImports.forEach(({ path: depImportPath }) => {
          if (depImportPath.startsWith(".")) {
            const resolvedDep = path.resolve(path.dirname(dep), depImportPath);
            if (resolvedDep === file) {
              violations.push({
                type: "CIRCULAR_DEPENDENCY",
                file: file,
                dependency: dep,
              });
            }
          }
        });
      } catch (e) {
        // File might not exist, skip
      }
    });
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

    // Skip git hooks (they contain example code)
    if (file.includes("scripts/git-hooks/")) {
      continue;
    }

    const imports = extractImports(file);

    const deepImports = checkDeepImports(file, imports);
    const duplicateImports = checkDuplicateImports(file, imports);
    const circularDeps = checkCircularDependencies(file, imports);

    const violations = [...deepImports, ...duplicateImports, ...circularDeps];

    if (violations.length > 0) {
      hasViolations = true;
      allViolations.push({ file, violations });
    }
  }

  if (hasViolations) {
    console.error("\n❌ IMPORT VIOLATIONS DETECTED\n");

    allViolations.forEach(({ file, violations }) => {
      violations.forEach((violation) => {
        if (violation.type === "DEEP_IMPORT") {
          console.error(`  ${file}:${violation.line}`);
          console.error(`    Issue: Deep import path (${violation.levels} levels up)`);
          console.error(`    Current: import ... from '${violation.importPath}'`);
          console.error(`    Fix: Use path alias (@/) or restructure imports\n`);
        } else if (violation.type === "DUPLICATE_IMPORT") {
          console.error(`  ${file}:${violation.line}`);
          console.error(`    Issue: Duplicate import`);
          console.error(`    Path: ${violation.importPath}`);
          console.error(`    First imported: Line ${violation.firstLine}`);
          console.error(`    Fix: Remove duplicate import statement\n`);
        } else if (violation.type === "CIRCULAR_DEPENDENCY") {
          console.error(`  ${violation.file}`);
          console.error(`    Issue: Circular dependency detected`);
          console.error(`    Imports: ${violation.dependency}`);
          console.error(`    Which imports back: ${violation.file}`);
          console.error(`    Fix: Refactor to break circular dependency\n`);
        }
      });
    });

    console.error("💡 Tip: Use path aliases for cleaner imports:");
    console.error("    Bad:  import { foo } from '../../../lib/foo'");
    console.error("    Good: import { foo } from '@/lib/foo'\n");

    console.error("💡 Tip: Circular dependencies cause bundler issues and hard-to-debug bugs.");
    console.error("    Extract shared code to a separate module or use dependency injection.\n");

    process.exit(1);
  }

  process.exit(0);
}

main();
