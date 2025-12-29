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
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CustomNode } from "./CustomNode";
import { LayoutControls } from "./LayoutControls";
import { CustomNode as CustomNodeType, CustomEdge } from "@/types/flow";
import { useAppStore } from "@/lib/store";
import { exportStylesToJSON, exportSitemapXML } from "@/lib/export";
import { Download, Image, FileImage, FileCode, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toPng, toSvg } from "html-to-image";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

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

// Inner component that uses useReactFlow (must be inside ReactFlowProvider)
function ZoomToSelection() {
  const { setCenter, getNode } = useReactFlow();
  const { selectedNodeId } = useAppStore();

  useEffect(() => {
    if (!selectedNodeId) return;

    const node = getNode(selectedNodeId);
    if (!node) return;

    // Calculate the center of the node
    const x = node.position.x + (node.measured?.width ?? 140) / 2;
    const y = node.position.y + (node.measured?.height ?? 50) / 2;

    // Smoothly center on the selected node
    setCenter(x, y, { zoom: 1, duration: 500 });
  }, [selectedNodeId, setCenter, getNode]);

  return null;
}

// Keyboard navigation component for React Flow
interface KeyboardNavigationProps {
  nodes: CustomNodeType[];
  edges: CustomEdge[];
  onNodeSelect: (nodeId: string) => void;
}

