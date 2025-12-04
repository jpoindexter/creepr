"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Code,
  Loader2,
  FolderOpen,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

type AuditMode = "comprehensive" | "ai";

// Check if File System Access API is available
const hasFileSystemAccess = typeof window !== "undefined" && "showDirectoryPicker" in window;

export function SourceAuditPanel() {
  const [directoryName, setDirectoryName] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [auditMode, setAuditMode] = useState<AuditMode>("comprehensive");
  const [fileHandles, setFileHandles] = useState<Map<string, string>>(new Map());
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("qwen2.5:32b");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    auditStatus,
    setAuditStatus,
    setAuditProgress,
    setDesignSystemReport,
  } = useAppStore();

  // Fetch available Ollama models on mount
  useEffect(() => {
    fetch("/api/audit/ai")
      .then((res) => res.json())
      .then((data) => {
        if (data.models?.length > 0) {
          setAvailableModels(data.models);
          // Prefer smaller models to avoid OOM - 7-22B work best
          const preferred = ["codestral:22b", "qwen2.5-coder:7b", "llama3.1:latest", "mistral:latest"];
          const found = preferred.find((m) => data.models.some((model: string) => model.includes(m.split(":")[0])));
          if (found) {
            const match = data.models.find((model: string) => model.includes(found.split(":")[0]));
            if (match) setSelectedModel(match);
          } else {
            // Default to first available model
            setSelectedModel(data.models[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handlePickDirectory = async () => {
    // Try modern File System Access API first (Chrome/Edge)
    if (hasFileSystemAccess) {
      try {
        const dirHandle = await window.showDirectoryPicker({ mode: "read" });
        setDirectoryName(dirHandle.name);
        setIsLoadingFiles(true);
        setAuditProgress({ stage: "Reading files...", percent: 5 });

        const files = new Map<string, string>();
        await readDirectoryRecursive(dirHandle, "", files);
        setFileHandles(files);
        setIsLoadingFiles(false);
        setAuditProgress(null);
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return; // User cancelled
        }
        console.error("File System Access API failed:", error);
      }
    }

    // Fallback: use file input with webkitdirectory
    fileInputRef.current?.click();
  };

  // Include ALL source files - no filtering
  const isSourceFile = (name: string): boolean => {
    // Only source files
    if (!/\.(tsx?|jsx?|css|scss|less)$/.test(name)) return false;
    // Skip type definition files
    if (name.endsWith(".d.ts")) return false;
    return true;
  };

  // Handle fallback file input (works in all browsers)
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsLoadingFiles(true);
    setAuditProgress({ stage: "Reading files...", percent: 5 });
    const files = new Map<string, string>();
    const skipDirs = ["node_modules", ".next", ".git", "dist", "build", "coverage", ".turbo"];

    // Get directory name from first file's path
    const firstPath = fileList[0].webkitRelativePath;
    const dirName = firstPath.split("/")[0];
    setDirectoryName(dirName);

    const totalFiles = Array.from(fileList).length;
    let processed = 0;

    for (const file of Array.from(fileList)) {
      const path = file.webkitRelativePath;

      // Skip excluded directories
      if (skipDirs.some((dir) => path.includes(`/${dir}/`) || path.startsWith(`${dir}/`))) continue;
      if (path.split("/").some((part) => part.startsWith("."))) continue;

      // Include all source files
      if (!isSourceFile(file.name)) continue;

      try {
        const content = await file.text();
        // Use path relative to selected directory
        const relativePath = path.split("/").slice(1).join("/");
        files.set(relativePath, content);
      } catch (err) {
        console.error(`Failed to read ${path}:`, err);
      }

      processed++;
      if (processed % 50 === 0) {
        setAuditProgress({
          stage: `Reading files... (${processed}/${totalFiles})`,
          percent: Math.min(50, (processed / totalFiles) * 100)
        });
      }
    }

    setFileHandles(files);
    setIsLoadingFiles(false);
    setAuditProgress(null);

    // Reset input so same folder can be selected again
    e.target.value = "";
  };

  const readDirectoryRecursive = async (
    dirHandle: FileSystemDirectoryHandle,
    basePath: string,
    files: Map<string, string>
  ) => {
    const skipDirs = ["node_modules", ".next", ".git", "dist", "build", "coverage", ".turbo"];

    for await (const entry of dirHandle.values()) {
      const entryPath = basePath ? `${basePath}/${entry.name}` : entry.name;

      if (entry.kind === "directory") {
        if (!skipDirs.includes(entry.name) && !entry.name.startsWith(".")) {
          const subDirHandle = await dirHandle.getDirectoryHandle(entry.name);
          await readDirectoryRecursive(subDirHandle, entryPath, files);
        }
      } else if (entry.kind === "file") {
        // Include all source files
        if (isSourceFile(entry.name)) {
          const fileHandle = await dirHandle.getFileHandle(entry.name);
          const file = await fileHandle.getFile();
          const content = await file.text();
          files.set(entryPath, content);
        }
      }
    }
  };

  const handleAudit = async () => {
    if (fileHandles.size === 0) {
      alert("Please select a directory first");
      return;
    }

    setAuditStatus("auditing");
    setDesignSystemReport(null); // Clear global report
    setAuditProgress({ stage: "Preparing files...", percent: 5 });

    const filesArray = Array.from(fileHandles.entries()).map(([path, content]) => ({
      path,
      content,
    }));

    let progressPercent = 15;

    try {
      if (auditMode === "ai") {
        setAuditProgress({ stage: "Sending to AI model...", percent: 15 });

        // Simulate progress for AI (we can't know exact progress)
        const progressInterval = setInterval(() => {
          progressPercent = Math.min(progressPercent + 5, 85);
          const stage = progressPercent < 30 ? "Loading model..." :
                       progressPercent < 50 ? "Analyzing code patterns..." :
                       progressPercent < 70 ? "Finding inconsistencies..." :
                       "Generating recommendations...";
          setAuditProgress({ stage, percent: progressPercent });
        }, 2000);

        const response = await fetch("/api/audit/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: filesArray, model: selectedModel }),
        });

        clearInterval(progressInterval);
        setAuditProgress({ stage: "Processing results...", percent: 95 });

        if (!response.ok) {
          const error = await response.json();
          alert(`AI Audit failed: ${error.error}`);
        } else {
          // AI report - for now, just log results
          const aiReport = await response.json();
          console.log("AI Report:", aiReport);
          alert(`AI found ${aiReport.inconsistencies?.length || 0} inconsistencies. Check console for details.`);
        }
      } else {
        // Comprehensive Design System Audit
        setAuditProgress({ stage: `Scanning ${filesArray.length} files...`, percent: 30 });

        const response = await fetch("/api/audit/design-system", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: filesArray }),
        });

        setAuditProgress({ stage: "Processing results...", percent: 80 });

        if (!response.ok) {
          const error = await response.json();
          alert(`Audit failed: ${error.error}`);
        } else {
          const report = await response.json();
          setDesignSystemReport(report); // Save to global store for main content display
        }
      }
    } catch (error) {
      alert(`Audit error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    setAuditProgress({ stage: "Complete!", percent: 100 });
    setTimeout(() => {
      setAuditProgress(null);
      setAuditStatus("completed");
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Code className="h-5 w-5" />
          Design System Audit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Comprehensive scan for design inconsistencies with file:line locations
        </p>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={auditMode === "comprehensive" ? "default" : "outline"}
            size="sm"
            onClick={() => setAuditMode("comprehensive")}
            className="flex-1"
          >
            <Zap className="mr-2 h-4 w-4" />
            Full Scan
          </Button>
          <Button
            variant={auditMode === "ai" ? "default" : "outline"}
            size="sm"
            onClick={() => setAuditMode("ai")}
            className="flex-1"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Analysis
          </Button>
        </div>

        {/* AI Model Selector */}
        {auditMode === "ai" && availableModels.length > 0 && (
          <div className="space-y-1">
            <label htmlFor="ollama-model-select" className="text-xs font-medium text-gray-500">Ollama Model</label>
            <select
              id="ollama-model-select"
              name="ollama-model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model} {(model.includes("70b") || model.includes("32b")) ? "⚠️" : ""}
                </option>
              ))}
            </select>
            {(selectedModel.includes("70b") || selectedModel.includes("32b")) && (
              <p className="text-xs text-orange-600">
                ⚠️ Large models may run out of memory. Try a smaller model like codestral:22b or mistral.
              </p>
            )}
          </div>
        )}

        {/* Hidden file input for fallback directory picker */}
        <input
          ref={fileInputRef}
          type="file"
          /* @ts-expect-error webkitdirectory is non-standard but widely supported */
          webkitdirectory=""
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Folder Picker */}
        <Button
          variant="outline"
          onClick={handlePickDirectory}
          disabled={isLoadingFiles}
          className="w-full justify-start gap-2 font-mono text-sm"
        >
          {isLoadingFiles ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-gray-500">Loading files...</span>
            </>
          ) : (
            <>
              <FolderOpen className="h-4 w-4 text-blue-500" />
              {directoryName ? (
                <span>
                  {directoryName}{" "}
                  <span className="text-gray-400">({fileHandles.size} files)</span>
                </span>
              ) : (
                <span className="text-gray-500">Choose folder...</span>
              )}
            </>
          )}
        </Button>

        {/* Audit Button */}
        <Button
          onClick={handleAudit}
          disabled={auditStatus === "auditing" || isLoadingFiles || fileHandles.size === 0}
          className="w-full"
        >
          {auditStatus === "auditing" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            "Run Audit"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
