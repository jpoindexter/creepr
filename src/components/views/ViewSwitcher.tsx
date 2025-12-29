"use client";

import { Network, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewMode } from "@/lib/store";

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div
      className="border-border bg-card flex overflow-hidden border font-mono"
      role="tablist"
      aria-label="Switch between tree and list view"
    >
      <Button
        variant={currentView === "tree" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("tree")}
        className="flex items-center gap-2 rounded-none"
        role="tab"
        aria-selected={currentView === "tree"}
        aria-label="Tree View - Hierarchical visualization of site structure"
        tabIndex={currentView === "tree" ? 0 : -1}
      >
        <Network className="h-4 w-4" aria-hidden="true" />
        Tree View
      </Button>
      <div className="bg-border w-px" aria-hidden="true" />
      <Button
        variant={currentView === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className="flex items-center gap-2 rounded-none"
        role="tab"
        aria-selected={currentView === "list"}
        aria-label="List View - Tabular view of all pages"
        tabIndex={currentView === "list" ? 0 : -1}
      >
        <List className="h-4 w-4" aria-hidden="true" />
        List View
      </Button>
    </div>
  );
}
