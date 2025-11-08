import { create } from "zustand";
import { CrawlResult } from "@/types/sitemap";
import { CustomNode, CustomEdge } from "@/types/flow";

export type LayoutDirection = "TB" | "LR" | "BT" | "RL";
export type SpacingPreset = "compact" | "balanced" | "spacious";

interface AppState {
  // Crawl state
  crawlStatus: "idle" | "crawling" | "completed" | "error";
  crawlError: string | null;

  // Crawl results
  crawlResult: CrawlResult | null;

  // Flow data
  flowNodes: CustomNode[];
  flowEdges: CustomEdge[];

  // Selected node
  selectedNodeId: string | null;

  // Layout settings
  layoutDirection: LayoutDirection;
  spacingPreset: SpacingPreset;
  snapToGrid: boolean;

  // Actions
  setCrawlStatus: (status: "idle" | "crawling" | "completed" | "error") => void;
  setCrawlError: (error: string | null) => void;
  setCrawlResult: (result: CrawlResult) => void;
  setFlowData: (nodes: CustomNode[], edges: CustomEdge[]) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setLayoutDirection: (direction: LayoutDirection) => void;
  setSpacingPreset: (preset: SpacingPreset) => void;
  setSnapToGrid: (enabled: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  crawlStatus: "idle",
  crawlError: null,
  crawlResult: null,
  flowNodes: [],
  flowEdges: [],
  selectedNodeId: null,
  layoutDirection: "TB",
  spacingPreset: "balanced",
  snapToGrid: false,

  // Actions
  setCrawlStatus: (status) => set({ crawlStatus: status }),

  setCrawlError: (error) => set({ crawlError: error }),

  setCrawlResult: (result) => set({ crawlResult: result, crawlStatus: "completed" }),

  setFlowData: (nodes, edges) => set({ flowNodes: nodes, flowEdges: edges }),

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

  setLayoutDirection: (direction) => set({ layoutDirection: direction }),

  setSpacingPreset: (preset) => set({ spacingPreset: preset }),

  setSnapToGrid: (enabled) => set({ snapToGrid: enabled }),

  reset: () =>
    set({
      crawlStatus: "idle",
      crawlError: null,
      crawlResult: null,
      flowNodes: [],
      flowEdges: [],
      selectedNodeId: null,
    }),
}));
