"use client";

import { Suspense, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CrawlForm, CrawlConfig } from "@/components/CrawlForm";
import { StatusPanel } from "@/components/StatusPanel";
import { CrawlProgress } from "@/components/CrawlProgress";
import { SourceAuditPanel } from "@/components/SourceAuditPanel";
import { SitemapFlow } from "@/components/flow/SitemapFlow";
import { ListView } from "@/components/views/ListView";
import { ViewSwitcher } from "@/components/views/ViewSwitcher";
import { AuditResultsView } from "@/components/views/AuditResultsView";
import { useAppStore, ViewMode } from "@/lib/store";
import { useCrawlProgress } from "@/hooks/useCrawlProgress";
import { AlertCircle, Loader2 } from "lucide-react";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const {
    crawlStatus,
    crawlError,
    crawlResult,
    flowNodes,
    flowEdges,
    selectedNodeId,
    viewMode,
    auditProgress,
    auditStatus,
    designSystemReport,
    setCrawlStatus,
    setCrawlError,
    setCrawlSessionId,
    setSelectedNode,
    setViewMode,
    cancelCrawl,
    reset,
  } = useAppStore();

  // Poll for progress updates while crawling
  useCrawlProgress();

  // Handle URL parameter for view mode on initial load
  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "list" || viewParam === "tree") {
      setViewMode(viewParam as ViewMode);
    }
  }, [searchParams, setViewMode]);

  // Handler for view mode changes that updates both store and URL
  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", mode);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [setViewMode, router, pathname, searchParams]
  );

  const handleCrawl = useCallback(
    async (config: CrawlConfig) => {
      // Clear all previous crawl state before starting new crawl
      reset();

      setCrawlStatus("crawling");
      setCrawlError(null);

      try {
        const response = await fetch("/api/crawl", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: config.url,
            maxDepth: config.maxDepth,
            maxPages: config.maxPages,
            interactiveMode: config.interactiveMode,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to crawl");
        }

        // API now returns 202 Accepted with sessionId
        const { sessionId } = await response.json();

        // Store session ID immediately for cancellation
        setCrawlSessionId(sessionId);

        // Progress hook will poll for updates and fetch results when complete
      } catch (error) {
        setCrawlStatus("error");
        setCrawlError(error instanceof Error ? error.message : "Unknown error");
      }
    },
    [setCrawlStatus, setCrawlError, setCrawlSessionId, reset]
  );

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNode(nodeId);
    },
    [setSelectedNode]
  );

  const selectedNode = selectedNodeId ? flowNodes.find((n) => n.id === selectedNodeId) : undefined;

  // Find the page data (with styles) for the selected node
  const selectedPageData = selectedNodeId && crawlResult
    ? crawlResult.pages.find((p) => p.url === selectedNodeId)
    : undefined;

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">creepr</h1>
            <p className="mt-1 text-sm text-gray-500">Crawl and visualize your app structure</p>
          </div>
          {/* View Switcher (only show when crawl completed) */}
          {crawlStatus === "completed" && flowNodes.length > 0 && (
            <ViewSwitcher currentView={viewMode} onViewChange={handleViewModeChange} />
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-96 overflow-y-auto border-r border-gray-200 bg-gray-50 p-6">
          <div className="space-y-6">
            <CrawlForm
              onSubmit={handleCrawl}
              onCancel={cancelCrawl}
              isLoading={crawlStatus === "crawling"}
            />

            {/* Progress bar - shown while crawling */}
            {crawlStatus === "crawling" && <CrawlProgress />}

            {crawlStatus === "error" && crawlError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-red-900">Error</h3>
                    <p className="mt-1 text-sm text-red-700">{crawlError}</p>
                  </div>
                </div>
              </div>
            )}

            {crawlResult && (
              <StatusPanel
                totalPages={crawlResult.totalPages}
                brokenLinks={crawlResult.brokenLinks}
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
                      }
                    : undefined
                }
              />
            )}

            {/* Source Code Audit - always available */}
            <SourceAuditPanel />
          </div>
        </aside>

        {/* Main visualization area */}
        <main className="relative flex-1">
          {crawlStatus === "idle" && !auditProgress && !designSystemReport && (
            <div className="flex h-full items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="mb-4 text-6xl">🗺️</div>
                <p className="text-lg font-medium">Ready to crawl</p>
                <p className="mt-2 text-sm">Enter a localhost URL to get started</p>
              </div>
            </div>
          )}

          {/* Audit Progress */}
          {auditProgress && (
            <div className="flex h-full items-center justify-center">
              <div className="w-full max-w-md space-y-4 px-8">
                <div className="text-center">
                  <div className="mb-4 text-6xl">🔍</div>
                  <p className="text-lg font-medium text-gray-700">Auditing Source Code</p>
                  <p className="mt-2 text-sm text-gray-500">{auditProgress.stage}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-mono text-gray-500">{auditProgress.percent}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                      style={{ width: `${auditProgress.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {crawlStatus === "crawling" && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
                <p className="text-lg font-medium text-gray-700">Crawling website...</p>
                <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
              </div>
            </div>
          )}

          {crawlStatus === "completed" && flowNodes.length > 0 && (
            <>
              {viewMode === "tree" ? (
                <SitemapFlow nodes={flowNodes} edges={flowEdges} onNodeClick={handleNodeClick} />
              ) : (
                <ListView nodes={flowNodes} onNodeClick={handleNodeClick} />
              )}
            </>
          )}

          {/* Audit Results - shown when we have a report and not showing crawl results */}
          {designSystemReport && crawlStatus !== "completed" && !auditProgress && (
            <AuditResultsView report={designSystemReport} />
          )}

          {crawlStatus === "error" && (
            <div className="flex h-full items-center justify-center text-gray-500">
              <div className="text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                <p className="text-lg font-medium">Crawl failed</p>
                <p className="mt-2 text-sm">Check the error details in the sidebar</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
