"use client";

import { useCallback } from "react";
import { Panel, useReactFlow } from "@xyflow/react";
import { ArrowDown, ArrowRight, RotateCw, Grid3X3 } from "lucide-react";
import { useAppStore, type LayoutDirection, type SpacingPreset } from "@/lib/store";
import { relayoutFlow } from "@/lib/flow/layout-builder";
import { LAYOUT_PRESETS } from "@/lib/flow/constants";
import type { CustomNode, CustomEdge } from "@/types/flow";

export function LayoutControls() {
  const {
    layoutDirection,
    spacingPreset,
    snapToGrid,
    setLayoutDirection,
    setSpacingPreset,
    setSnapToGrid,
    setFlowData,
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
    <Panel position="top-right" className="flex flex-col gap-2">
      {/* Direction Switcher */}
      <div className="flex rounded-lg border-2 border-purple-500 bg-white shadow-lg">
        <button
          onClick={() => handleDirectionChange("TB")}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
            layoutDirection === "TB"
              ? "bg-purple-100 text-purple-900"
              : "text-gray-600 hover:bg-gray-50"
          }`}
          title="Vertical Layout (Top to Bottom)"
        >
          <ArrowDown className="h-4 w-4" />
          Vertical
        </button>
        <div className="w-px bg-purple-200" />
        <button
          onClick={() => handleDirectionChange("LR")}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
            layoutDirection === "LR"
              ? "bg-purple-100 text-purple-900"
              : "text-gray-600 hover:bg-gray-50"
          }`}
          title="Horizontal Layout (Left to Right)"
        >
          <ArrowRight className="h-4 w-4" />
          Horizontal
        </button>
      </div>

      {/* Spacing Presets Dropdown */}
      <select
        value={spacingPreset}
        onChange={(e) => handleSpacingChange(e.target.value as SpacingPreset)}
        className="rounded-lg border-2 border-purple-500 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-lg transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        title="Change node spacing"
      >
        <option value="compact">🔸 Compact</option>
        <option value="balanced">🔹 Balanced</option>
        <option value="spacious">🔷 Spacious</option>
      </select>

      {/* Re-layout Button */}
      <button
        onClick={handleReLayout}
        className="flex items-center justify-center gap-2 rounded-lg border-2 border-purple-500 bg-white px-3 py-2 text-sm font-medium text-purple-700 shadow-lg transition-all hover:bg-purple-50 hover:shadow-xl"
        title="Re-apply layout (useful after manual dragging)"
      >
        <RotateCw className="h-4 w-4" />
        Re-layout
      </button>

      {/* Snap to Grid Toggle */}
      <button
        onClick={() => setSnapToGrid(!snapToGrid)}
        className={`flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium shadow-lg transition-all ${
          snapToGrid
            ? "border-purple-500 bg-purple-100 text-purple-900"
            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
        }`}
        title={snapToGrid ? "Snap to Grid: ON" : "Snap to Grid: OFF"}
      >
        <Grid3X3 className="h-4 w-4" />
        {snapToGrid ? "Grid ON" : "Grid OFF"}
      </button>
    </Panel>
  );
}
