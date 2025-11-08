"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  NodeTypes,
  FitViewOptions,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CustomNode } from "./CustomNode";
import { LayoutControls } from "./LayoutControls";
import { CustomNode as CustomNodeType, CustomEdge } from "@/types/flow";
import { useAppStore } from "@/lib/store";
import { Download } from "lucide-react";

interface SitemapFlowProps {
  nodes: CustomNodeType[];
  edges: CustomEdge[];
  onNodeClick?: (nodeId: string) => void;
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

export function SitemapFlow({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeClick,
}: SitemapFlowProps) {
  const { snapToGrid } = useAppStore();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when props change
  useMemo(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useMemo(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: CustomNodeType) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  const handleDownload = useCallback(() => {
    // Export as JSON
    const data = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sitemap-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  return (
    <div className="h-full w-full bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        minZoom={0.1}
        maxZoom={2}
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: false,
        }}
        className="bg-gradient-to-br from-white to-purple-50/30"
      >
        {/* Professional dot grid background */}
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />

        {/* Zoom/pan controls */}
        <Controls
          className="!border-2 !border-purple-200 !bg-white !shadow-lg"
          showInteractive={false}
        />

        {/* Minimap with node type colors */}
        <MiniMap
          nodeColor={(node) => {
            if (node.data?.isBroken) return "#DC2626"; // Red for broken
            if (node.data?.depth === 0 && node.data?.nodeType === "page") return "#9945FF"; // Purple for root
            // Color by node type
            switch (node.data?.nodeType) {
              case "tab":
                return "#3B82F6"; // Blue
              case "modal":
                return "#F59E0B"; // Orange
              case "accordion":
                return "#10B981"; // Green
              case "dropdown":
                return "#F97316"; // Orange
              case "button":
                return "#6B7280"; // Gray
              case "page":
              default:
                return "#9945FF"; // Purple for pages
            }
          }}
          className="!border-2 !border-purple-200 !bg-white !shadow-lg"
          maskColor="rgba(153, 69, 255, 0.1)"
          pannable
          zoomable
        />

        {/* Layout Controls (direction, spacing, re-layout, snap-to-grid) */}
        <LayoutControls />

        {/* Export button panel */}
        <Panel position="top-left" className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg border-2 border-purple-500 bg-white px-4 py-2 text-sm font-medium text-purple-700 shadow-lg transition-all hover:bg-purple-50 hover:shadow-xl"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </button>
        </Panel>

        {/* Legend panel */}
        <Panel
          position="bottom-left"
          className="rounded-lg border-2 border-purple-200 bg-white p-3 shadow-lg"
        >
          <h3 className="mb-2 text-xs font-semibold text-gray-700">Node Types</h3>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-2 border-purple-600 bg-purple-100"></div>
              <span className="text-xs text-gray-600">📄 Page</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-2 border-blue-600 bg-blue-100"></div>
              <span className="text-xs text-gray-600">📑 Tab</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-2 border-orange-600 bg-yellow-100"></div>
              <span className="text-xs text-gray-600">🔘 Modal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-2 border-green-600 bg-green-100"></div>
              <span className="text-xs text-gray-600">▼ Accordion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-2 border-orange-600 bg-orange-100"></div>
              <span className="text-xs text-gray-600">⋮ Dropdown</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-2 border-gray-600 bg-gray-100"></div>
              <span className="text-xs text-gray-600">🎯 Button</span>
            </div>
            <div className="mt-2 border-t border-gray-200 pt-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded border-2 border-red-600 bg-red-100"></div>
                <span className="text-xs text-gray-600">Broken Link</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
