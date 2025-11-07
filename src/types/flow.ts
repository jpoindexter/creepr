import { Node, Edge } from 'reactflow';
import { SitemapNode } from './sitemap';

// Custom node data
export interface CustomNodeData {
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
export interface CustomEdgeData {
  isBroken: boolean;
}

// Custom edge type
export type CustomEdge = Edge<CustomEdgeData>;

// Flow data
export interface FlowData {
  nodes: CustomNode[];
  edges: CustomEdge[];
}

// Layout options
export interface LayoutOptions {
  direction: 'TB' | 'LR' | 'BT' | 'RL'; // Top-Bottom, Left-Right, etc.
  nodeSpacing: number;
  rankSpacing: number;
}