function KeyboardNavigation({ nodes, edges, onNodeSelect }: KeyboardNavigationProps) {
  const { setCenter, getNode } = useReactFlow();
  const { selectedNodeId, setSelectedNode, toggleNodeCollapse } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard navigation when not focused on an input
      const activeElement = document.activeElement;
      if (
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.tagName === "SELECT"
      ) {
        return;
      }

      const currentNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight": {
          e.preventDefault();
          // Find children of current node
          if (currentNode) {
            const childEdges = edges.filter((edge) => edge.source === currentNode.id);
            if (childEdges.length > 0) {
              const firstChildId = childEdges[0].target;
              onNodeSelect(firstChildId);
              focusNode(firstChildId);
            } else {
              // No children, try to find next sibling
              const siblingId = findNextSibling(currentNode.id);
              if (siblingId) {
                onNodeSelect(siblingId);
                focusNode(siblingId);
              }
            }
          } else if (nodes.length > 0) {
            // No selection, select root
            const rootNode = nodes.find((n) => n.data.depth === 0) || nodes[0];
            onNodeSelect(rootNode.id);
            focusNode(rootNode.id);
          }
          break;
        }

        case "ArrowUp":
        case "ArrowLeft": {
          e.preventDefault();
          // Find parent of current node
          if (currentNode) {
            const parentEdge = edges.find((edge) => edge.target === currentNode.id);
            if (parentEdge) {
              onNodeSelect(parentEdge.source);
              focusNode(parentEdge.source);
            }
          }
          break;
        }

        case "Home": {
          e.preventDefault();
          // Go to root node
          const rootNode = nodes.find((n) => n.data.depth === 0);
          if (rootNode) {
            onNodeSelect(rootNode.id);
            focusNode(rootNode.id);
          }
          break;
        }

        case "End": {
          e.preventDefault();
          // Go to last node (deepest)
          const deepestNode = nodes.reduce(
            (prev, curr) => (curr.data.depth > prev.data.depth ? curr : prev),
            nodes[0]
          );
          if (deepestNode) {
            onNodeSelect(deepestNode.id);
            focusNode(deepestNode.id);
          }
          break;
        }

        case "Enter":
        case " ": {
          e.preventDefault();
          // Toggle collapse if node has children
          if (currentNode && currentNode.data.childCount > 0) {
            toggleNodeCollapse(currentNode.id);
          }
          break;
        }
      }
    };

    const findNextSibling = (nodeId: string): string | null => {
      // Find parent
      const parentEdge = edges.find((edge) => edge.target === nodeId);
      if (!parentEdge) return null;

      // Find all siblings (children of the same parent)
      const siblingEdges = edges.filter((edge) => edge.source === parentEdge.source);
      const currentIndex = siblingEdges.findIndex((edge) => edge.target === nodeId);

      // Get next sibling
      if (currentIndex < siblingEdges.length - 1) {
        return siblingEdges[currentIndex + 1].target;
      }
      return null;
    };

    const focusNode = (nodeId: string) => {
      const node = getNode(nodeId);
      if (node) {
        const x = node.position.x + (node.measured?.width ?? 140) / 2;
        const y = node.position.y + (node.measured?.height ?? 50) / 2;
        setCenter(x, y, { zoom: 1, duration: 300 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    nodes,
    edges,
    selectedNodeId,
    onNodeSelect,
    setSelectedNode,
    toggleNodeCollapse,
    getNode,
    setCenter,
  ]);

  return null;
}

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
  // Using useEffect instead of useMemo since we're performing side effects
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

    toast({
      title: "Export successful",
      description: "Sitemap JSON downloaded",
    });
  }, [nodes, edges, toast]);

  const handleExportPng = useCallback(async () => {
    if (!flowRef.current) return;

    try {
      // Find the React Flow viewport element
      const viewport = flowRef.current.querySelector(".react-flow__viewport") as HTMLElement;
      if (!viewport) return;

      const dataUrl = await toPng(viewport, {
        backgroundColor: "#FAFAFA",
        pixelRatio: 2, // Higher quality
        filter: (node) => {
          // Exclude controls, minimap, and panels from export
          const className = node.className?.toString() || "";
          return (
            !className.includes("react-flow__controls") &&
            !className.includes("react-flow__minimap") &&
            !className.includes("react-flow__panel")
          );
        },
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `sitemap-${Date.now()}.png`;
      a.click();

      toast({
        title: "Export successful",
        description: "Sitemap PNG downloaded",
      });
    } catch (error) {
      console.error("Failed to export PNG:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not export PNG image",
      });
    }
  }, [toast]);

  const handleExportSvg = useCallback(async () => {
    if (!flowRef.current) return;

    try {
      // Find the React Flow viewport element
      const viewport = flowRef.current.querySelector(".react-flow__viewport") as HTMLElement;
      if (!viewport) return;

      const dataUrl = await toSvg(viewport, {
        backgroundColor: "#FAFAFA",
        filter: (node) => {
          // Exclude controls, minimap, and panels from export
          const className = node.className?.toString() || "";
          return (
            !className.includes("react-flow__controls") &&
            !className.includes("react-flow__minimap") &&
            !className.includes("react-flow__panel")
          );
        },
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `sitemap-${Date.now()}.svg`;
      a.click();

      toast({
        title: "Export successful",
        description: "Sitemap SVG downloaded",
      });
    } catch (error) {
      console.error("Failed to export SVG:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not export SVG image",
      });
    }
  }, [toast]);

  const handleExportPdf = useCallback(async () => {
    if (!flowRef.current) return;

    try {
      // Find the React Flow viewport element
      const viewport = flowRef.current.querySelector(".react-flow__viewport") as HTMLElement;
      if (!viewport) return;

      const dataUrl = await toPng(viewport, {
        backgroundColor: "#FAFAFA",
        pixelRatio: 2,
        filter: (node) => {
          const className = node.className?.toString() || "";
          return (
            !className.includes("react-flow__controls") &&
            !className.includes("react-flow__minimap") &&
            !className.includes("react-flow__panel")
          );
        },
      });

      // Create PDF in landscape orientation
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Add title
      pdf.setFontSize(16);
      pdf.text("Sitemap Report", 14, 15);
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
      pdf.text(`Total nodes: ${nodes.length}`, 14, 28);

      // Calculate image dimensions (with padding)
      const imgWidth = pdfWidth - 28; // 14mm padding on each side
      const imgHeight = pdfHeight - 50; // Leave space for header

      // Add the sitemap image
      pdf.addImage(dataUrl, "PNG", 14, 35, imgWidth, imgHeight);

      // Save the PDF
      pdf.save(`sitemap-${Date.now()}.pdf`);

      toast({
        title: "Export successful",
        description: "Sitemap PDF downloaded",
      });
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not export PDF document",
      });
    }
  }, [nodes.length, toast]);

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
        {/* Professional dot grid background */}
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#D0D0D0" />

        {/* Zoom/pan controls */}
        <Controls
          className="!border-border !bg-card !border !shadow-none"
          showInteractive={false}
          aria-label="Zoom and pan controls"
        />

        {/* Minimap */}
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

        {/* Layout Controls (direction, spacing, re-layout, snap-to-grid) */}
        <LayoutControls />

        {/* Export button panel */}
        <Panel position="top-left" className="flex flex-wrap gap-2" aria-label="Export options">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
            aria-label="Export sitemap as JSON file"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportStylesToJSON(crawlResult)}
            className="flex items-center gap-2"
            aria-label="Export extracted page styles as JSON file"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Styles
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPng}
            className="flex items-center gap-2"
            aria-label="Export sitemap as PNG image"
          >
            <Image className="h-4 w-4" aria-hidden="true" />
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSvg}
            className="flex items-center gap-2"
            aria-label="Export sitemap as SVG vector graphic"
          >
            <FileImage className="h-4 w-4" aria-hidden="true" />
            SVG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportSitemapXML(crawlResult)}
            className="flex items-center gap-2"
            aria-label="Export as sitemap.xml for search engines"
          >
            <FileCode className="h-4 w-4" aria-hidden="true" />
            XML
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            className="flex items-center gap-2"
            aria-label="Export sitemap as PDF document"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            PDF
          </Button>
        </Panel>

        {/* Simple legend */}
        <Panel
          position="bottom-left"
          style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", padding: "8px 12px" }}
        >
          <div className="flex gap-4 font-mono text-[10px] text-black/60">
            <span>
              <span className="mr-1 inline-block h-2 w-2" style={{ background: "#0A0A0A" }} /> Root
            </span>
            <span>
              <span
                className="mr-1 inline-block h-2 w-2"
                style={{ background: "#1A1A1A", border: "1px solid #333333" }}
              />{" "}
              Page
            </span>
            <span>
              <span
                className="mr-1 inline-block h-2 w-2"
                style={{ background: "#666666", border: "1px solid #888888" }}
              />{" "}
              Error
            </span>
          </div>
        </Panel>

        {/* Zoom to selected node */}
        <ZoomToSelection />

        {/* Keyboard navigation */}
        <KeyboardNavigation
          nodes={nodes}
          edges={edges}
          onNodeSelect={(nodeId) => onNodeClick?.(nodeId)}
        />
      </ReactFlow>
    </div>
  );
}

// Main export wrapped in ReactFlowProvider for useReactFlow hook
export function SitemapFlow(props: SitemapFlowProps) {
  return (
    <ReactFlowProvider>
      <SitemapFlowInner {...props} />
    </ReactFlowProvider>
  );
}
