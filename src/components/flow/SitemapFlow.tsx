"use client";

import { useCallback, useMemo, useRef, useEffect } from "react";
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
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CustomNode } from "./CustomNode";
import { LayoutControls } from "./LayoutControls";
import {
  ZoomToSelection,
  KeyboardNavigation,
  useExportHandlers,
  ExportPanel,
  FlowLegend,
} from "./sitemap-flow";
import { CustomNode as CustomNodeType, CustomEdge } from "@/types/flow";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

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

function SitemapFlowInner({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeClick,
}: SitemapFlowProps) {
  const { snapToGrid, collapsedNodes, crawlResult } = useAppStore();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const flowRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Export handlers
  const { handleDownload, handleExportPng, handleExportSvg, handleExportPdf } = useExportHandlers({
    flowRef,
    nodes,
    edges,
    toast,
  });

  // Filter nodes and edges based on collapsed state
  const getDescendants = useCallback((nodeId: string, allEdges: CustomEdge[]): Set<string> => {
    const descendants = new Set<string>();
    const toProcess = [nodeId];

    while (toProcess.length > 0) {
      const currentId = toProcess.pop()!;
      const children = allEdges.filter((e) => e.source === currentId).map((e) => e.target);

      children.forEach((childId) => {
        if (!descendants.has(childId)) {
          descendants.add(childId);
          toProcess.push(childId);
        }
      });
    }

    return descendants;
  }, []);

  const filteredData = useMemo(() => {
    if (collapsedNodes.size === 0) {
      return { nodes: initialNodes, edges: initialEdges };
    }

    // Find all descendants of collapsed nodes
    const hiddenNodeIds = new Set<string>();
    collapsedNodes.forEach((collapsedId) => {
      const descendants = getDescendants(collapsedId, initialEdges);
      descendants.forEach((id) => hiddenNodeIds.add(id));
    });

    // Filter nodes and edges
    const visibleNodes = initialNodes.filter((node) => !hiddenNodeIds.has(node.id));
    const visibleEdges = initialEdges.filter(
      (edge) => !hiddenNodeIds.has(edge.source) && !hiddenNodeIds.has(edge.target)
    );

    return { nodes: visibleNodes, edges: visibleEdges };
  }, [initialNodes, initialEdges, collapsedNodes, getDescendants]);

  // Update nodes and edges when filtered data changes
  useEffect(() => {
    setNodes(filteredData.nodes);
  }, [filteredData.nodes, setNodes]);

  useEffect(() => {
    setEdges(filteredData.edges);
  }, [filteredData.edges, setEdges]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: CustomNodeType) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  return (
    <div
      ref={flowRef}
      className="h-full w-full"
      style={{ background: "#FAFAFA" }}
      role="application"
      aria-label="Sitemap tree visualization. Use arrow keys to navigate between nodes, Enter or Space to select, Home to return to root."
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={(_event, node) => {
          const { toggleNodeCollapse } = useAppStore.getState();
          if (node.data.childCount > 0) {
            toggleNodeCollapse(node.id);
          }
        }}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        minZoom={0.1}
        maxZoom={2}
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
        nodesFocusable={true}
        edgesFocusable={false}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: false,
        }}
        style={{ background: "#FAFAFA" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#D0D0D0" />

        <Controls
          className="!border-border !bg-card !border !shadow-none"
          showInteractive={false}
          aria-label="Zoom and pan controls"
        />

        <MiniMap
          nodeColor={(node) => {
            if (node.data?.isBroken) return "#999999";
            if (node.data?.depth === 0) return "#0A0A0A";
            return "#333333";
          }}
          style={{ background: "#FFFFFF", border: "1px solid #E0E0E0" }}
          maskColor="rgba(0, 0, 0, 0.05)"
          pannable
          zoomable
          aria-label="Sitemap minimap overview"
        />

        <LayoutControls />

        <ExportPanel
          crawlResult={crawlResult}
          onDownloadJson={handleDownload}
          onExportPng={handleExportPng}
          onExportSvg={handleExportSvg}
          onExportPdf={handleExportPdf}
        />

        <FlowLegend />

        <ZoomToSelection />

        <KeyboardNavigation
          nodes={nodes}
          edges={edges}
          onNodeSelect={(nodeId) => onNodeClick?.(nodeId)}
        />
      </ReactFlow>
    </div>
  );
}

export function SitemapFlow(props: SitemapFlowProps) {
  return (
    <ReactFlowProvider>
      <SitemapFlowInner {...props} />
    </ReactFlowProvider>
  );
}
