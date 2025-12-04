"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, XCircle, Clock, FileText, AlertTriangle, ChevronDown, ChevronUp, Palette } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { FailedUrl, ErrorSummary } from "@/types/sitemap";
import { PageStyles } from "@/lib/crawler/types";

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
    styles?: PageStyles;
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
  const [showStyles, setShowStyles] = useState(false);
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

            {/* Page Styles Section */}
            {selectedNode.styles && (
              <div className="border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStyles(!showStyles)}
                  className="w-full flex items-center justify-between p-2 hover:bg-purple-50"
                >
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">
                      Page Styles ({selectedNode.styles.uniqueColors.length} colors, {selectedNode.styles.uniqueFonts.length} fonts)
                    </span>
                  </div>
                  {showStyles ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {showStyles && (
                  <div className="mt-2 space-y-3 text-xs">
                    {/* Colors */}
                    {selectedNode.styles.uniqueColors.length > 0 && (
                      <div>
                        <div className="mb-1 font-medium text-gray-700">Colors ({selectedNode.styles.uniqueColors.length})</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.styles.uniqueColors.slice(0, 20).map((color, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5"
                              title={color}
                            >
                              <span
                                className="h-3 w-3 rounded border border-gray-300"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-mono text-xs">{color.length > 20 ? color.slice(0, 20) + "..." : color}</span>
                            </span>
                          ))}
                          {selectedNode.styles.uniqueColors.length > 20 && (
                            <span className="text-gray-400">+{selectedNode.styles.uniqueColors.length - 20} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Fonts */}
                    {selectedNode.styles.uniqueFonts.length > 0 && (
                      <div>
                        <div className="mb-1 font-medium text-gray-700">Fonts ({selectedNode.styles.uniqueFonts.length})</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.styles.uniqueFonts.slice(0, 10).map((font, i) => (
                            <span key={i} className="rounded bg-blue-50 px-2 py-0.5 font-mono">
                              {font.length > 30 ? font.slice(0, 30) + "..." : font}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Border Radii */}
                    {selectedNode.styles.uniqueBorderRadii.length > 0 && (
                      <div>
                        <div className="mb-1 font-medium text-gray-700">Border Radii ({selectedNode.styles.uniqueBorderRadii.length})</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.styles.uniqueBorderRadii.slice(0, 10).map((r, i) => (
                            <span key={i} className="rounded bg-orange-50 px-2 py-0.5 font-mono">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Spacings */}
                    {selectedNode.styles.uniqueSpacings.length > 0 && (
                      <div>
                        <div className="mb-1 font-medium text-gray-700">Spacings ({selectedNode.styles.uniqueSpacings.length})</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.styles.uniqueSpacings.slice(0, 10).map((s, i) => (
                            <span key={i} className="rounded bg-green-50 px-2 py-0.5 font-mono">{s}</span>
                          ))}
                          {selectedNode.styles.uniqueSpacings.length > 10 && (
                            <span className="text-gray-400">+{selectedNode.styles.uniqueSpacings.length - 10} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CSS Variables */}
                    {Object.keys(selectedNode.styles.cssVariables).length > 0 && (
                      <div>
                        <div className="mb-1 font-medium text-gray-700">CSS Variables ({Object.keys(selectedNode.styles.cssVariables).length})</div>
                        <div className="max-h-32 overflow-y-auto space-y-0.5">
                          {Object.entries(selectedNode.styles.cssVariables).slice(0, 15).map(([key, value], i) => (
                            <div key={i} className="flex items-center gap-2 rounded bg-violet-50 px-2 py-0.5">
                              <span className="font-mono text-violet-700">{key}</span>
                              <span className="text-gray-400">:</span>
                              <span className="font-mono text-gray-600 truncate">{value}</span>
                            </div>
                          ))}
                          {Object.keys(selectedNode.styles.cssVariables).length > 15 && (
                            <div className="text-gray-400 px-2">+{Object.keys(selectedNode.styles.cssVariables).length - 15} more</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="rounded bg-gray-50 p-2">
                      <div className="text-gray-600">
                        <span className="font-medium">{selectedNode.styles.totalRules}</span> CSS rules •{" "}
                        <span className="font-medium">{selectedNode.styles.inlineStyles.length}</span> inline styles •{" "}
                        <span className="font-medium">{selectedNode.styles.externalStylesheets.length}</span> stylesheets
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
