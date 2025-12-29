import { create } from "zustand";
import { CrawlResult, CrawlProgress } from "@/types/sitemap";
import { CustomNode, CustomEdge } from "@/types/flow";
import { FullAuditReport } from "@/lib/source-auditor";
import { AIAuditReport } from "@/lib/ai-auditor";
import { DesignSystemAuditReport } from "@/lib/design-system-auditor";

export type LayoutDirection = "TB" | "LR" | "BT" | "RL";
export type SpacingPreset = "compact" | "balanced" | "spacious";
export type ViewMode = "tree" | "list";
export type ThemeMode = "light" | "dark";

export interface AuditProgress {
  stage: string;
  percent: number;
}

interface AppState {
  // Crawl state
  crawlStatus: "idle" | "crawling" | "completed" | "error" | "cancelled";
  crawlError: string | null;
  crawlSessionId: string | null;

  // Crawl results
  crawlResult: CrawlResult | null;

  // Progress tracking
  crawlProgress: CrawlProgress | null;

  // Audit state
  auditStatus: "idle" | "auditing" | "completed";
  auditProgress: AuditProgress | null;
  auditReport: FullAuditReport | null;
  aiAuditReport: AIAuditReport | null;
  designSystemReport: DesignSystemAuditReport | null;

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

  // UI state
  sidebarOpen: boolean;
  themeMode: ThemeMode;
  layoutStatus: "idle" | "calculating" | "done";

  // Actions
  setCrawlStatus: (status: "idle" | "crawling" | "completed" | "error" | "cancelled") => void;
  setCrawlError: (error: string | null) => void;
  setCrawlSessionId: (sessionId: string | null) => void;
  setCrawlResult: (result: CrawlResult) => void;
  setCrawlProgress: (progress: CrawlProgress | null) => void;
  setAuditStatus: (status: "idle" | "auditing" | "completed") => void;
  setAuditProgress: (progress: AuditProgress | null) => void;
  setAuditReport: (report: FullAuditReport | null) => void;
  setAiAuditReport: (report: AIAuditReport | null) => void;
  setDesignSystemReport: (report: DesignSystemAuditReport | null) => void;
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
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setLayoutStatus: (status: "idle" | "calculating" | "done") => void;
}

// Note: These helpers are called during store initialization.
// To avoid hydration mismatches, they must return consistent values for SSR.
// The actual stored values are synced in useEffect hooks in components.

// Helper to get initial view mode - always return SSR-safe default
const getInitialViewMode = (): ViewMode => {
  // Always return "list" to avoid hydration mismatch
  // Component will sync with localStorage after mount
  return "list";
};

// Helper to get initial theme - always return SSR-safe default
const getInitialTheme = (): ThemeMode => {
  // Always return "light" to avoid hydration mismatch
  // Component will sync with localStorage/system preference after mount
  return "light";
};

// Apply theme to DOM
const applyTheme = (mode: ThemeMode): void => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", mode === "dark" ? "bw-dark" : "bw");
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  crawlStatus: "idle",
  crawlError: null,
  crawlSessionId: null,
  crawlResult: null,
  crawlProgress: null,
  auditStatus: "idle",
  auditProgress: null,
  auditReport: null,
  aiAuditReport: null,
  designSystemReport: null,
  flowNodes: [],
  flowEdges: [],
  selectedNodeId: null,
  viewMode: getInitialViewMode(),
  layoutDirection: "TB",
  spacingPreset: "balanced",
  snapToGrid: false,
  collapsedNodes: new Set<string>(),
  sidebarOpen: true, // Default open on desktop, will be handled by component
  themeMode: getInitialTheme(),
  layoutStatus: "idle",

  // Actions
  setCrawlStatus: (status) => set({ crawlStatus: status }),

  setCrawlError: (error) => set({ crawlError: error }),

  setCrawlSessionId: (sessionId) => set({ crawlSessionId: sessionId }),

  setCrawlResult: (result) => set({ crawlResult: result, crawlStatus: "completed" }),

  setCrawlProgress: (progress) => set({ crawlProgress: progress }),

  setAuditStatus: (status) => set({ auditStatus: status }),

  setAuditProgress: (progress) => set({ auditProgress: progress }),

  setAuditReport: (report) => set({ auditReport: report }),

  setAiAuditReport: (report) => set({ aiAuditReport: report }),

  setDesignSystemReport: (report) => set({ designSystemReport: report }),

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
    const nodesWithChildren = flowNodes.filter(
      (node) => node.data.childCount && node.data.childCount > 0
    );
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

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setThemeMode: (mode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("creepr-theme", mode);
    }
    applyTheme(mode);
    set({ themeMode: mode });
  },

  toggleTheme: () => {
    const { themeMode, setThemeMode } = get();
    setThemeMode(themeMode === "light" ? "dark" : "light");
  },

  setLayoutStatus: (status) => set({ layoutStatus: status }),
}));
