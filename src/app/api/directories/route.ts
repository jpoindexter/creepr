import { NextRequest, NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";

interface DirectoryEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

async function getDirectories(basePath: string): Promise<DirectoryEntry[]> {
  const projectRoot = process.cwd();
  const fullPath = join(projectRoot, basePath);

  try {
    const entries = await readdir(fullPath, { withFileTypes: true });

    // Filter to only directories and exclude common non-source dirs
    const skipDirs = ["node_modules", ".next", ".git", "dist", "build", ".husky", ".vscode"];

    return entries
      .filter((entry) => entry.isDirectory() && !skipDirs.includes(entry.name) && !entry.name.startsWith("."))
      .map((entry) => ({
        name: entry.name,
        path: basePath ? `${basePath}/${entry.name}` : entry.name,
        isDirectory: true,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error(`Error reading directory ${fullPath}:`, error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get("path") || "";

  const directories = await getDirectories(path);

  return NextResponse.json({
    currentPath: path || "(project root)",
    directories,
  });
}
