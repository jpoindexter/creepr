"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Palette,
  BarChart3,
  MousePointer,
  Search,
  ChevronRight,
  Home,
  Plug,
  Shield,
  Tags,
  Smartphone,
} from "lucide-react";
import { formatDuration, calculateSEOScore, SEOScoreResult } from "@/lib/utils";
import {
  FailedUrl,
  ErrorSummary,
  MetaInfo,
  HeadingInfo,
  ImageInfo,
  ContentMetrics,
} from "@/types/sitemap";
import {
  PageStyles,
  SecurityHeaders,
  KeywordDensity,
  MobileResponsiveness,
} from "@/lib/crawler/types";
import { useAppStore } from "@/lib/store";

interface StatusPanelProps {
  totalPages: number;
  brokenLinks: number;
  apiEndpoints?: number;
  crawlTime?: number;
  failedUrls?: FailedUrl[];
  errorSummary?: ErrorSummary;
  selectedNode?: {
    title: string;
    url: string;
    statusCode: number;
    styles?: PageStyles;
    meta?: MetaInfo;
    headings?: HeadingInfo[];
    images?: ImageInfo[];
    contentMetrics?: ContentMetrics;
    isApiEndpoint?: boolean;
    securityHeaders?: SecurityHeaders;
    keywordDensity?: KeywordDensity;
    mobileResponsiveness?: MobileResponsiveness;
  };
}

