"use client";

import { useCallback } from "react";
import { Panel, useReactFlow } from "@xyflow/react";
import { ArrowDown, ArrowRight, RotateCw, Grid3X3, ChevronsDown, ChevronsUp } from "lucide-react";
import { useAppStore, type LayoutDirection, type SpacingPreset } from "@/lib/store";
import { relayoutFlow } from "@/lib/flow/layout-builder";
import { LAYOUT_PRESETS } from "@/lib/flow/constants";
import type { CustomNode, CustomEdge } from "@/types/flow";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LayoutControls() {
  const {
    layoutDirection,
    spacingPreset,
    snapToGrid,
    setLayoutDirection,
    setSpacingPreset,
    setSnapToGrid,
    setFlowData,
    collapseAll,
    expandAll,
  } = useAppStore();

  const { getNodes, getEdges, fitView } = useReactFlow();

  // Re-layout with current settings
  const handleReLayout = useCallback(() => {
    const nodes = getNodes() as CustomNode[];
    const edges = getEdges() as CustomEdge[];

    const preset = LAYOUT_PRESETS[spacingPreset];
    const layouted = relayoutFlow(nodes, edges, {
      direction: layoutDirection,
      nodeSpacing: preset.nodeSpacing,
      rankSpacing: preset.rankSpacing,
    });

    setFlowData(layouted.nodes, layouted.edges);

    // Fit view after layout with animation
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
  }, [layoutDirection, spacingPreset, getNodes, getEdges, setFlowData, fitView]);

  // Change direction and re-layout
  const handleDirectionChange = useCallback(
    (direction: LayoutDirection) => {
      setLayoutDirection(direction);
      // Trigger re-layout after state update
      setTimeout(() => handleReLayout(), 50);
    },
    [setLayoutDirection, handleReLayout]
  );

  // Change spacing and re-layout
  const handleSpacingChange = useCallback(
    (preset: SpacingPreset) => {
      setSpacingPreset(preset);
      // Trigger re-layout after state update
      setTimeout(() => handleReLayout(), 50);
    },
    [setSpacingPreset, handleReLayout]
  );

  return (
    <Panel position="top-right" className="flex flex-col gap-2" aria-label="Layout controls">
      {/* Direction Switcher */}
      <div className="border-border bg-card flex border" role="group" aria-label="Layout direction">
        <Button
          variant={layoutDirection === "TB" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleDirectionChange("TB")}
          className="flex items-center gap-1.5 rounded-none"
          aria-label="Vertical layout - top to bottom hierarchy"
          aria-pressed={layoutDirection === "TB"}
        >
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
          Vertical
        </Button>
        <div className="bg-border w-px" aria-hidden="true" />
        <Button
          variant={layoutDirection === "LR" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleDirectionChange("LR")}
          className="flex items-center gap-1.5 rounded-none"
          aria-label="Horizontal layout - left to right hierarchy"
          aria-pressed={layoutDirection === "LR"}
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          Horizontal
        </Button>
      </div>

      {/* Spacing Presets Dropdown */}
      <Select
        value={spacingPreset}
        onValueChange={(value) => handleSpacingChange(value as SpacingPreset)}
      >
        <SelectTrigger className="border-border bg-card border" aria-label="Node spacing preset">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="compact">Compact</SelectItem>
          <SelectItem value="balanced">Balanced</SelectItem>
          <SelectItem value="spacious">Spacious</SelectItem>
        </SelectContent>
      </Select>

      {/* Re-layout Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleReLayout}
        className="flex items-center justify-center gap-2"
        aria-label="Re-apply automatic layout after manual dragging"
      >
        <RotateCw className="h-4 w-4" aria-hidden="true" />
        Re-layout
      </Button>

      {/* Snap to Grid Toggle */}
      <Button
        variant={snapToGrid ? "default" : "outline"}
        size="sm"
        onClick={() => setSnapToGrid(!snapToGrid)}
        className="flex items-center justify-center gap-2"
        aria-label={snapToGrid ? "Disable snap to grid" : "Enable snap to grid"}
        aria-pressed={snapToGrid}
      >
        <Grid3X3 className="h-4 w-4" aria-hidden="true" />
        {snapToGrid ? "Grid ON" : "Grid OFF"}
      </Button>

      {/* Divider */}
      <div className="bg-border my-1 h-px" aria-hidden="true" />

      {/* Collapse/Expand Controls */}
      <Button
        variant="outline"
        size="sm"
        onClick={collapseAll}
        className="flex items-center justify-center gap-2"
        aria-label="Collapse all nodes with children"
      >
        <ChevronsUp className="h-4 w-4" aria-hidden="true" />
        Collapse All
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={expandAll}
        className="flex items-center justify-center gap-2"
        aria-label="Expand all collapsed nodes"
      >
        <ChevronsDown className="h-4 w-4" aria-hidden="true" />
        Expand All
      </Button>
    </Panel>
  );
}
