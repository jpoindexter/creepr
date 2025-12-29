"use client";

import { Loader2, AlertCircle } from "lucide-react";

interface AuditProgress {
  stage: string;
  percent: number;
}

export function CrawlingState() {
  return (
    <div
      className="flex h-full items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center font-mono">
        <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" aria-hidden="true" />
        <p className="text-lg font-medium">Crawling website...</p>
        <p className="text-muted-foreground mt-2 text-sm">This may take a few moments</p>
      </div>
    </div>
  );
}

export function LayoutCalculatingState() {
  return (
    <div
      className="flex h-full items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center font-mono">
        <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" aria-hidden="true" />
        <p className="text-lg font-medium">Calculating layout...</p>
        <p className="text-muted-foreground mt-2 text-sm">Building sitemap visualization</p>
      </div>
    </div>
  );
}

export function AuditProgressState({ auditProgress }: { auditProgress: AuditProgress }) {
  return (
    <div
      className="flex h-full items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-md space-y-4 px-8">
        <div className="text-center font-mono">
          <div className="text-primary mb-4 text-6xl" aria-hidden="true">
            [SCAN]
          </div>
          <p className="text-lg font-medium">Auditing Source Code</p>
          <p className="text-muted-foreground mt-2 text-sm">{auditProgress.stage}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-primary">{auditProgress.percent}%</span>
          </div>
          <div
            className="bg-muted h-2 w-full overflow-hidden"
            role="progressbar"
            aria-valuenow={auditProgress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Audit progress"
          >
            <div
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${auditProgress.percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorState() {
  return (
    <div className="text-muted-foreground flex h-full items-center justify-center">
      <div className="text-center font-mono">
        <AlertCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
        <p className="text-lg font-medium">Crawl failed</p>
        <p className="mt-2 text-sm">Check the error details in the sidebar</p>
      </div>
    </div>
  );
}

export function EmptyResultState() {
  return (
    <div
      className="text-muted-foreground flex h-full items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-md px-4 text-center font-mono">
        <div className="mb-6 text-6xl">[ ]</div>
        <h2 className="text-foreground mb-2 text-xl font-bold">No pages found</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          The crawler could not find any pages at this URL. This might happen if:
        </p>
        <ul className="mb-6 list-inside list-disc space-y-2 text-left text-sm">
          <li>The URL is incorrect or the server is not running</li>
          <li>The page requires authentication</li>
          <li>The page uses client-side rendering with no server-side content</li>
          <li>Robots.txt or other restrictions block crawling</li>
        </ul>
        <p className="text-muted-foreground text-sm">
          Try a different URL or check that your development server is running.
        </p>
      </div>
    </div>
  );
}
