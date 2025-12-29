"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

import { SitemapFlow } from "@/components/flow/SitemapFlow";
import { ListView } from "@/components/views/ListView";
import { AuditResultsView } from "@/components/views/AuditResultsView";
import {
  HomeHeader,
  HomeSidebar,
  IdleState,
  CrawlingState,
  LayoutCalculatingState,
  AuditProgressState,
  ErrorState,
  EmptyResultState,
} from "@/components/home";
import { CrawlConfig } from "@/components/CrawlForm";
import { useAppStore, ViewMode } from "@/lib/store";
import { useCrawlProgress } from "@/hooks/useCrawlProgress";
import { useToast } from "@/hooks/use-toast";
import {
  useToastNotifications,
  useViewModeSync,
  useResizeHandler,
  useEscapeHandler,
  useFocusTrap,
  useThemeSync,
  useThemeApply,
} from "@/hooks/usePageEffects";

function HomeContent() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const {
    crawlStatus,
    crawlError,
    crawlResult,
    flowNodes,
    flowEdges,
    selectedNodeId,
    viewMode,
    auditProgress,
    designSystemReport,
    sidebarOpen,
    themeMode,
    layoutStatus,
    setCrawlStatus,
    setCrawlError,
    setCrawlSessionId,
    setSelectedNode,
    setViewMode,
    toggleSidebar,
    setSidebarOpen,
    toggleTheme,
    setThemeMode,
    cancelCrawl,
    reset,
  } = useAppStore();

  const { toast } = useToast();

  // Custom hooks for page effects
  useToastNotifications({ crawlStatus, crawlResult, crawlError, toast });
  useCrawlProgress();
  useViewModeSync({ viewMode, setViewMode });
  useResizeHandler(setSidebarOpen);
  useEscapeHandler(sidebarOpen, setSidebarOpen);
  useFocusTrap(sidebarOpen, sidebarRef);
  useThemeSync({ themeMode, setThemeMode });
  useThemeApply(themeMode);

  // Mark as mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handler for view mode changes that updates both store and URL
  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      const params = new URLSearchParams(window.location.search);
      params.set("view", mode);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [setViewMode, router, pathname]
  );

  const handleCrawl = useCallback(
    async (config: CrawlConfig) => {
      reset();
      setCrawlStatus("crawling");
      setCrawlError(null);

      try {
        const response = await fetch("/api/crawl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

        const { sessionId } = await response.json();
        setCrawlSessionId(sessionId);
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
  const selectedPageData =
    selectedNodeId && crawlResult
      ? crawlResult.pages.find((p) => p.url === selectedNodeId)
      : undefined;

  return (
    <div className="bg-background text-foreground flex h-screen flex-col">
      <HomeHeader
        mounted={mounted}
        themeMode={themeMode}
        sidebarOpen={sidebarOpen}
        crawlStatus={crawlStatus}
        viewMode={viewMode}
        flowNodesLength={flowNodes.length}
        toggleSidebar={toggleSidebar}
        toggleTheme={toggleTheme}
        onViewModeChange={handleViewModeChange}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <HomeSidebar
          ref={sidebarRef}
          sidebarOpen={sidebarOpen}
          crawlStatus={crawlStatus}
          crawlError={crawlError}
          crawlResult={crawlResult}
          selectedNode={selectedNode}
          selectedPageData={selectedPageData}
          onCrawl={handleCrawl}
          onCancel={cancelCrawl}
          onSidebarClose={() => setSidebarOpen(false)}
        />

        <main id="main-content" className="bg-background relative flex-1" tabIndex={-1}>
          {crawlStatus === "idle" && !auditProgress && !designSystemReport && <IdleState />}

          {auditProgress && <AuditProgressState auditProgress={auditProgress} />}

          {crawlStatus === "crawling" && <CrawlingState />}

          {crawlStatus === "completed" && layoutStatus === "calculating" && (
            <LayoutCalculatingState />
          )}

          {crawlStatus === "completed" && layoutStatus === "done" && flowNodes.length > 0 && (
            <>
              {viewMode === "tree" ? (
                <SitemapFlow nodes={flowNodes} edges={flowEdges} onNodeClick={handleNodeClick} />
              ) : (
                <ListView nodes={flowNodes} onNodeClick={handleNodeClick} />
              )}
            </>
          )}

          {crawlStatus === "completed" && layoutStatus === "done" && flowNodes.length === 0 && (
            <EmptyResultState />
          )}

          {designSystemReport && crawlStatus !== "completed" && !auditProgress && (
            <AuditResultsView report={designSystemReport} />
          )}

          {crawlStatus === "error" && <ErrorState />}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex h-screen items-center justify-center">
          <Loader2 className="text-primary h-12 w-12 animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
