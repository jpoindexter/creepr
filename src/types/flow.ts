import { Node, Edge } from "@xyflow/react";

// Custom node data
export interface CustomNodeData extends Record<string, unknown> {
  label: string;
  url: string;
  statusCode: number;
  isBroken: boolean;
  depth: number;
  title: string;
}

// Custom node type
export type CustomNode = Node<CustomNodeData>;

// Custom edge data
export interface CustomEdgeData extends Record<string, unknown> {
  isBroken: boolean;
}

// Custom edge type
export type CustomEdge = Edge<CustomEdgeData>;

// Flow elements (nodes and edges)
export interface FlowElements {
  nodes: CustomNode[];
  edges: CustomEdge[];
}

// Layout options
export interface LayoutOptions {
  direction: "TB" | "LR" | "BT" | "RL"; // Top-Bottom, Left-Right, etc.
  nodeSpacing: number;
  rankSpacing: number;
}
