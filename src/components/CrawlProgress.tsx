"use client";

import { useAppStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function CrawlProgress() {
  const { crawlProgress } = useAppStore();

  // Show immediately with 0% if no progress data yet
  const progress = crawlProgress ?? {
    requestsTotal: 0,
    requestsFinished: 0,
    requestsFailed: 0,
    currentUrl: "",
  };

  const percentage =
    progress.requestsTotal > 0
      ? Math.round((progress.requestsFinished / progress.requestsTotal) * 100)
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Crawl Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress percentage */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{percentage}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {progress.requestsFinished} / {progress.requestsTotal} pages
          </span>
          {progress.requestsFailed > 0 && (
            <span className="text-red-500">{progress.requestsFailed} failed</span>
          )}
        </div>

        {/* Current URL */}
        {progress.currentUrl && (
          <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2">
            <Loader2 className="h-3 w-3 flex-shrink-0 animate-spin text-blue-500" />
            <span className="truncate font-mono text-xs text-muted-foreground">
              {progress.currentUrl}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
