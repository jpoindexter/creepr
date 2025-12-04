/**
 * Example usage of the source-scanner module
 *
 * This file demonstrates how to use the source scanner to find
 * internal links in your codebase.
 */

import {
  scanSourceFiles,
  scanAllSourceFiles,
  scanMarkdownFiles,
  type SourceLink,
} from "./source-scanner";

/**
 * Example 1: Scan only markdown files for internal links
 */
async function example1() {
  console.log("Example 1: Scanning markdown files only\n");

  const links = await scanMarkdownFiles("./content", {
    includeRelativePaths: true,
    includeAbsolutePaths: true,
    includeFullUrls: false, // Skip external URLs
    deduplicate: true,
  });

  console.log(`Found ${links.length} internal links in markdown files:\n`);

  links.slice(0, 5).forEach((link) => {
    console.log(`  ${link.url}`);
    console.log(`    Source: ${link.sourceFile}:${link.lineNumber}`);
    if (link.linkText) {
      console.log(`    Text: "${link.linkText}"`);
    }
    console.log();
  });
}

/**
 * Example 2: Scan all source files (markdown, code, config)
 */
async function example2() {
  console.log("Example 2: Scanning all source files\n");

  const links = await scanAllSourceFiles("./src", {
    includeRelativePaths: true,
    includeAbsolutePaths: true,
    includeFullUrls: true,
  });

  // Group by file type
  const byExtension: Record<string, SourceLink[]> = {};

  links.forEach((link) => {
    const ext = link.sourceFile.split(".").pop() || "unknown";
    if (!byExtension[ext]) {
      byExtension[ext] = [];
    }
    byExtension[ext].push(link);
  });

  console.log("Links by file type:");
  Object.entries(byExtension).forEach(([ext, extLinks]) => {
    console.log(`  .${ext}: ${extLinks.length} links`);
  });
  console.log();
}

/**
 * Example 3: Find links to a specific base URL
 */
async function example3() {
  console.log("Example 3: Finding links to specific domain\n");

  const links = await scanSourceFiles("./src", [".md", ".mdx", ".ts", ".tsx"], {
    baseUrl: "https://intellect.sh",
    includeFullUrls: true,
  });

  console.log(`Found ${links.length} links to intellect.sh:\n`);

  links.slice(0, 5).forEach((link) => {
    console.log(`  ${link.url}`);
    console.log(`    From: ${link.sourceFile}:${link.lineNumber}\n`);
  });
}

/**
 * Example 4: Custom patterns - scan specific file extensions
 */
async function example4() {
  console.log("Example 4: Custom file patterns\n");

  // Only scan TypeScript files
  const links = await scanSourceFiles("./src", [".ts", ".tsx"], {
    includeAbsolutePaths: true,
    includeRelativePaths: false, // Skip relative imports
    includeFullUrls: true,
  });

  console.log(`Found ${links.length} links in TypeScript files`);
  console.log(`(Absolute paths and URLs only)\n`);
}

/**
 * Example 5: Find broken internal links
 */
async function example5() {
  console.log("Example 5: Finding potentially broken links\n");

  const links = await scanMarkdownFiles("./content", {
    includeAbsolutePaths: true,
    includeRelativePaths: true,
  });

  // Group by URL to find duplicates
  const urlCounts: Record<string, number> = {};

  links.forEach((link) => {
    urlCounts[link.url] = (urlCounts[link.url] || 0) + 1;
  });

  console.log("Most referenced internal links:");
  Object.entries(urlCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([url, count]) => {
      console.log(`  ${count}x ${url}`);
    });
  console.log();
}

/**
 * Example 6: Export to JSON for further processing
 */
async function example6() {
  console.log("Example 6: Export to JSON\n");

  const links = await scanAllSourceFiles("./content");

  const report = {
    scannedAt: new Date().toISOString(),
    totalLinks: links.length,
    uniqueUrls: new Set(links.map((l) => l.url)).size,
    sourceFiles: new Set(links.map((l) => l.sourceFile)).size,
    links: links.slice(0, 10), // First 10 for demo
  };

  console.log("Report structure:");
  console.log(JSON.stringify(report, null, 2));
}

// Run examples (comment out the ones you don't want to run)
async function main() {
  try {
    await example1();
    // await example2();
    // await example3();
    // await example4();
    // await example5();
    // await example6();
  } catch (error) {
    console.error("Error running examples:", error);
  }
}

// Uncomment to run examples:
// main();
