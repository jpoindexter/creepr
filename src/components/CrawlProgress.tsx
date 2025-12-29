"use client";

import { useAppStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";

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
    <Card role="region" aria-label="Crawl progress">
      <CardHeader title="CRAWL_PROGRESS" />
      <CardContent className="space-y-3">
        {/* Progress percentage */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground" id="progress-label">
            Progress
          </span>
          <span className="font-medium" aria-live="polite">
            {percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="bg-muted h-2 w-full"
          role="progressbar"
          aria-labelledby="progress-label"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${percentage}% complete, ${progress.requestsFinished} of ${progress.requestsTotal} pages crawled`}
        >
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Stats */}
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span aria-live="polite">
            {progress.requestsFinished} / {progress.requestsTotal} pages
          </span>
          {progress.requestsFailed > 0 && (
            <span className="text-destructive" role="alert">
              {progress.requestsFailed} failed
            </span>
          )}
        </div>

        {/* Current URL */}
        {progress.currentUrl && (
          <div
            className="border-border bg-muted flex items-center gap-2 border p-2"
            aria-live="polite"
          >
            <Loader2
              className="text-muted-foreground h-3 w-3 flex-shrink-0 animate-spin"
              aria-hidden="true"
            />
            <span className="text-muted-foreground truncate font-mono text-xs">
              Currently crawling: {progress.currentUrl}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