export function StatusPanel({
  totalPages,
  brokenLinks,
  apiEndpoints = 0,
  crawlTime,
  failedUrls = [],
  errorSummary,
  selectedNode,
}: StatusPanelProps) {
  const [showErrors, setShowErrors] = useState(false);
  const [showStyles, setShowStyles] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const successPages = totalPages - brokenLinks;
  const hasErrors = failedUrls.length > 0;

  // Get flow data for breadcrumb navigation
  const { flowNodes, flowEdges, setSelectedNode, selectedNodeId } = useAppStore();

  // Build breadcrumb path from root to selected node
  const breadcrumbPath = useMemo(() => {
    if (!selectedNodeId || flowNodes.length === 0) return [];

    const path: { id: string; title: string; url: string }[] = [];
    let currentId: string | undefined = selectedNodeId;

    // Build path from selected node back to root
    while (currentId) {
      const node = flowNodes.find((n) => n.id === currentId);
      if (!node) break;

      path.unshift({
        id: node.id,
        title: node.data.title || new URL(node.data.url).pathname || "/",
        url: node.data.url,
      });

      // Find parent by looking at edges
      const parentEdge = flowEdges.find((e) => e.target === currentId);
      currentId = parentEdge?.source;
    }

    return path;
  }, [selectedNodeId, flowNodes, flowEdges]);

  // Calculate SEO score for selected node
  const seoScore = useMemo<SEOScoreResult | null>(() => {
    if (!selectedNode) return null;
    return calculateSEOScore({
      title: selectedNode.title,
      meta: selectedNode.meta,
      headings: selectedNode.headings,
      images: selectedNode.images,
      contentMetrics: selectedNode.contentMetrics,
    });
  }, [selectedNode]);

  return (
    <div className="space-y-4">
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
                        <span className="text-destructive font-semibold">
                          {errorSummary.timeout}
                        </span>
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
                      <div
                        key={index}
                        className="border-destructive/30 bg-destructive/5 border p-2"
                      >
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

      {selectedNode && (
        <Card>
          <CardHeader title="SELECTED_NODE" icon={<MousePointer className="h-4 w-4" />} />
          <CardContent className="space-y-2">
            {/* Breadcrumb Navigation */}
            {breadcrumbPath.length > 1 && (
              <nav aria-label="Breadcrumb navigation" className="border-border border-b pb-2">
                <ol className="flex flex-wrap items-center gap-1 text-xs">
                  {breadcrumbPath.map((crumb, index) => {
                    const isLast = index === breadcrumbPath.length - 1;
                    const isFirst = index === 0;

                    return (
                      <li key={crumb.id} className="flex items-center gap-1">
                        {index > 0 && (
                          <ChevronRight
                            className="text-muted-foreground h-3 w-3 flex-shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        {isLast ? (
                          <span
                            className="text-foreground max-w-[120px] truncate font-medium"
                            title={crumb.title}
                            aria-current="page"
                          >
                            {isFirst ? (
                              <Home className="mr-1 inline h-3 w-3" aria-hidden="true" />
                            ) : null}
                            {crumb.title.length > 20
                              ? crumb.title.slice(0, 20) + "..."
                              : crumb.title}
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedNode(crumb.id)}
                            className="text-muted-foreground hover:text-foreground focus:ring-ring max-w-[100px] truncate hover:underline focus:ring-1 focus:outline-none"
                            title={`Go to ${crumb.title}`}
                          >
                            {isFirst ? (
                              <Home className="mr-1 inline h-3 w-3" aria-hidden="true" />
                            ) : null}
                            {crumb.title.length > 15
                              ? crumb.title.slice(0, 15) + "..."
                              : crumb.title}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </nav>
            )}

            <div>
              <div className="text-muted-foreground mb-1 text-xs">Title</div>
              <div className="text-sm font-medium">{selectedNode.title}</div>
            </div>

            <div>
              <div className="text-muted-foreground mb-1 text-xs">URL</div>
              <div className="font-mono text-sm break-all">{selectedNode.url}</div>
            </div>

            <div>
              <div className="text-muted-foreground mb-1 text-xs">Status Code</div>
              <span
                className={`inline-block px-2 py-1 text-sm font-semibold ${
                  selectedNode.statusCode >= 400
                    ? "bg-destructive/10 text-destructive border-destructive/30 border"
                    : selectedNode.statusCode >= 300
                      ? "bg-muted text-muted-foreground border-border border"
                      : "bg-muted text-foreground border-border border"
                } `}
              >
                {selectedNode.statusCode}
              </span>
            </div>

            {/* SEO Score Section */}
            {seoScore && (
              <div className="border-border border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSEO(!showSEO)}
                  className="hover:bg-muted flex w-full items-center justify-between p-2"
                  aria-expanded={showSEO}
                  aria-controls="seo-details"
                  aria-label={`${showSEO ? "Hide" : "Show"} SEO analysis: grade ${seoScore.grade}, score ${seoScore.score}/100`}
                >
                  <div className="flex items-center gap-2">
                    <Search className="text-foreground h-4 w-4" aria-hidden="true" />
                    <span className="text-sm font-medium">SEO Score: {seoScore.score}/100</span>
                    <span
                      className={`px-1.5 py-0.5 text-xs font-bold ${
                        seoScore.grade === "A"
                          ? "bg-foreground text-background"
                          : seoScore.grade === "B"
                            ? "bg-muted-foreground text-background"
                            : seoScore.grade === "C"
                              ? "bg-muted text-foreground border-border border"
                              : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {seoScore.grade}
                    </span>
                  </div>
                  {showSEO ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>

                {showSEO && (
                  <div id="seo-details" className="mt-2 space-y-3 text-xs">
                    {/* Issues */}
                    {seoScore.issues.length > 0 && (
                      <div>
                        <div className="text-destructive mb-1 flex items-center gap-1 font-medium">
                          <XCircle className="h-3 w-3" aria-hidden="true" />
                          Issues ({seoScore.issues.length})
                        </div>
                        <ul className="text-muted-foreground list-inside list-disc space-y-1">
                          {seoScore.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Passed */}
                    {seoScore.passed.length > 0 && (
                      <div>
                        <div className="text-foreground mb-1 flex items-center gap-1 font-medium">
                          <CheckCircle className="h-3 w-3" aria-hidden="true" />
                          Passed ({seoScore.passed.length})
                        </div>
                        <ul className="text-muted-foreground list-inside list-disc space-y-1">
                          {seoScore.passed.map((pass, i) => (
                            <li key={i}>{pass}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Security Headers Section */}
            {selectedNode.securityHeaders && (
              <div className="border-border border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecurity(!showSecurity)}
                  className="hover:bg-muted flex w-full items-center justify-between p-2"
                  aria-expanded={showSecurity}
                  aria-controls="security-details"
                  aria-label={`${showSecurity ? "Hide" : "Show"} security headers: score ${selectedNode.securityHeaders.score}/100`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="text-foreground h-4 w-4" aria-hidden="true" />
                    <span className="text-sm font-medium">
                      Security: {selectedNode.securityHeaders.score}/100
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-xs font-bold ${
                        selectedNode.securityHeaders.score >= 90
                          ? "bg-foreground text-background"
                          : selectedNode.securityHeaders.score >= 70
                            ? "bg-muted-foreground text-background"
                            : selectedNode.securityHeaders.score >= 50
                              ? "bg-muted text-foreground border-border border"
                              : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {selectedNode.securityHeaders.score >= 90
                        ? "A"
                        : selectedNode.securityHeaders.score >= 70
                          ? "B"
                          : selectedNode.securityHeaders.score >= 50
                            ? "C"
                            : selectedNode.securityHeaders.score >= 30
                              ? "D"
                              : "F"}
                    </span>
                  </div>
                  {showSecurity ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>

                {showSecurity && (
                  <div id="security-details" className="mt-2 space-y-3 text-xs">
                    {/* Missing Headers */}
                    {selectedNode.securityHeaders.missingHeaders.length > 0 && (
                      <div>
                        <div className="text-destructive mb-1 flex items-center gap-1 font-medium">
                          <XCircle className="h-3 w-3" aria-hidden="true" />
                          Missing ({selectedNode.securityHeaders.missingHeaders.length})
                        </div>
                        <ul className="text-muted-foreground list-inside list-disc space-y-1">
                          {selectedNode.securityHeaders.missingHeaders.map((header, i) => (
                            <li key={i}>{header}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Present Headers */}
                    {selectedNode.securityHeaders.presentHeaders.length > 0 && (
                      <div>
                        <div className="text-foreground mb-1 flex items-center gap-1 font-medium">
                          <CheckCircle className="h-3 w-3" aria-hidden="true" />
                          Present ({selectedNode.securityHeaders.presentHeaders.length})
                        </div>
                        <ul className="text-muted-foreground list-inside list-disc space-y-1">
                          {selectedNode.securityHeaders.presentHeaders.map((header, i) => (
                            <li key={i}>{header}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Header Values */}
                    {(selectedNode.securityHeaders.contentSecurityPolicy ||
                      selectedNode.securityHeaders.strictTransportSecurity) && (
                      <div className="bg-muted max-h-32 space-y-1 overflow-y-auto p-2">
                        {selectedNode.securityHeaders.contentSecurityPolicy && (
                          <div>
                            <span className="text-foreground font-medium">CSP: </span>
                            <span className="text-muted-foreground text-[10px] break-all">
                              {selectedNode.securityHeaders.contentSecurityPolicy.slice(0, 100)}
                              {selectedNode.securityHeaders.contentSecurityPolicy.length > 100 &&
                                "..."}
                            </span>
                          </div>
                        )}
                        {selectedNode.securityHeaders.strictTransportSecurity && (
                          <div>
                            <span className="text-foreground font-medium">HSTS: </span>
                            <span className="text-muted-foreground text-[10px]">
                              {selectedNode.securityHeaders.strictTransportSecurity}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Keyword Density Section */}
            {selectedNode.keywordDensity && selectedNode.keywordDensity.totalWords > 0 && (
              <div className="border-border border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeywords(!showKeywords)}
                  className="hover:bg-muted flex w-full items-center justify-between p-2"
                  aria-expanded={showKeywords}
                  aria-controls="keywords-details"
                  aria-label={`${showKeywords ? "Hide" : "Show"} keyword analysis: ${selectedNode.keywordDensity.totalWords} words`}
                >
                  <div className="flex items-center gap-2">
                    <Tags className="text-foreground h-4 w-4" aria-hidden="true" />
                    <span className="text-sm font-medium">
                      Keywords ({selectedNode.keywordDensity.uniqueWords} unique)
                    </span>
                  </div>
                  {showKeywords ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>

                {showKeywords && (
                  <div id="keywords-details" className="mt-2 space-y-3 text-xs">
                    {/* Stats */}
                    <div className="bg-muted text-muted-foreground flex gap-4 p-2">
                      <div>
                        <span className="text-foreground font-medium">
                          {selectedNode.keywordDensity.totalWords}
                        </span>{" "}
                        words
                      </div>
                      <div>
                        <span className="text-foreground font-medium">
                          {selectedNode.keywordDensity.uniqueWords}
                        </span>{" "}
                        unique
                      </div>
                      <div>
                        avg{" "}
                        <span className="text-foreground font-medium">
                          {selectedNode.keywordDensity.averageWordLength}
                        </span>{" "}
                        chars
                      </div>
                    </div>

                    {/* Top Keywords */}
                    {selectedNode.keywordDensity.topKeywords.length > 0 && (
                      <div>
                        <div className="text-foreground mb-2 font-medium">Top Keywords</div>
                        <div className="max-h-40 space-y-1.5 overflow-y-auto">
                          {selectedNode.keywordDensity.topKeywords.slice(0, 10).map((kw, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-foreground font-mono">{kw.word}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{kw.count}x</span>
                                <span className="bg-muted text-muted-foreground px-1.5 py-0.5 text-[10px]">
                                  {kw.density}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Responsiveness Section */}
            {selectedNode.mobileResponsiveness && (
              <div className="border-border border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobile(!showMobile)}
                  className="hover:bg-muted flex w-full items-center justify-between p-2"
                  aria-expanded={showMobile}
                  aria-controls="mobile-details"
                  aria-label={`${showMobile ? "Hide" : "Show"} mobile responsiveness: score ${selectedNode.mobileResponsiveness.score}/100`}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="text-foreground h-4 w-4" aria-hidden="true" />
                    <span className="text-sm font-medium">
                      Mobile: {selectedNode.mobileResponsiveness.score}/100
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-xs font-bold ${
                        selectedNode.mobileResponsiveness.score >= 90
                          ? "bg-foreground text-background"
                          : selectedNode.mobileResponsiveness.score >= 70
                            ? "bg-muted-foreground text-background"
                            : selectedNode.mobileResponsiveness.score >= 50
                              ? "bg-muted text-foreground border-border border"
                              : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {selectedNode.mobileResponsiveness.score >= 90
                        ? "A"
                        : selectedNode.mobileResponsiveness.score >= 70
                          ? "B"
                          : selectedNode.mobileResponsiveness.score >= 50
                            ? "C"
                            : selectedNode.mobileResponsiveness.score >= 30
                              ? "D"
                              : "F"}
                    </span>
                  </div>
                  {showMobile ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>

                {showMobile && (
                  <div id="mobile-details" className="mt-2 space-y-3 text-xs">
                    {/* Quick Stats */}
                    <div className="bg-muted space-y-1.5 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Viewport Meta</span>
                        <span
                          className={
                            selectedNode.mobileResponsiveness.hasViewportMeta
                              ? "text-foreground"
                              : "text-destructive"
                          }
                        >
                          {selectedNode.mobileResponsiveness.hasViewportMeta
                            ? "✓ Present"
                            : "✗ Missing"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Media Queries</span>
                        <span
                          className={
                            selectedNode.mobileResponsiveness.hasMobileMediaQueries
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {selectedNode.mobileResponsiveness.hasMobileMediaQueries
                            ? "✓ Found"
                            : "— None"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Flexbox/Grid</span>
                        <span
                          className={
                            selectedNode.mobileResponsiveness.hasFlexboxOrGrid
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {selectedNode.mobileResponsiveness.hasFlexboxOrGrid ? "✓ Used" : "— No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Responsive Images</span>
                        <span
                          className={
                            selectedNode.mobileResponsiveness.hasResponsiveImages
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {selectedNode.mobileResponsiveness.hasResponsiveImages ? "✓ Yes" : "— No"}
                        </span>
                      </div>
                      {selectedNode.mobileResponsiveness.smallTouchTargets > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Small Touch Targets</span>
                          <span className="text-destructive">
                            {selectedNode.mobileResponsiveness.smallTouchTargets} elements &lt;44px
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Issues */}
                    {selectedNode.mobileResponsiveness.issues.length > 0 && (
                      <div>
                        <div className="text-destructive mb-1 flex items-center gap-1 font-medium">
                          <XCircle className="h-3 w-3" aria-hidden="true" />
                          Issues ({selectedNode.mobileResponsiveness.issues.length})
                        </div>
                        <ul className="text-muted-foreground list-inside list-disc space-y-1">
                          {selectedNode.mobileResponsiveness.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Passed */}
                    {selectedNode.mobileResponsiveness.passed.length > 0 && (
                      <div>
                        <div className="text-foreground mb-1 flex items-center gap-1 font-medium">
                          <CheckCircle className="h-3 w-3" aria-hidden="true" />
                          Passed ({selectedNode.mobileResponsiveness.passed.length})
                        </div>
                        <ul className="text-muted-foreground list-inside list-disc space-y-1">
                          {selectedNode.mobileResponsiveness.passed.map((pass, i) => (
                            <li key={i}>{pass}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Page Styles Section */}
            {selectedNode.styles && (
              <div className="border-border border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStyles(!showStyles)}
                  className="hover:bg-muted flex w-full items-center justify-between p-2"
                  aria-expanded={showStyles}
                  aria-controls="styles-details"
                  aria-label={`${showStyles ? "Hide" : "Show"} page styles: ${selectedNode.styles.uniqueColors.length} colors, ${selectedNode.styles.uniqueFonts.length} fonts`}
                >
                  <div className="flex items-center gap-2">
                    <Palette className="text-foreground h-4 w-4" />
                    <span className="text-sm font-medium">
                      Page Styles ({selectedNode.styles.uniqueColors.length} colors,{" "}
                      {selectedNode.styles.uniqueFonts.length} fonts)
                    </span>
                  </div>
                  {showStyles ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>

                {showStyles && (
                  <div id="styles-details" className="mt-2 space-y-3 text-xs">
                    {/* Colors */}
                    {selectedNode.styles.uniqueColors.length > 0 && (
                      <div>
                        <div className="text-foreground mb-1 font-medium">
                          Colors ({selectedNode.styles.uniqueColors.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.styles.uniqueColors.slice(0, 20).map((color, i) => (
                            <span
                              key={i}
                              className="bg-muted inline-flex items-center gap-1 px-1.5 py-0.5"
                              title={color}
                            >
                              <span
                                className="border-border h-3 w-3 border"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-mono text-xs">
                                {color.length > 20 ? color.slice(0, 20) + "..." : color}
                              </span>
                            </span>
                          ))}
                          {selectedNode.styles.uniqueColors.length > 20 && (
                            <span className="text-muted-foreground">
                              +{selectedNode.styles.uniqueColors.length - 20} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Fonts */}
                    {selectedNode.styles.uniqueFonts.length > 0 && (
                      <div>
                        <div className="text-foreground mb-1 font-medium">
                          Fonts ({selectedNode.styles.uniqueFonts.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.styles.uniqueFonts.slice(0, 10).map((font, i) => (
                            <span key={i} className="bg-secondary px-2 py-0.5 font-mono">
                              {font.length > 30 ? font.slice(0, 30) + "..." : font}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Border Radii */}
                    {selectedNode.styles.uniqueBorderRadii.length > 0 && (
                      <div>
                        <div className="text-foreground mb-1 font-medium">
                          Border Radii ({selectedNode.styles.uniqueBorderRadii.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.styles.uniqueBorderRadii.slice(0, 10).map((r, i) => (
                            <span key={i} className="bg-accent px-2 py-0.5 font-mono">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Spacings */}
                    {selectedNode.styles.uniqueSpacings.length > 0 && (
                      <div>
                        <div className="text-foreground mb-1 font-medium">
                          Spacings ({selectedNode.styles.uniqueSpacings.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.styles.uniqueSpacings.slice(0, 10).map((s, i) => (
                            <span key={i} className="bg-muted px-2 py-0.5 font-mono">
                              {s}
                            </span>
                          ))}
                          {selectedNode.styles.uniqueSpacings.length > 10 && (
                            <span className="text-muted-foreground">
                              +{selectedNode.styles.uniqueSpacings.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CSS Variables */}
                    {Object.keys(selectedNode.styles.cssVariables).length > 0 && (
                      <div>
                        <div className="text-foreground mb-1 font-medium">
                          CSS Variables ({Object.keys(selectedNode.styles.cssVariables).length})
                        </div>
                        <div className="max-h-32 space-y-0.5 overflow-y-auto">
                          {Object.entries(selectedNode.styles.cssVariables)
                            .slice(0, 15)
                            .map(([key, value], i) => (
                              <div
                                key={i}
                                className="bg-secondary flex items-center gap-2 px-2 py-0.5"
                              >
                                <span className="text-foreground font-mono">{key}</span>
                                <span className="text-muted-foreground">:</span>
                                <span className="text-muted-foreground truncate font-mono">
                                  {value}
                                </span>
                              </div>
                            ))}
                          {Object.keys(selectedNode.styles.cssVariables).length > 15 && (
                            <div className="text-muted-foreground px-2">
                              +{Object.keys(selectedNode.styles.cssVariables).length - 15} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="bg-muted p-2">
                      <div className="text-muted-foreground">
                        <span className="text-foreground font-medium">
                          {selectedNode.styles.totalRules}
                        </span>{" "}
                        CSS rules •{" "}
                        <span className="text-foreground font-medium">
                          {selectedNode.styles.inlineStyles.length}
                        </span>{" "}
                        inline styles •{" "}
                        <span className="text-foreground font-medium">
                          {selectedNode.styles.externalStylesheets.length}
                        </span>{" "}
                        stylesheets
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
