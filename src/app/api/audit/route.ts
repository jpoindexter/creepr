import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import {
  auditFileContent,
  mergeAuditResults,
  DEFAULT_AUDIT_PATTERNS,
  AuditPattern,
  AuditResult,
} from "@/lib/source-auditor";

// Route segment config - set max duration for audit operations
export const maxDuration = 120; // 2 minutes for large codebases

interface FileInput {
  path: string;
  content: string;
}

interface AuditRequest {
  // Files to audit (from browser File System Access API)
  files?: FileInput[];
  // Path to scan (relative to project root, e.g., "src") - legacy mode
  path?: string;
  // File extensions to include (default: [".tsx", ".ts", ".jsx", ".js"])
  extensions?: string[];
  // Custom patterns to use (optional, uses defaults if not provided)
  patterns?: Array<{
    name: string;
    description: string;
    regex: string; // Will be converted to RegExp
    expected: "none" | "all";
    category: string;
  }>;
  // Patterns to exclude by name
  excludePatterns?: string[];
  // Directories to skip
  excludeDirs?: string[];
}

// Files to exclude from audit (infrastructure/config files that define patterns)
const EXCLUDED_FILES = [
  "source-auditor.ts", // Defines the audit patterns themselves
  "switch.tsx", // Switch component uses pill shape intentionally
];

// Path patterns to exclude (matched against full relative path)
const EXCLUDED_PATH_PATTERNS = [
  "lib/export.ts", // Contains documentation comments about patterns
  "lib/auditor/", // Audit infrastructure files
  "design-system/", // Design system config files use pattern names as values
];

async function getAllFiles(
  dirPath: string,
  extensions: string[],
  excludeDirs: string[]
): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentPath: string) {
    try {
      const entries = await readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name);

        if (entry.isDirectory()) {
          // Skip excluded directories and common non-source dirs
          const skipDirs = ["node_modules", ".next", ".git", "dist", "build", ...excludeDirs];
          if (!skipDirs.includes(entry.name)) {
            await walk(fullPath);
          }
        } else if (entry.isFile()) {
          // Check extension and exclude infrastructure files
          const isExcludedFile = EXCLUDED_FILES.includes(entry.name);
          const isExcludedPath = EXCLUDED_PATH_PATTERNS.some((pattern) =>
            fullPath.includes(pattern)
          );
          if (
            extensions.some((ext) => entry.name.endsWith(ext)) &&
            !isExcludedFile &&
            !isExcludedPath
          ) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentPath}:`, error);
    }
  }

  await walk(dirPath);
  return files;
}

export async function POST(request: NextRequest) {
  try {
    const body: AuditRequest = await request.json();

    // Get patterns to use
    let patterns: AuditPattern[] = DEFAULT_AUDIT_PATTERNS;

    // Apply custom patterns if provided
    if (body.patterns && body.patterns.length > 0) {
      patterns = body.patterns.map((p) => ({
        ...p,
        regex: new RegExp(p.regex, "g"),
      }));
    }

    // Exclude patterns by name if requested
    if (body.excludePatterns && body.excludePatterns.length > 0) {
      patterns = patterns.filter((p) => !body.excludePatterns!.includes(p.name));
    }

    // Mode 1: Files provided directly from browser (File System Access API)
    if (body.files && body.files.length > 0) {
      const allResults: AuditResult[][] = [];

      for (const file of body.files) {
        const fileResults = auditFileContent(file.path, file.content, patterns);
        if (fileResults.length > 0) {
          allResults.push(fileResults);
        }
      }

      const report = mergeAuditResults(allResults);

      return NextResponse.json({
        ...report,
        filesScanned: body.files.length,
        scanPath: "(browser upload)",
      });
    }

    // Mode 2: Path-based scanning (legacy/server-side mode)
    if (!body.path) {
      return NextResponse.json({ error: "Either 'files' or 'path' is required" }, { status: 400 });
    }

    // Resolve path relative to project root
    const projectRoot = process.cwd();
    const scanPath = join(projectRoot, body.path);

    // Default extensions
    const extensions = body.extensions || [".tsx", ".ts", ".jsx", ".js"];
    const excludeDirs = body.excludeDirs || [];

    // Find all files
    const files = await getAllFiles(scanPath, extensions, excludeDirs);

    if (files.length === 0) {
      return NextResponse.json(
        {
          error: `No files found matching extensions ${extensions.join(", ")} in ${body.path}`,
        },
        { status: 404 }
      );
    }

    // Audit each file
    const allResults: AuditResult[][] = [];

    for (const filePath of files) {
      try {
        const content = await readFile(filePath, "utf-8");
        // Make path relative for cleaner output
        const relativePath = filePath.replace(projectRoot + "/", "");
        const fileResults = auditFileContent(relativePath, content, patterns);
        if (fileResults.length > 0) {
          allResults.push(fileResults);
        }
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
      }
    }

    // Merge all results
    const report = mergeAuditResults(allResults);

    return NextResponse.json({
      ...report,
      filesScanned: files.length,
      scanPath: body.path,
    });
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Audit failed" },
      { status: 500 }
    );
  }
}

// GET endpoint for quick audit with defaults
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get("path") || "src";

  // Forward to POST handler
  const mockRequest = {
    json: async () => ({ path }),
  } as NextRequest;

  return POST(mockRequest);
}
