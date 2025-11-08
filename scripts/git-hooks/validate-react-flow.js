#!/usr/bin/env node

/**
 * React Flow Validator
 *
 * Ensures correct React Flow v12 usage:
 * - Use @xyflow/react (not old 'reactflow' package)
 * - Use named imports: import { ReactFlow } from '@xyflow/react'
 * - Correct CSS import: import '@xyflow/react/dist/style.css'
 * - Custom data extends Record<string, unknown>
 */

const { execSync } = require("child_process");
const fs = require("fs");

// Get list of staged TypeScript/JavaScript files
function getStagedFiles() {
  try {
    const output = execSync(
      'git diff --cached --name-only --diff-filter=ACM "*.ts" "*.tsx" "*.js" "*.jsx"',
      { encoding: "utf-8" }
    );
    return output.trim().split("\n").filter(Boolean);
  } catch (error) {
    return [];
  }
}

// Validate React Flow imports and usage
function validateReactFlow(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const violations = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Check for old 'reactflow' package (should be '@xyflow/react')
    if (/from\s+['"]reactflow['"]/.test(line)) {
      violations.push({
        line: lineNumber,
        code: line.trim(),
        type: "OLD_PACKAGE",
        fix: "Replace 'reactflow' with '@xyflow/react'",
      });
    }

    // Check for default import (should be named import)
    if (/import\s+ReactFlow\s+from\s+['"]@xyflow\/react['"]/.test(line)) {
      violations.push({
        line: lineNumber,
        code: line.trim(),
        type: "DEFAULT_IMPORT",
        fix: "Use named import: import { ReactFlow } from '@xyflow/react'",
      });
    }

    // Check for incorrect CSS path
    if (
      /import\s+['"]@xyflow\/react\/dist\/base\.css['"]/.test(line) ||
      /import\s+['"]reactflow\/dist\/style\.css['"]/.test(line)
    ) {
      violations.push({
        line: lineNumber,
        code: line.trim(),
        type: "WRONG_CSS",
        fix: "Use: import '@xyflow/react/dist/style.css'",
      });
    }

    // Check for type safety: Custom data should extend Record<string, unknown>
    if (/interface\s+\w+Data\s*{/.test(line) || /type\s+\w+Data\s*=\s*{/.test(line)) {
      // Check if 'extends Record<string, unknown>' is present
      const nextFewLines = lines.slice(index, index + 3).join(" ");
      if (!/extends\s+Record<string,\s*unknown>/.test(nextFewLines)) {
        violations.push({
          line: lineNumber,
          code: line.trim(),
          type: "TYPE_SAFETY",
          fix: "Custom node/edge data must extend Record<string, unknown> for React Flow v12",
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

    // Skip git hooks (they contain example code)
    if (file.includes("scripts/git-hooks/")) {
      continue;
    }

    // Only check files that might use React Flow
    const content = fs.readFileSync(file, "utf-8");
    if (
      !content.includes("@xyflow") &&
      !content.includes("reactflow") &&
      !content.includes("ReactFlow")
    ) {
      continue;
    }

    const violations = validateReactFlow(file);

    if (violations.length > 0) {
      hasViolations = true;
      allViolations.push({ file, violations });
    }
  }

  if (hasViolations) {
    console.error("\n❌ REACT FLOW V12 VIOLATIONS\n");

    allViolations.forEach(({ file, violations }) => {
      violations.forEach(({ line, code, type, fix }) => {
        console.error(`  ${file}:${line}`);
        console.error(`    Issue: ${type}`);
        console.error(`    Current: ${code}`);
        console.error(`    Fix: ${fix}\n`);
      });
    });

    console.error("💡 React Flow v12 Breaking Changes:");
    console.error("    1. Package renamed: 'reactflow' → '@xyflow/react'");
    console.error("    2. Use named imports: import { ReactFlow } from '@xyflow/react'");
    console.error("    3. CSS path: import '@xyflow/react/dist/style.css'");
    console.error("    4. Custom data types must extend Record<string, unknown>\n");

    console.error("Example:");
    console.error("    import { ReactFlow, Node, Edge } from '@xyflow/react';");
    console.error("    import '@xyflow/react/dist/style.css';");
    console.error("");
    console.error("    interface CustomNodeData extends Record<string, unknown> {");
    console.error("      label: string;");
    console.error("      value: number;");
    console.error("    }\n");

    process.exit(1);
  }

  process.exit(0);
}

main();
