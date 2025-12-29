"use client";

import { forwardRef } from "react";
import { CrawlForm, CrawlConfig } from "@/components/CrawlForm";
import { StatusPanel } from "@/components/StatusPanel";
import { CrawlProgress } from "@/components/CrawlProgress";
import { SourceAuditPanel } from "@/components/SourceAuditPanel";
import { AlertCircle } from "lucide-react";
import type { Node } from "@xyflow/react";
import type { CustomNodeData } from "@/types/flow";
import type { CrawlResult, CrawledPage } from "@/types/sitemap";

interface HomeSidebarProps {
  sidebarOpen: boolean;
  crawlStatus: string;
  crawlError: string | null;
  crawlResult: CrawlResult | null;
  selectedNode: Node<CustomNodeData> | undefined;
  selectedPageData: CrawledPage | undefined;
  onCrawl: (config: CrawlConfig) => void;
  onCancel: () => void;
  onSidebarClose: () => void;
}

export const HomeSidebar = forwardRef<HTMLElement, HomeSidebarProps>(
  (
    {
      sidebarOpen,
      crawlStatus,
      crawlError,
      crawlResult,
      selectedNode,
      selectedPageData,
      onCrawl,
      onCancel,
      onSidebarClose,
    },
    ref
  ) => {
    return (
      <>
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="bg-foreground/50 fixed inset-0 z-40 lg:hidden"
            onClick={onSidebarClose}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          ref={ref}
          id="sidebar"
          className={`bg-muted fixed inset-y-0 left-0 z-50 transform overflow-y-auto transition-all duration-300 ease-in-out lg:relative lg:z-auto ${
            sidebarOpen
              ? "border-border w-80 translate-x-0 border-r p-4 lg:w-96 lg:p-6"
              : "w-80 -translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden lg:border-0 lg:p-0"
          } `}
          aria-label="Sidebar"
          aria-hidden={!sidebarOpen}
        >
          <div
            className={`space-y-6 ${sidebarOpen ? "opacity-100" : "lg:opacity-0"} transition-opacity duration-200`}
          >
            <CrawlForm
              onSubmit={onCrawl}
              onCancel={onCancel}
              isLoading={crawlStatus === "crawling"}
            />

            {/* Progress bar - shown while crawling */}
            {crawlStatus === "crawling" && <CrawlProgress />}

            {crawlStatus === "error" && crawlError && (
              <div className="border-destructive bg-destructive/10 border p-4" role="alert">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-destructive font-mono font-semibold">Error</h3>
                    <p className="text-destructive/80 mt-1 font-mono text-sm">{crawlError}</p>
                  </div>
                </div>
              </div>
            )}

            {crawlResult && (
              <StatusPanel
                totalPages={crawlResult.totalPages}
                brokenLinks={crawlResult.brokenLinks}
                apiEndpoints={crawlResult.apiEndpoints}
                crawlTime={crawlResult.crawlTime}
                failedUrls={crawlResult.failedUrls}
                errorSummary={crawlResult.errorSummary}
                selectedNode={
                  selectedNode
                    ? {
                        title: selectedNode.data.title,
                        url: selectedNode.data.url,
                        statusCode: selectedNode.data.statusCode,
                        styles: selectedPageData?.styles,
                        meta: selectedPageData?.meta,
                        headings: selectedPageData?.headings,
                        images: selectedPageData?.images,
                        contentMetrics: selectedPageData?.contentMetrics,
                        isApiEndpoint: selectedNode.data.isApiEndpoint,
                        securityHeaders: selectedPageData?.securityHeaders,
                        keywordDensity: selectedPageData?.keywordDensity,
                        mobileResponsiveness: selectedPageData?.mobileResponsiveness,
                      }
                    : undefined
                }
              />
            )}

            {/* Source Code Audit - always available */}
            <SourceAuditPanel />
          </div>
        </aside>
      </>
    );
  }
);

HomeSidebar.displayName = "HomeSidebar";
