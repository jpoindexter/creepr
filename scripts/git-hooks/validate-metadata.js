#!/usr/bin/env node

/**
 * Metadata Validator
 *
 * Ensures all page.tsx files export proper SEO metadata:
 * - Title: 30-70 chars (optimal 50-60)
 * - Description: 50-200 chars (optimal 150-160)
 * - OpenGraph metadata
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Get list of staged page.tsx files
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM "**/page.tsx"', {
      encoding: "utf-8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch (error) {
    return [];
  }
}

// Extract metadata from file
function extractMetadata(content) {
  const metadata = {
    hasMetadata: false,
    title: null,
    description: null,
    hasOpenGraph: false,
    hasTwitterCard: false,
  };

  // Check for metadata export
  if (/export\s+(const|let|var)\s+metadata/.test(content)) {
    metadata.hasMetadata = true;

    // Extract title
    const titleMatch = content.match(/title\s*:\s*["']([^"']+)["']/);
    if (titleMatch) {
      metadata.title = titleMatch[1];
    }

    // Extract description
    const descMatch = content.match(/description\s*:\s*["']([^"']+)["']/);
    if (descMatch) {
      metadata.description = descMatch[1];
    }

    // Check for OpenGraph
    if (/openGraph\s*:/.test(content)) {
      metadata.hasOpenGraph = true;
    }

    // Check for Twitter card
    if (/twitter\s*:/.test(content)) {
      metadata.hasTwitterCard = true;
    }
  }

  return metadata;
}

// Validate metadata quality
function validateMetadata(filePath, metadata) {
  const violations = [];

  // Check if metadata export exists
  if (!metadata.hasMetadata) {
    violations.push({
      type: "MISSING_METADATA",
      fix: "Add metadata export to page.tsx for SEO",
    });
    return violations; // Return early if no metadata at all
  }

  // Validate title
  if (!metadata.title) {
    violations.push({
      type: "MISSING_TITLE",
      fix: "Add title to metadata (50-60 chars optimal)",
    });
  } else {
    const titleLength = metadata.title.length;
    if (titleLength < 30) {
      violations.push({
        type: "TITLE_TOO_SHORT",
        current: `${titleLength} chars`,
        fix: "Title should be 30-70 chars (optimal 50-60)",
      });
    } else if (titleLength > 70) {
      violations.push({
        type: "TITLE_TOO_LONG",
        current: `${titleLength} chars`,
        fix: "Title should be 30-70 chars (optimal 50-60)",
      });
    }
  }

  // Validate description
  if (!metadata.description) {
    violations.push({
      type: "MISSING_DESCRIPTION",
      fix: "Add description to metadata (150-160 chars optimal)",
    });
  } else {
    const descLength = metadata.description.length;
    if (descLength < 50) {
      violations.push({
        type: "DESCRIPTION_TOO_SHORT",
        current: `${descLength} chars`,
        fix: "Description should be 50-200 chars (optimal 150-160)",
      });
    } else if (descLength > 200) {
      violations.push({
        type: "DESCRIPTION_TOO_LONG",
        current: `${descLength} chars`,
        fix: "Description should be 50-200 chars (optimal 150-160)",
      });
    }
  }

  // Warn about missing OpenGraph (non-blocking)
  if (!metadata.hasOpenGraph) {
    violations.push({
      type: "WARNING_MISSING_OPENGRAPH",
      fix: "Consider adding OpenGraph metadata for better social sharing",
    });
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

    // Skip root page.tsx if it's not in app directory
    if (!file.includes("/app/")) {
      continue;
    }

    const content = fs.readFileSync(file, "utf-8");

    // Skip client components (they can't export metadata in Next.js)
    if (content.includes('"use client"') || content.includes("'use client'")) {
      continue;
    }

    const metadata = extractMetadata(content);
    const violations = validateMetadata(file, metadata);

    if (violations.length > 0) {
      hasViolations = true;
      allViolations.push({ file, metadata, violations });
    }
  }

  if (hasViolations) {
    console.error("\n❌ SEO METADATA VIOLATIONS\n");

    allViolations.forEach(({ file, metadata, violations }) => {
      console.error(`  ${file}`);

      violations.forEach(({ type, current, fix }) => {
        console.error(`    Issue: ${type}`);
        if (current) {
          console.error(`    Current: ${current}`);
        }
        console.error(`    Fix: ${fix}\n`);
      });

      if (metadata.title) {
        console.error(`    Current Title: "${metadata.title}" (${metadata.title.length} chars)`);
      }
      if (metadata.description) {
        console.error(
          `    Current Description: "${metadata.description}" (${metadata.description.length} chars)\n`
        );
      }
    });

    console.error("💡 SEO Metadata Best Practices:");
    console.error("    - Title: 50-60 chars (30 min, 70 max)");
    console.error("    - Description: 150-160 chars (50 min, 200 max)");
    console.error("    - Include OpenGraph for social sharing");
    console.error("    - Unique metadata per page (no duplicates)\n");

    console.error("Example:");
    console.error("    export const metadata: Metadata = {");
    console.error('      title: "creepr - Localhost Sitemap Generator",');
    console.error(
      '      description: "Generate interactive visual sitemaps for localhost applications. Built with Next.js 15, React Flow, and Crawlee for developers.",'
    );
    console.error("      openGraph: {");
    console.error('        title: "creepr - Localhost Sitemap Generator",');
    console.error(
      '        description: "Generate interactive visual sitemaps for localhost applications.",'
    );
    console.error('        type: "website",');
    console.error("      },");
    console.error("    };\n");

    process.exit(1);
  }

  process.exit(0);
}

main();
