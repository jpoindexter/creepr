import dagre from "dagre";
import { Node, Edge } from "@xyflow/react";
import { SitemapNode } from "@/types/sitemap";
import { CustomNodeData, CustomEdgeData, FlowElements, LayoutOptions } from "@/types/flow";
import { createFlowNode } from "./node-factory";
import { createFlowEdge } from "./edge-factory";
import { flattenTree } from "./tree-builder";
import { SITEMAP_SPACING } from "./constants";

/**
 * Professional sitemap layout configuration
 * Uses spacing values optimized for hierarchical tree visualization
 */
const defaultLayoutOptions: LayoutOptions = {
  direction: "TB", // Top-to-bottom hierarchy
  nodeSpacing: SITEMAP_SPACING.nodeSeparation, // Horizontal spacing between siblings
  rankSpacing: SITEMAP_SPACING.rankSeparation, // Vertical spacing between levels
};

export function buildFlowData(
  root: SitemapNode,
  options: Partial<LayoutOptions> = {}
): FlowElements {
  const layoutOptions = { ...defaultLayoutOptions, ...options };

  // Flatten tree to get all nodes
  const allNodes = flattenTree(root);

  // Create initial flow nodes (without positions)
  const flowNodes: Node<CustomNodeData>[] = allNodes.map((node) =>
    createFlowNode(node, { x: 0, y: 0 })
  );

  // Create edges based on parent-child relationships
  const flowEdges: Edge<CustomEdgeData>[] = [];
  allNodes.forEach((node) => {
    if (node.parentId) {
      flowEdges.push(createFlowEdge(node.parentId, node.id, node.isBroken));
    }
  });

  // Apply dagre layout
  const layoutedData = getLayoutedElements(flowNodes, flowEdges, layoutOptions);

  return layoutedData;
}

function getLayoutedElements(
  nodes: Node<CustomNodeData>[],
  edges: Edge<CustomEdgeData>[],
  options: LayoutOptions
): FlowElements {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Use professional sitemap node dimensions
  const nodeWidth = SITEMAP_SPACING.regularNode.minWidth;
  const nodeHeight = 110; // Fixed height for consistent layout (larger for readability)

  dagreGraph.setGraph({
    rankdir: options.direction,
    nodesep: options.nodeSpacing,
    ranksep: options.rankSpacing,
    marginx: SITEMAP_SPACING.marginX,
    marginy: SITEMAP_SPACING.marginY,
    align: "UL", // Align nodes to upper-left for cleaner tree structure
    ranker: "network-simplex", // Use network-simplex for better vertical tree layouts (avoids wide horizontal spreads)
    acyclicer: "greedy", // Handle any cycles in the graph
  });

  // Add nodes to dagre with explicit rank based on depth for proper hierarchical layout
  nodes.forEach((node) => {
    const depth = node.data.depth ?? 0;
    dagreGraph.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
      rank: depth, // Explicitly set rank based on depth to ensure hierarchical layout
    });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}

export function relayoutFlow(
  nodes: Node<CustomNodeData>[],
  edges: Edge<CustomEdgeData>[],
  options: Partial<LayoutOptions> = {}
): FlowElements {
  const layoutOptions = { ...defaultLayoutOptions, ...options };
  return getLayoutedElements(nodes, edges, layoutOptions);
}
