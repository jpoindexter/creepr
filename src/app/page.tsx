"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2, Menu, X, PanelLeftClose, PanelLeft, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
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

  // Toast notifications
  const { toast } = useToast();
  const prevCrawlStatusRef = useRef(crawlStatus);
  const sidebarRef = useRef<HTMLElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Show toast notifications for status changes
  useEffect(() => {
    const prevStatus = prevCrawlStatusRef.current;
    prevCrawlStatusRef.current = crawlStatus;

    // Don't show toast on initial load
    if (prevStatus === "idle" && crawlStatus === "idle") return;

    if (crawlStatus === "completed" && prevStatus === "crawling") {
      toast({
        title: "Crawl complete",
        description: crawlResult ? `Found ${crawlResult.totalPages} pages` : "Sitemap generated",
      });
    } else if (crawlStatus === "error" && prevStatus === "crawling") {
      toast({
        variant: "destructive",
        title: "Crawl failed",
        description: crawlError || "An error occurred while crawling",
      });
    } else if (crawlStatus === "cancelled" && prevStatus === "crawling") {
      toast({
        title: "Crawl cancelled",
        description: "The crawl was stopped",
      });
    }
  }, [crawlStatus, crawlResult, crawlError, toast]);

  // Poll for progress updates while crawling
  useCrawlProgress();

  // Mark as mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync view mode from URL param or localStorage on mount (after hydration)
  useEffect(() => {
    // URL param takes precedence
    const viewParam = searchParams.get("view");
    if (viewParam === "list" || viewParam === "tree") {
      setViewMode(viewParam as ViewMode);
      return;
    }
    // Otherwise check localStorage
    const stored = localStorage.getItem("creepr-view-mode");
    if (stored === "tree" || stored === "list") {
      if (stored !== viewMode) {
        setViewMode(stored);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Close sidebar on mobile when screen resizes to desktop
  // Debounced to prevent performance issues during rapid resizing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleResize = () => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Debounce resize handler (150ms)
      timeoutId = setTimeout(() => {
        // On desktop (>= 1024px), always keep sidebar open
        if (window.innerWidth >= 1024) {
          setSidebarOpen(true);
        }
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [setSidebarOpen]);

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [sidebarOpen, setSidebarOpen]);

  // Focus trap for mobile sidebar
  useEffect(() => {
    // Only apply focus trap on mobile (< 1024px)
    if (!sidebarOpen || typeof window === "undefined" || window.innerWidth >= 1024) {
      return;
    }

    // Store currently focused element to restore later
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    // Get all focusable elements within the sidebar
    const getFocusableElements = () => {
      const focusableSelectors =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      return Array.from(sidebar.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
      );
    };

    // Focus first element in sidebar
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => focusableElements[0]?.focus(), 50);
    }

    // Handle Tab key to trap focus
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);

    return () => {
      document.removeEventListener("keydown", handleTab);
      // Restore focus to previously focused element when sidebar closes
      if (
        previouslyFocusedElement.current &&
        typeof previouslyFocusedElement.current.focus === "function"
      ) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [sidebarOpen]);

  // Sync theme from localStorage/system preference on mount (after hydration)
  // This runs only once on mount to avoid hydration mismatches
  useEffect(() => {
    // Check localStorage first
    const stored = localStorage.getItem("creepr-theme");
    if (stored === "light" || stored === "dark") {
      if (stored !== themeMode) {
        setThemeMode(stored);
      }
    } else {
      // No stored preference, check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark && themeMode !== "dark") {
        setThemeMode("dark");
      }
    }

    // Listen for system preference changes (only if no stored preference)
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("creepr-theme")) {
        setThemeMode(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode === "dark" ? "bw-dark" : "bw");
  }, [themeMode]);

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
  const selectedPageData =
    selectedNodeId && crawlResult
      ? crawlResult.pages.find((p) => p.url === selectedNodeId)
      : undefined;

  return (
    <div className="bg-background text-foreground flex h-screen flex-col">
      {/* Header */}
      <header className="border-border bg-card border-b px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="min-w-touch min-h-touch lg:hidden"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={sidebarOpen}
              aria-controls="sidebar"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
            <div>
              <h1 className="font-mono text-xl font-bold lg:text-2xl">creepr</h1>
              <p className="text-muted-foreground mt-1 hidden font-mono text-xs sm:block lg:text-sm">
                Crawl and visualize your app structure
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="hidden items-center gap-2 lg:flex"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={sidebarOpen}
              aria-controls="sidebar"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              ) : (
                <PanelLeft className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only lg:not-sr-only">{sidebarOpen ? "Collapse" : "Expand"}</span>
            </Button>
            {/* Theme toggle - only render icon after mount to prevent hydration mismatch */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="min-w-touch min-h-touch lg:min-h-0 lg:min-w-0"
              aria-label={
                mounted
                  ? themeMode === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
                  : "Toggle theme"
              }
            >
              {!mounted ? (
                // Show consistent placeholder during SSR/hydration
                <Moon className="h-4 w-4" aria-hidden="true" />
              ) : themeMode === "light" ? (
                <Moon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Sun className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
            {/* View Switcher (only show when crawl completed) */}
            {crawlStatus === "completed" && flowNodes.length > 0 && (
              <ViewSwitcher currentView={viewMode} onViewChange={handleViewModeChange} />
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          ref={sidebarRef}
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
              onSubmit={handleCrawl}
              onCancel={cancelCrawl}
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

        {/* Main visualization area */}
        <main id="main-content" className="bg-background relative flex-1" tabIndex={-1}>
          {crawlStatus === "idle" && !auditProgress && !designSystemReport && (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <div className="max-w-lg px-4 text-center font-mono">
                <div className="mb-6 text-6xl">&#62;_</div>
                <h2 className="text-foreground mb-2 text-xl font-bold">Ready to crawl</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                  Visualize your local development app structure
                </p>

                {/* Example URLs */}
                <div className="bg-card border-border mb-6 border p-4 text-left">
                  <p className="text-muted-foreground mb-3 text-xs tracking-wide uppercase">
                    Example URLs to try:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">$</span>
                      <code className="text-foreground">http://localhost:3000</code>
                      <span className="text-muted-foreground text-xs">- Next.js default</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">$</span>
                      <code className="text-foreground">http://localhost:5173</code>
                      <span className="text-muted-foreground text-xs">- Vite default</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">$</span>
                      <code className="text-foreground">http://localhost:4200</code>
                      <span className="text-muted-foreground text-xs">- Angular default</span>
                    </li>
                  </ul>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-card border-border border p-3">
                    <span className="text-foreground mb-1 block font-medium">Tree View</span>
                    <span className="text-muted-foreground">Interactive sitemap visualization</span>
                  </div>
                  <div className="bg-card border-border border p-3">
                    <span className="text-foreground mb-1 block font-medium">Link Status</span>
                    <span className="text-muted-foreground">
                      Detect broken and redirected links
                    </span>
                  </div>
                  <div className="bg-card border-border border p-3">
                    <span className="text-foreground mb-1 block font-medium">SEO Analysis</span>
                    <span className="text-muted-foreground">Meta tags, headings, images</span>
                  </div>
                  <div className="bg-card border-border border p-3">
                    <span className="text-foreground mb-1 block font-medium">Export</span>
                    <span className="text-muted-foreground">JSON, PNG, SVG, sitemap.xml</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Progress */}
          {auditProgress && (
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
          )}

          {crawlStatus === "crawling" && (
            <div
              className="flex h-full items-center justify-center"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="text-center font-mono">
                <Loader2
                  className="text-primary mx-auto mb-4 h-12 w-12 animate-spin"
                  aria-hidden="true"
                />
                <p className="text-lg font-medium">Crawling website...</p>
                <p className="text-muted-foreground mt-2 text-sm">This may take a few moments</p>
              </div>
            </div>
          )}

          {crawlStatus === "completed" && layoutStatus === "calculating" && (
            <div
              className="flex h-full items-center justify-center"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="text-center font-mono">
                <Loader2
                  className="text-primary mx-auto mb-4 h-12 w-12 animate-spin"
                  aria-hidden="true"
                />
                <p className="text-lg font-medium">Calculating layout...</p>
                <p className="text-muted-foreground mt-2 text-sm">Building sitemap visualization</p>
              </div>
            </div>
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

          {/* Empty state - when crawl completes but finds no pages */}
          {crawlStatus === "completed" && layoutStatus === "done" && flowNodes.length === 0 && (
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
          )}

          {/* Audit Results - shown when we have a report and not showing crawl results */}
          {designSystemReport && crawlStatus !== "completed" && !auditProgress && (
            <AuditResultsView report={designSystemReport} />
          )}

          {crawlStatus === "error" && (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <div className="text-center font-mono">
                <AlertCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
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
