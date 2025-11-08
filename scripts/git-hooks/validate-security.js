#!/usr/bin/env node

/**
 * Security Validator
 *
 * Detects hardcoded secrets and dangerous code patterns.
 * Prevents accidental credential leaks and security vulnerabilities.
 */

const { execSync } = require("child_process");
const fs = require("fs");

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
    /\.md$/,
    /\.mdx$/,
    /^docs\//,
    /^node_modules\//,
    /^\.next\//,
    /^dist\//,
    /^build\//,
    /^scripts\/git-hooks\//,
  ];
  return excludePatterns.some((pattern) => pattern.test(filePath));
}

// Security patterns to detect
const SECRET_PATTERNS = [
  {
    name: "Stripe Secret Key",
    pattern: /sk_live_[a-zA-Z0-9]{24,}/,
    fix: "Use environment variable: process.env.STRIPE_SECRET_KEY",
  },
  {
    name: "Stripe Test Key",
    pattern: /sk_test_[a-zA-Z0-9]{24,}/,
    fix: "Use environment variable: process.env.STRIPE_SECRET_KEY",
  },
  {
    name: "AWS Access Key",
    pattern: /AKIA[0-9A-Z]{16}/,
    fix: "Use environment variable: process.env.AWS_ACCESS_KEY_ID",
  },
  {
    name: "Google API Key",
    pattern: /AIza[0-9A-Za-z_-]{35}/,
    fix: "Use environment variable: process.env.GOOGLE_API_KEY",
  },
  {
    name: "Private Key",
    pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/,
    fix: "Store private keys in secure key management system, load via environment",
  },
  {
    name: "Generic Secret",
    pattern: /(?:secret|password|api[_-]?key|token)[\s]*[:=][\s]*['"]\S{16,}/i,
    fix: "Use environment variable for sensitive data",
  },
];

const DANGEROUS_PATTERNS = [
  {
    name: "eval() usage",
    pattern: /\beval\s*\(/,
    fix: "Avoid eval() - it's a security risk. Use safer alternatives.",
  },
  {
    name: "dangerouslySetInnerHTML",
    pattern: /dangerouslySetInnerHTML/,
    fix: "Sanitize HTML with DOMPurify before using dangerouslySetInnerHTML",
  },
  {
    name: "innerHTML assignment",
    pattern: /\.innerHTML\s*=/,
    fix: "Use textContent or safer DOM methods to prevent XSS",
  },
  {
    name: "SQL Injection Risk",
    pattern: /(?:SELECT|INSERT|UPDATE|DELETE)[\s\S]*?['"][\s]*\+[\s]*['"]?/i,
    fix: "Use parameterized queries or ORM methods to prevent SQL injection",
  },
];

// Scan file for security issues
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const violations = [];

  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
      return;
    }

    // Check for secrets
    SECRET_PATTERNS.forEach(({ name, pattern, fix }) => {
      if (pattern.test(line)) {
        violations.push({
          line: index + 1,
          type: "SECRET",
          name,
          code: line.trim(),
          fix,
        });
      }
    });

    // Check for dangerous patterns
    DANGEROUS_PATTERNS.forEach(({ name, pattern, fix }) => {
      if (pattern.test(line)) {
        violations.push({
          line: index + 1,
          type: "DANGEROUS",
          name,
          code: line.trim(),
          fix,
        });
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
    if (shouldExclude(file)) {
      continue;
    }

    if (!fs.existsSync(file)) {
      continue;
    }

    const violations = scanFile(file);

    if (violations.length > 0) {
      hasViolations = true;
      allViolations.push({ file, violations });
    }
  }

  if (hasViolations) {
    console.error("\n❌ SECURITY VIOLATIONS DETECTED\n");

    allViolations.forEach(({ file, violations }) => {
      violations.forEach(({ line, type, name, code, fix }) => {
        console.error(`  ${file}:${line}`);
        console.error(`    Issue: ${type} - ${name}`);
        console.error(`    Code: ${code}`);
        console.error(`    Fix: ${fix}\n`);
      });
    });

    console.error("💡 Tip: Never commit secrets or credentials to version control.");
    console.error("    - Use environment variables for sensitive data");
    console.error("    - Add .env files to .gitignore");
    console.error("    - Use secret management tools (Vault, AWS Secrets Manager, etc.)\n");

    process.exit(1);
  }

  process.exit(0);
}

main();
