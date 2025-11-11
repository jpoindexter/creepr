"use client";

import { Network, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "tree" | "list";

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex rounded-lg border-2 border-purple-500 bg-white shadow-lg overflow-hidden">
      <Button
        variant={currentView === "tree" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("tree")}
        className="flex items-center gap-2 rounded-none"
      >
        <Network className="h-4 w-4" />
        Tree View
      </Button>
      <div className="w-px bg-purple-200" />
      <Button
        variant={currentView === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className="flex items-center gap-2 rounded-none"
      >
        <List className="h-4 w-4" />
        List View
      </Button>
    </div>
  );
}
