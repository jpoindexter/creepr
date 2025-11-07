import { create } from 'zustand';
import { CrawlResult, SitemapNode } from '@/types/sitemap';
import { CustomNode, CustomEdge } from '@/types/flow';

interface AppState {
  // Crawl state
  crawlStatus: 'idle' | 'crawling' | 'completed' | 'error';
  crawlError: string | null;

  // Crawl results
  crawlResult: CrawlResult | null;

  // Flow data
  flowNodes: CustomNode[];
  flowEdges: CustomEdge[];

  // Selected node
  selectedNodeId: string | null;

  // Actions
  setCrawlStatus: (status: 'idle' | 'crawling' | 'completed' | 'error') => void;
  setCrawlError: (error: string | null) => void;
  setCrawlResult: (result: CrawlResult) => void;
  setFlowData: (nodes: CustomNode[], edges: CustomEdge[]) => void;
  setSelectedNode: (nodeId: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  crawlStatus: 'idle',
  crawlError: null,
  crawlResult: null,
  flowNodes: [],
  flowEdges: [],
  selectedNodeId: null,

  // Actions
  setCrawlStatus: (status) => set({ crawlStatus: status }),

  setCrawlError: (error) => set({ crawlError: error }),

  setCrawlResult: (result) => set({ crawlResult: result, crawlStatus: 'completed' }),

  setFlowData: (nodes, edges) => set({ flowNodes: nodes, flowEdges: edges }),

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

  reset: () => set({
    crawlStatus: 'idle',
    crawlError: null,
    crawlResult: null,
    flowNodes: [],
    flowEdges: [],
    selectedNodeId: null,
  }),
}));
