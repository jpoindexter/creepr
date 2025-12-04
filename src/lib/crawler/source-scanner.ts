import { readdir, readFile } from "fs/promises";
import { join, extname } from "path";

/**
 * Represents a link found in source code
 */
export interface SourceLink {
  url: string;
  sourceFile: string;
  lineNumber: number;
  linkText?: string;
}

/**
 * Options for source file scanning
 */
export interface ScanOptions {
  /**
   * Whether to include relative paths (e.g., ../docs/guide)
   * @default true
   */
  includeRelativePaths?: boolean;

  /**
   * Whether to include absolute paths (e.g., /docs/guide)
   * @default true
   */
  includeAbsolutePaths?: boolean;

  /**
   * Whether to include full URLs (e.g., https://example.com/docs)
   * @default true
   */
  includeFullUrls?: boolean;

  /**
   * Base URL to filter by (only return URLs starting with this)
   * @default undefined (no filtering)
   */
  baseUrl?: string;

  /**
   * Whether to deduplicate results (same URL + file)
   * @default true
   */
  deduplicate?: boolean;
}

/**
 * Regular expressions for finding links in different file types
 */
const LINK_PATTERNS = {
  // Markdown links: [text](url) or [text](url "title")
  markdown: /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,

  // Inline URLs: http(s)://... or /path/to/page
  inlineUrl: /(https?:\/\/[^\s\)<>"']+|\/[a-zA-Z0-9_\-\/\.]+)/g,

  // Import/require statements in TS/JS
  importPath: /(?:from|import|require)\s*\(?\s*["']([^"']+)["']/g,

  // href attributes in JSX/TSX
  jsxHref: /href=["']([^"']+)["']/g,

  // Links in JSON config files
  jsonUrl: /"(?:url|link|href|path)":\s*"([^"]+)"/g,
};

/**
 * File extensions to scan
 */
const FILE_EXTENSIONS = {
  markdown: [".md", ".mdx"],
  code: [".ts", ".tsx", ".js", ".jsx"],
  config: [".json", ".jsonc"],
};

/**
 * Recursively finds all files matching the given patterns
 */
async function findFiles(
  dir: string,
  patterns: string[],
  results: string[] = []
): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip node_modules, .git, .next, etc.
      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
        await findFiles(fullPath, patterns, results);
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        if (patterns.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
    console.error(`Error reading directory ${dir}:`, error);
  }

  return results;
}

/**
 * Determines if a URL is internal (relative or absolute path)
 */
function isInternalUrl(url: string): boolean {
  // Relative paths
  if (url.startsWith("./") || url.startsWith("../")) {
    return true;
  }

  // Absolute paths (starting with /)
  if (url.startsWith("/") && !url.startsWith("//")) {
    return true;
  }

  // Check if it's a full URL
  try {
    new URL(url);
    return false; // It's a full URL, not internal
  } catch {
    // Not a valid URL, might be a module path
    return false;
  }
}

/**
 * Filters URL based on options
 */
function shouldIncludeUrl(url: string, options: ScanOptions): boolean {
  const {
    includeRelativePaths = true,
    includeAbsolutePaths = true,
    includeFullUrls = true,
    baseUrl,
  } = options;

  // Filter by base URL if provided
  if (baseUrl && url.startsWith("http")) {
    if (!url.startsWith(baseUrl)) {
      return false;
    }
  }

  // Check relative paths
  if (url.startsWith("./") || url.startsWith("../")) {
    return includeRelativePaths;
  }

  // Check absolute paths
  if (url.startsWith("/") && !url.startsWith("//")) {
    return includeAbsolutePaths;
  }

  // Check full URLs
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return includeFullUrls;
  }

  return false;
}

/**
 * Extracts links from markdown content
 */
function extractMarkdownLinks(
  content: string,
  sourceFile: string,
  options: ScanOptions
): SourceLink[] {
  const links: SourceLink[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    let match;
    const regex = new RegExp(LINK_PATTERNS.markdown);

    while ((match = regex.exec(line)) !== null) {
      const [, linkText, url] = match;

      if (shouldIncludeUrl(url, options)) {
        links.push({
          url,
          sourceFile,
          lineNumber: index + 1,
          linkText,
        });
      }
    }

    // Also check for inline URLs
    const inlineRegex = new RegExp(LINK_PATTERNS.inlineUrl);
    while ((match = inlineRegex.exec(line)) !== null) {
      const url = match[1];

      if (shouldIncludeUrl(url, options)) {
        // Don't add if already captured as markdown link
        const alreadyAdded = links.some((l) => l.url === url && l.lineNumber === index + 1);

        if (!alreadyAdded) {
          links.push({
            url,
            sourceFile,
            lineNumber: index + 1,
          });
        }
      }
    }
  });

  return links;
}

/**
 * Extracts links from code files (TS/JS)
 */
