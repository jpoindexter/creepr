import { create } from "zustand";
import { CrawlResult, CrawlProgress } from "@/types/sitemap";
import { CustomNode, CustomEdge } from "@/types/flow";

export type LayoutDirection = "TB" | "LR" | "BT" | "RL";
export type SpacingPreset = "compact" | "balanced" | "spacious";
export type ViewMode = "tree" | "list";

interface AppState {
  // Crawl state
  crawlStatus: "idle" | "crawling" | "completed" | "error" | "cancelled";
  crawlError: string | null;
  crawlSessionId: string | null;

  // Crawl results
  crawlResult: CrawlResult | null;

  // Progress tracking
  crawlProgress: CrawlProgress | null;

  // Flow data
  flowNodes: CustomNode[];
  flowEdges: CustomEdge[];

  // Selected node
  selectedNodeId: string | null;

  // View mode
  viewMode: ViewMode;

  // Layout settings
  layoutDirection: LayoutDirection;
  spacingPreset: SpacingPreset;
  snapToGrid: boolean;

  // Collapsed nodes (for tree expansion/collapse)
  collapsedNodes: Set<string>;

  // Actions
  setCrawlStatus: (status: "idle" | "crawling" | "completed" | "error" | "cancelled") => void;
  setCrawlError: (error: string | null) => void;
  setCrawlSessionId: (sessionId: string | null) => void;
  setCrawlResult: (result: CrawlResult) => void;
  setCrawlProgress: (progress: CrawlProgress | null) => void;
  setFlowData: (nodes: CustomNode[], edges: CustomEdge[]) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setLayoutDirection: (direction: LayoutDirection) => void;
  setSpacingPreset: (preset: SpacingPreset) => void;
  setSnapToGrid: (enabled: boolean) => void;
  toggleNodeCollapse: (nodeId: string) => void;
  collapseAll: () => void;
  expandAll: () => void;
  cancelCrawl: () => Promise<void>;
  reset: () => void;
}

// Helper to get initial view mode from localStorage
const getInitialViewMode = (): ViewMode => {
  if (typeof window === "undefined") return "list"; // SSR default
  const stored = localStorage.getItem("creepr-view-mode");
  return (stored === "tree" || stored === "list") ? stored : "list";
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  crawlStatus: "idle",
  crawlError: null,
  crawlSessionId: null,
  crawlResult: null,
  crawlProgress: null,
  flowNodes: [],
  flowEdges: [],
  selectedNodeId: null,
  viewMode: getInitialViewMode(),
  layoutDirection: "TB",
  spacingPreset: "balanced",
  snapToGrid: false,
  collapsedNodes: new Set<string>(),

  // Actions
  setCrawlStatus: (status) => set({ crawlStatus: status }),

  setCrawlError: (error) => set({ crawlError: error }),

  setCrawlSessionId: (sessionId) => set({ crawlSessionId: sessionId }),

  setCrawlResult: (result) => set({ crawlResult: result, crawlStatus: "completed" }),

  setCrawlProgress: (progress) => set({ crawlProgress: progress }),

  setFlowData: (nodes, edges) => set({ flowNodes: nodes, flowEdges: edges }),

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

  setViewMode: (mode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("creepr-view-mode", mode);
    }
    set({ viewMode: mode });
  },

  setLayoutDirection: (direction) => set({ layoutDirection: direction }),

  setSpacingPreset: (preset) => set({ spacingPreset: preset }),

  setSnapToGrid: (enabled) => set({ snapToGrid: enabled }),

  toggleNodeCollapse: (nodeId) => {
    const { collapsedNodes } = get();
    const newCollapsedNodes = new Set(collapsedNodes);
    if (newCollapsedNodes.has(nodeId)) {
      newCollapsedNodes.delete(nodeId);
    } else {
      newCollapsedNodes.add(nodeId);
    }
    set({ collapsedNodes: newCollapsedNodes });
  },

  collapseAll: () => {
    const { flowNodes } = get();
    const nodesWithChildren = flowNodes.filter((node) => node.data.childCount && node.data.childCount > 0);
    const allNodeIds = new Set(nodesWithChildren.map((node) => node.id));
    set({ collapsedNodes: allNodeIds });
  },

  expandAll: () => {
    set({ collapsedNodes: new Set<string>() });
  },

  cancelCrawl: async () => {
    const { crawlSessionId } = get();

    if (!crawlSessionId) {
      return;
    }

    try {
      const response = await fetch(`/api/crawl/${crawlSessionId}`, { method: "DELETE" });

      if (response.ok) {
        set({ crawlStatus: "cancelled", crawlSessionId: null });
      }
    } catch {
      // Ignore cancel errors
    }
  },

  reset: () =>
    set({
      crawlStatus: "idle",
      crawlError: null,
      crawlSessionId: null,
      crawlResult: null,
      crawlProgress: null,
      flowNodes: [],
      flowEdges: [],
      selectedNodeId: null,
      collapsedNodes: new Set<string>(),
    }),
}));
