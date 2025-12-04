/**
 * Integration Example: Source Scanner + Link Analysis
 *
 * This example shows how to use the source scanner to analyze links
 * in your codebase and generate useful reports.
 */

import { scanAllSourceFiles, scanMarkdownFiles } from "./source-scanner";
import { isValidHttpUrl } from "./link-validator";

interface LinkReference {
  file: string;
  line: number;
  linkText?: string;
}

interface LinkAnalysis {
  url: string;
  isExternal: boolean;
  isRelative: boolean;
  isAbsolute: boolean;
  references: LinkReference[];
}

/**
 * Analyzes all links found in source files
 */
export async function analyzeAllLinks(contentDir: string): Promise<{
  totalReferences: number;
  uniqueUrls: number;
  externalLinks: number;
  relativeLinks: number;
  absoluteLinks: number;
  linkAnalysis: LinkAnalysis[];
}> {
  console.log("Step 1: Scanning source files for links...");

  // Find all links in markdown files
  const sourceLinks = await scanMarkdownFiles(contentDir, {
    includeRelativePaths: true,
    includeAbsolutePaths: true,
    includeFullUrls: true,
  });

  console.log(`Found ${sourceLinks.length} link references`);

  // Group by URL
  const linkGroups = new Map<string, LinkReference[]>();

  sourceLinks.forEach((link) => {
    if (!linkGroups.has(link.url)) {
      linkGroups.set(link.url, []);
    }
    linkGroups.get(link.url)!.push({
      file: link.sourceFile,
      line: link.lineNumber,
      linkText: link.linkText,
    });
  });

  console.log(`Found ${linkGroups.size} unique URLs`);

  // Analyze each unique URL
  const linkAnalysis: LinkAnalysis[] = Array.from(linkGroups.entries()).map(([url, references]) => {
    const isExternal = isValidHttpUrl(url);
    const isRelative = url.startsWith("./") || url.startsWith("../");
    const isAbsolute = url.startsWith("/") && !url.startsWith("//");

    return {
      url,
      isExternal,
      isRelative,
      isAbsolute,
      references,
    };
  });

  // Calculate stats
  const externalLinks = linkAnalysis.filter((l) => l.isExternal).length;
  const relativeLinks = linkAnalysis.filter((l) => l.isRelative).length;
  const absoluteLinks = linkAnalysis.filter((l) => l.isAbsolute).length;

  return {
    totalReferences: sourceLinks.length,
    uniqueUrls: linkGroups.size,
    externalLinks,
    relativeLinks,
    absoluteLinks,
    linkAnalysis,
  };
}

/**
 * Example usage of the analysis workflow
 */
async function example() {
  const results = await analyzeAllLinks("./content");

  console.log("\n=== Link Analysis Report ===");
  console.log(`Total link references: ${results.totalReferences}`);
  console.log(`Unique URLs: ${results.uniqueUrls}`);
  console.log(`External links: ${results.externalLinks}`);
  console.log(`Relative links: ${results.relativeLinks}`);
  console.log(`Absolute links: ${results.absoluteLinks}`);

  // Show most referenced URLs
  const sortedByReferences = results.linkAnalysis.sort(
    (a, b) => b.references.length - a.references.length
  );

  console.log("\n=== Top 10 Most Referenced URLs ===");
  sortedByReferences.slice(0, 10).forEach((link) => {
    console.log(`\n${link.url} (${link.references.length} references)`);
    console.log(
      `  Type: ${link.isExternal ? "External" : link.isRelative ? "Relative" : "Absolute"}`
    );
    console.log(`  Referenced in:`);

    link.references.slice(0, 3).forEach((ref) => {
      console.log(`    - ${ref.file}:${ref.line}${ref.linkText ? ` ("${ref.linkText}")` : ""}`);
    });

    if (link.references.length > 3) {
      console.log(`    ... and ${link.references.length - 3} more`);
    }
  });
}

// Uncomment to run:
// example();