function extractCodeLinks(content: string, sourceFile: string, options: ScanOptions): SourceLink[] {
  const links: SourceLink[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    // Check for href attributes (JSX)
    let match;
    const hrefRegex = new RegExp(LINK_PATTERNS.jsxHref);

    while ((match = hrefRegex.exec(line)) !== null) {
      const url = match[1];

      if (shouldIncludeUrl(url, options)) {
        links.push({
          url,
          sourceFile,
          lineNumber: index + 1,
        });
      }
    }

    // Check for inline URLs
    const inlineRegex = new RegExp(LINK_PATTERNS.inlineUrl);
    while ((match = inlineRegex.exec(line)) !== null) {
      const url = match[1];

      if (shouldIncludeUrl(url, options)) {
        // Don't add if already captured
        const alreadyAdded = links.some((l) => l.url === url && l.lineNumber === index + 1);

        if (!alreadyAdded) {
          links.push({
            url,
            sourceFile,
            lineNumber: index + 1,
          });
        }
      }
    }
  });

  return links;
}

/**
 * Extracts links from JSON config files
 */
function extractJsonLinks(content: string, sourceFile: string, options: ScanOptions): SourceLink[] {
  const links: SourceLink[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    let match;
    const jsonRegex = new RegExp(LINK_PATTERNS.jsonUrl);

    while ((match = jsonRegex.exec(line)) !== null) {
      const url = match[1];

      if (shouldIncludeUrl(url, options)) {
        links.push({
          url,
          sourceFile,
          lineNumber: index + 1,
        });
      }
    }

    // Also check for inline URLs
    const inlineRegex = new RegExp(LINK_PATTERNS.inlineUrl);
    while ((match = inlineRegex.exec(line)) !== null) {
      const url = match[1];

      if (shouldIncludeUrl(url, options)) {
        const alreadyAdded = links.some((l) => l.url === url && l.lineNumber === index + 1);

        if (!alreadyAdded) {
          links.push({
            url,
            sourceFile,
            lineNumber: index + 1,
          });
        }
      }
    }
  });

  return links;
}

/**
 * Scans a single file for links
 */
async function scanFile(filePath: string, options: ScanOptions): Promise<SourceLink[]> {
  try {
    const content = await readFile(filePath, "utf-8");
    const ext = extname(filePath);

    if (FILE_EXTENSIONS.markdown.includes(ext)) {
      return extractMarkdownLinks(content, filePath, options);
    } else if (FILE_EXTENSIONS.code.includes(ext)) {
      return extractCodeLinks(content, filePath, options);
    } else if (FILE_EXTENSIONS.config.includes(ext)) {
      return extractJsonLinks(content, filePath, options);
    }

    return [];
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error);
    return [];
  }
}

/**
 * Deduplicates source links by URL and source file
 */
function deduplicateLinks(links: SourceLink[]): SourceLink[] {
  const seen = new Set<string>();
  const deduplicated: SourceLink[] = [];

  for (const link of links) {
    const key = `${link.url}|${link.sourceFile}`;

    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(link);
    }
  }

  return deduplicated;
}

/**
 * Scans source files for internal links
 *
 * @param contentDir - Root directory to scan
 * @param patterns - File extensions to include (e.g., ['.md', '.mdx', '.ts'])
 * @param options - Scanning options
 * @returns Array of source links found
 *
 * @example
 * ```typescript
 * const links = await scanSourceFiles(
 *   '/path/to/content',
 *   ['.md', '.mdx'],
 *   { includeFullUrls: false }
 * );
 * ```
 */
export async function scanSourceFiles(
  contentDir: string,
  patterns: string[],
  options: ScanOptions = {}
): Promise<SourceLink[]> {
  const { deduplicate = true } = options;

  // Find all matching files
  const files = await findFiles(contentDir, patterns);

  // Scan each file in parallel
  const allLinksArrays = await Promise.all(files.map((file) => scanFile(file, options)));

  // Flatten results
  let allLinks = allLinksArrays.flat();

  // Deduplicate if requested
  if (deduplicate) {
    allLinks = deduplicateLinks(allLinks);
  }

  // Sort by source file, then line number
  allLinks.sort((a, b) => {
    const fileCompare = a.sourceFile.localeCompare(b.sourceFile);
    if (fileCompare !== 0) return fileCompare;
    return a.lineNumber - b.lineNumber;
  });

  return allLinks;
}

/**
 * Convenience function to scan all common source file types
 */
export async function scanAllSourceFiles(
  contentDir: string,
  options: ScanOptions = {}
): Promise<SourceLink[]> {
  const allExtensions = [
    ...FILE_EXTENSIONS.markdown,
    ...FILE_EXTENSIONS.code,
    ...FILE_EXTENSIONS.config,
  ];

  return scanSourceFiles(contentDir, allExtensions, options);
}

/**
 * Convenience function to scan only markdown files
 */
export async function scanMarkdownFiles(
  contentDir: string,
  options: ScanOptions = {}
): Promise<SourceLink[]> {
  return scanSourceFiles(contentDir, FILE_EXTENSIONS.markdown, options);
}

/**
 * Convenience function to scan only code files
 */
export async function scanCodeFiles(
  contentDir: string,
  options: ScanOptions = {}
): Promise<SourceLink[]> {
  return scanSourceFiles(contentDir, FILE_EXTENSIONS.code, options);
}

/**
 * Convenience function to scan only config files
 */
export async function scanConfigFiles(
  contentDir: string,
  options: ScanOptions = {}
): Promise<SourceLink[]> {
  return scanSourceFiles(contentDir, FILE_EXTENSIONS.config, options);
}
