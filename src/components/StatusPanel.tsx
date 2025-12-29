"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { MousePointer } from "lucide-react";
import { calculateSEOScore, SEOScoreResult } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import {
  CrawlStatisticsCard,
  BreadcrumbNav,
  SEOScoreSection,
  SecuritySection,
  KeywordsSection,
  MobileSection,
  StylesSection,
  type StatusPanelProps,
  type BreadcrumbItem,
} from "./status-panel";

export function StatusPanel({
  totalPages,
  brokenLinks,
  apiEndpoints = 0,
  crawlTime,
  failedUrls = [],
  errorSummary,
  selectedNode,
}: StatusPanelProps) {
  const [showStyles, setShowStyles] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  // Get flow data for breadcrumb navigation
  const { flowNodes, flowEdges, setSelectedNode } = useAppStore();

  // Build breadcrumb path from root to selected node
  const breadcrumbPath = useMemo<BreadcrumbItem[]>(() => {
    const selectedNodeId = flowNodes.find((n) => n.data.url === selectedNode?.url)?.id;
    if (!selectedNodeId || flowNodes.length === 0) return [];

    const path: BreadcrumbItem[] = [];
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
  }, [selectedNode?.url, flowNodes, flowEdges]);

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
      <CrawlStatisticsCard
        totalPages={totalPages}
        brokenLinks={brokenLinks}
        apiEndpoints={apiEndpoints}
        crawlTime={crawlTime}
        failedUrls={failedUrls}
        errorSummary={errorSummary}
      />

      {selectedNode && (
        <Card>
          <CardHeader title="SELECTED_NODE" icon={<MousePointer className="h-4 w-4" />} />
          <CardContent className="space-y-2">
            {/* Breadcrumb Navigation */}
            <BreadcrumbNav path={breadcrumbPath} onNavigate={setSelectedNode} />

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
              <SEOScoreSection
                seoScore={seoScore}
                isExpanded={showSEO}
                onToggle={() => setShowSEO(!showSEO)}
              />
            )}

            {/* Security Headers Section */}
            {selectedNode.securityHeaders && (
              <SecuritySection
                securityHeaders={selectedNode.securityHeaders}
                isExpanded={showSecurity}
                onToggle={() => setShowSecurity(!showSecurity)}
              />
            )}

            {/* Keyword Density Section */}
            {selectedNode.keywordDensity && (
              <KeywordsSection
                keywordDensity={selectedNode.keywordDensity}
                isExpanded={showKeywords}
                onToggle={() => setShowKeywords(!showKeywords)}
              />
            )}

            {/* Mobile Responsiveness Section */}
            {selectedNode.mobileResponsiveness && (
              <MobileSection
                mobileResponsiveness={selectedNode.mobileResponsiveness}
                isExpanded={showMobile}
                onToggle={() => setShowMobile(!showMobile)}
              />
            )}

            {/* Page Styles Section */}
            {selectedNode.styles && (
              <StylesSection
                styles={selectedNode.styles}
                isExpanded={showStyles}
                onToggle={() => setShowStyles(!showStyles)}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Re-export types for backward compatibility
export type { StatusPanelProps } from "./status-panel";
