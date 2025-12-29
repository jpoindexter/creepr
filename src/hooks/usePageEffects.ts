"use client";

import { useEffect, useRef, RefObject } from "react";
import { useSearchParams } from "next/navigation";
import type { ViewMode } from "@/lib/store";

interface UseToastNotificationsParams {
  crawlStatus: string;
  crawlResult: { totalPages: number } | null;
  crawlError: string | null;
  toast: (options: { title: string; description?: string; variant?: "destructive" }) => void;
}

export function useToastNotifications({
  crawlStatus,
  crawlResult,
  crawlError,
  toast,
}: UseToastNotificationsParams) {
  const prevCrawlStatusRef = useRef(crawlStatus);

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
}

interface UseViewModeSyncParams {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function useViewModeSync({ viewMode, setViewMode }: UseViewModeSyncParams) {
  const searchParams = useSearchParams();

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
}

export function useResizeHandler(setSidebarOpen: (open: boolean) => void) {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
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
}

export function useEscapeHandler(sidebarOpen: boolean, setSidebarOpen: (open: boolean) => void) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [sidebarOpen, setSidebarOpen]);
}

export function useFocusTrap(sidebarOpen: boolean, sidebarRef: RefObject<HTMLElement | null>) {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sidebarOpen || typeof window === "undefined" || window.innerWidth >= 1024) {
      return;
    }

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const getFocusableElements = () => {
      const focusableSelectors =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      return Array.from(sidebar.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
      );
    };

    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      setTimeout(() => focusableElements[0]?.focus(), 50);
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);

    return () => {
      document.removeEventListener("keydown", handleTab);
      if (
        previouslyFocusedElement.current &&
        typeof previouslyFocusedElement.current.focus === "function"
      ) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [sidebarOpen, sidebarRef]);
}

interface UseThemeSyncParams {
  themeMode: "light" | "dark";
  setThemeMode: (mode: "light" | "dark") => void;
}

export function useThemeSync({ themeMode, setThemeMode }: UseThemeSyncParams) {
  useEffect(() => {
    const stored = localStorage.getItem("creepr-theme");
    if (stored === "light" || stored === "dark") {
      if (stored !== themeMode) {
        setThemeMode(stored);
      }
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark && themeMode !== "dark") {
        setThemeMode("dark");
      }
    }

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
}

export function useThemeApply(themeMode: "light" | "dark") {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode === "dark" ? "bw-dark" : "bw");
  }, [themeMode]);
}
