"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, XCircle, Clock, FileText, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { FailedUrl, ErrorSummary } from "@/types/sitemap";

interface StatusPanelProps {
  totalPages: number;
  brokenLinks: number;
  crawlTime?: number;
  failedUrls?: FailedUrl[];
  errorSummary?: ErrorSummary;
  selectedNode?: {
    title: string;
    url: string;
    statusCode: number;
  };
}

export function StatusPanel({
  totalPages,
  brokenLinks,
  crawlTime,
  failedUrls = [],
  errorSummary,
  selectedNode,
}: StatusPanelProps) {
  const [showErrors, setShowErrors] = useState(false);
  const successPages = totalPages - brokenLinks;
  const hasErrors = failedUrls.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Crawl Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Total Pages</span>
            </div>
            <span className="font-semibold">{totalPages}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Success</span>
            </div>
            <span className="font-semibold text-green-600">{successPages}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Broken Links</span>
            </div>
            <span className="font-semibold text-red-600">{brokenLinks}</span>
          </div>

          {crawlTime !== undefined && (
            <div className="flex items-center justify-between border-t pt-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Crawl Time</span>
              </div>
              <span className="font-mono text-sm">{formatDuration(crawlTime)}</span>
            </div>
          )}

          {/* Error Summary */}
          {hasErrors && errorSummary && (
            <div className="border-t pt-3 space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowErrors(!showErrors)}
                className="w-full flex items-center justify-between p-2 hover:bg-red-50"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Errors ({failedUrls.length})</span>
                </div>
                {showErrors ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {showErrors && (
                <div className="space-y-2 text-xs">
                  {/* Error type breakdown */}
                  <div className="rounded bg-red-50 p-2 space-y-1">
                    {errorSummary.timeout > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timeouts:</span>
                        <span className="font-semibold text-red-700">{errorSummary.timeout}</span>
                      </div>
                    )}
                    {errorSummary.redirect > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Redirect loops:</span>
                        <span className="font-semibold text-red-700">{errorSummary.redirect}</span>
                      </div>
                    )}
                    {errorSummary.other > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Other:</span>
                        <span className="font-semibold text-red-700">{errorSummary.other}</span>
                      </div>
                    )}
                  </div>

                  {/* Failed URLs list */}
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {failedUrls.map((failed, index) => (
                      <div key={index} className="rounded border border-red-200 bg-white p-2">
                        <div className="font-mono text-xs break-all text-red-700">
                          {failed.url}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {failed.errorType} • {failed.retryCount} {failed.retryCount === 1 ? "retry" : "retries"}
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

      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Node</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="mb-1 text-xs text-gray-500">Title</div>
              <div className="text-sm font-medium">{selectedNode.title}</div>
            </div>

            <div>
              <div className="mb-1 text-xs text-gray-500">URL</div>
              <div className="break-all font-mono text-sm">{selectedNode.url}</div>
            </div>

            <div>
              <div className="mb-1 text-xs text-gray-500">Status Code</div>
              <span
                className={`inline-block rounded px-2 py-1 text-sm font-semibold ${
                  selectedNode.statusCode >= 400
                    ? "bg-red-100 text-red-700"
                    : selectedNode.statusCode >= 300
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                } `}
              >
                {selectedNode.statusCode}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
