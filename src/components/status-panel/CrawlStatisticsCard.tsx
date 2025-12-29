"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Plug,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { FailedUrl, ErrorSummary } from "@/types/sitemap";

interface CrawlStatisticsCardProps {
  totalPages: number;
  brokenLinks: number;
  apiEndpoints?: number;
  crawlTime?: number;
  failedUrls?: FailedUrl[];
  errorSummary?: ErrorSummary;
}

export function CrawlStatisticsCard({
  totalPages,
  brokenLinks,
  apiEndpoints = 0,
  crawlTime,
  failedUrls = [],
  errorSummary,
}: CrawlStatisticsCardProps) {
  const [showErrors, setShowErrors] = useState(false);
  const successPages = totalPages - brokenLinks;
  const hasErrors = failedUrls.length > 0;

  return (
    <Card>
      <CardHeader title="CRAWL_STATISTICS" icon={<BarChart3 className="h-4 w-4" />} />
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">Total Pages</span>
          </div>
          <span className="font-semibold">{totalPages}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-foreground h-4 w-4" />
            <span className="text-sm">Success</span>
          </div>
          <span className="text-foreground font-semibold">{successPages}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="text-destructive h-4 w-4" />
            <span className="text-sm">Broken Links</span>
          </div>
          <span className="text-destructive font-semibold">{brokenLinks}</span>
        </div>

        {apiEndpoints > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plug className="h-4 w-4 text-blue-500" />
              <span className="text-sm">API Endpoints</span>
            </div>
            <span className="font-semibold text-blue-500">{apiEndpoints}</span>
          </div>
        )}

        {crawlTime !== undefined && (
          <div className="border-border flex items-center justify-between border-t pt-2">
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">Crawl Time</span>
            </div>
            <span className="font-mono text-sm">{formatDuration(crawlTime)}</span>
          </div>
        )}

        {/* Error Summary */}
        {hasErrors && errorSummary && (
          <div className="border-border space-y-2 border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowErrors(!showErrors)}
              className="hover:bg-muted flex w-full items-center justify-between p-2"
              aria-expanded={showErrors}
              aria-controls="error-details"
              aria-label={`${showErrors ? "Hide" : "Show"} ${failedUrls.length} errors`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-destructive h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-medium">Errors ({failedUrls.length})</span>
              </div>
              {showErrors ? (
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>

            {showErrors && (
              <div id="error-details" className="space-y-2 text-xs">
                {/* Error type breakdown */}
                <div className="bg-muted space-y-1 p-2">
                  {errorSummary.timeout > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeouts:</span>
                      <span className="text-destructive font-semibold">{errorSummary.timeout}</span>
                    </div>
                  )}
                  {errorSummary.redirect > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Redirect loops:</span>
                      <span className="text-destructive font-semibold">
                        {errorSummary.redirect}
                      </span>
                    </div>
                  )}
                  {errorSummary.other > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Other:</span>
                      <span className="text-destructive font-semibold">{errorSummary.other}</span>
                    </div>
                  )}
                </div>

                {/* Failed URLs list */}
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {failedUrls.map((failed, index) => (
                    <div key={index} className="border-destructive/30 bg-destructive/5 border p-2">
                      <div className="text-destructive font-mono text-xs break-all">
                        {failed.url}
                      </div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {failed.errorType} • {failed.retryCount}{" "}
                        {failed.retryCount === 1 ? "retry" : "retries"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
