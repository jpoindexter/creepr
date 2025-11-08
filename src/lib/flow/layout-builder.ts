import dagre from "dagre";
import { Node, Edge } from "@xyflow/react";
import { SitemapNode } from "@/types/sitemap";
import { CustomNodeData, CustomEdgeData, FlowElements, LayoutOptions } from "@/types/flow";
import { createFlowNode } from "./node-factory";
import { createFlowEdge } from "./edge-factory";
import { flattenTree } from "./tree-builder";

const defaultLayoutOptions: LayoutOptions = {
  direction: "TB",
  nodeSpacing: 100,
  rankSpacing: 150,
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

  const nodeWidth = 200;
  const nodeHeight = 80;

  dagreGraph.setGraph({
    rankdir: options.direction,
    nodesep: options.nodeSpacing,
    ranksep: options.rankSpacing,
  });

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
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
