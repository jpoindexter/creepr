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
import { CustomNode as CustomNodeType, CustomEdge } from "@/types/flow";
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

        {/* Minimap with purple theme */}
        <MiniMap
          nodeColor={(node) => {
            if (node.data?.isBroken) return "#DC2626"; // Red
            if (node.data?.depth === 0) return "#9945FF"; // Purple
            return "#CBD5E0"; // Light gray
          }}
          className="!border-2 !border-purple-200 !bg-white !shadow-lg"
          maskColor="rgba(153, 69, 255, 0.1)"
        />

        {/* Export button panel */}
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg border-2 border-purple-500 bg-white px-4 py-2 text-sm font-medium text-purple-700 shadow-lg transition-all hover:bg-purple-50 hover:shadow-xl"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
