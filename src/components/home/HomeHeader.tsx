"use client";

import { Button } from "@/components/ui/button";
import { ViewSwitcher } from "@/components/views/ViewSwitcher";
import type { ViewMode } from "@/lib/store";
import { Menu, X, PanelLeftClose, PanelLeft, Sun, Moon } from "lucide-react";

interface HomeHeaderProps {
  mounted: boolean;
  themeMode: "light" | "dark";
  sidebarOpen: boolean;
  crawlStatus: string;
  viewMode: ViewMode;
  flowNodesLength: number;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export function HomeHeader({
  mounted,
  themeMode,
  sidebarOpen,
  crawlStatus,
  viewMode,
  flowNodesLength,
  toggleSidebar,
  toggleTheme,
  onViewModeChange,
}: HomeHeaderProps) {
  return (
    <header className="border-border bg-card border-b px-4 py-3 lg:px-6 lg:py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
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
          {/* Theme toggle */}
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
              <Moon className="h-4 w-4" aria-hidden="true" />
            ) : themeMode === "light" ? (
              <Moon className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Sun className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
          {/* View Switcher */}
          {crawlStatus === "completed" && flowNodesLength > 0 && (
            <ViewSwitcher currentView={viewMode} onViewChange={onViewModeChange} />
          )}
        </div>
      </div>
    </header>
  );
}
