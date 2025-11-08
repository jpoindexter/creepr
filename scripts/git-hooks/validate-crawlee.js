#!/usr/bin/env node

/**
 * Crawlee Validator
 *
 * Ensures correct Crawlee configuration:
 * - Use @crawlee/playwright (not general 'crawlee' package)
 * - maxRequestsPerCrawl is set (prevent infinite loops)
 * - waitForLoadState: 'networkidle' for Next.js apps
 * - requestHandlerTimeoutSecs is reasonable
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

// Validate Crawlee configuration
function validateCrawlee(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const violations = [];

  let hasPlaywrightCrawler = false;
  let hasMaxRequests = false;
  let hasWaitForLoadState = false;
  let maxRequestsValue = null;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Check for old 'crawlee' package (should use '@crawlee/playwright')
    if (/from\s+['"]crawlee['"]/.test(line) && /PlaywrightCrawler/.test(content)) {
      violations.push({
        line: lineNumber,
        code: line.trim(),
        type: "WRONG_PACKAGE",
        fix: "Use '@crawlee/playwright' instead of 'crawlee' for Playwright crawler",
      });
    }

    // Check if PlaywrightCrawler is being instantiated
    if (/new\s+PlaywrightCrawler/.test(line)) {
      hasPlaywrightCrawler = true;
    }

    // Check for maxRequestsPerCrawl
    if (/maxRequestsPerCrawl\s*:/.test(line)) {
      hasMaxRequests = true;
      const match = line.match(/maxRequestsPerCrawl\s*:\s*(\d+)/);
      if (match) {
        maxRequestsValue = parseInt(match[1], 10);
      }
    }

    // Check for waitForLoadState (as config option or method call)
    if (/waitForLoadState\s*:/.test(line) || /\.waitForLoadState\s*\(/.test(line)) {
      hasWaitForLoadState = true;

      // Check if it's NOT 'networkidle'
      if (
        !/waitForLoadState\s*:\s*['"]networkidle['"]/.test(line) &&
        !/\.waitForLoadState\s*\(\s*['"]networkidle['"]/.test(line)
      ) {
        violations.push({
          line: lineNumber,
          code: line.trim(),
          type: "WRONG_LOAD_STATE",
          fix: "Use waitForLoadState: 'networkidle' for Next.js apps to ensure client-side JS loads",
        });
      }
    }

    // Check for requestHandlerTimeoutSecs
    if (/requestHandlerTimeoutSecs\s*:/.test(line)) {
      const match = line.match(/requestHandlerTimeoutSecs\s*:\s*(\d+)/);
      if (match) {
        const timeout = parseInt(match[1], 10);
        if (timeout < 10 || timeout > 120) {
          violations.push({
            line: lineNumber,
            code: line.trim(),
            type: "UNREASONABLE_TIMEOUT",
            fix: "Set requestHandlerTimeoutSecs between 10-120 seconds (30 recommended)",
          });
        }
      }
    }
  });

  // If PlaywrightCrawler is used, check required configs
  if (hasPlaywrightCrawler) {
    if (!hasMaxRequests) {
      violations.push({
        line: 0,
        code: "PlaywrightCrawler configuration",
        type: "MISSING_MAX_REQUESTS",
        fix: "Set maxRequestsPerCrawl to prevent infinite loops (100-1000 recommended)",
      });
    }

    if (maxRequestsValue && maxRequestsValue > 10000) {
      violations.push({
        line: 0,
        code: `maxRequestsPerCrawl: ${maxRequestsValue}`,
        type: "TOO_MANY_REQUESTS",
        fix: "maxRequestsPerCrawl is very high (>10000). Consider reducing to avoid overload.",
      });
    }

    if (!hasWaitForLoadState) {
      violations.push({
        line: 0,
        code: "PlaywrightCrawler configuration",
        type: "MISSING_WAIT_STATE",
        fix: "Set waitForLoadState: 'networkidle' for Next.js apps",
      });
    }
  }

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

    // Only check files that use Crawlee
    const content = fs.readFileSync(file, "utf-8");
    if (!content.includes("PlaywrightCrawler") && !content.includes("@crawlee")) {
      continue;
    }

    const violations = validateCrawlee(file);

    if (violations.length > 0) {
      hasViolations = true;
      allViolations.push({ file, violations });
    }
  }

  if (hasViolations) {
    console.error("\n❌ CRAWLEE CONFIGURATION VIOLATIONS\n");

    allViolations.forEach(({ file, violations }) => {
      violations.forEach(({ line, code, type, fix }) => {
        if (line > 0) {
          console.error(`  ${file}:${line}`);
        } else {
          console.error(`  ${file}`);
        }
        console.error(`    Issue: ${type}`);
        console.error(`    Current: ${code}`);
        console.error(`    Fix: ${fix}\n`);
      });
    });

    console.error("💡 Crawlee Best Practices for creepr:");
    console.error("    1. Use @crawlee/playwright (not 'crawlee' package)");
    console.error("    2. Always set maxRequestsPerCrawl (prevents infinite loops)");
    console.error("    3. Use waitForLoadState: 'networkidle' for Next.js apps");
    console.error("    4. Set requestHandlerTimeoutSecs: 30 (reasonable timeout)\n");

    console.error("Example:");
    console.error("    import { PlaywrightCrawler } from '@crawlee/playwright';");
    console.error("");
    console.error("    const crawler = new PlaywrightCrawler({");
    console.error("      maxRequestsPerCrawl: 100,");
    console.error("      requestHandlerTimeoutSecs: 30,");
    console.error("      launchContext: {");
    console.error("        launchOptions: {");
    console.error("          headless: true,");
    console.error("        },");
    console.error("      },");
    console.error("      async requestHandler({ page, request }) {");
    console.error("        await page.waitForLoadState('networkidle');");
    console.error("        // ... your handler code");
    console.error("      },");
    console.error("    });\n");

    process.exit(1);
  }

  process.exit(0);
}

main();
