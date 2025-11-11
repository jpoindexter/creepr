import { z } from "zod";

// Link status types
export type LinkStatus = "success" | "redirect" | "client-error" | "server-error" | "unknown";

// Node types for different elements
export type NodeType = "page" | "tab" | "modal" | "accordion" | "dropdown" | "button";

// Crawled page schema
export const CrawledPageSchema = z.object({
  url: z.string().url(),
  title: z.string().default("Untitled"),
  statusCode: z.number(),
  links: z.array(z.string()),
  depth: z.number().default(0),
  parentUrl: z.string().url().optional(),
});

export type CrawledPage = z.infer<typeof CrawledPageSchema>;

// Sitemap node (hierarchical structure)
export interface SitemapNode {
  id: string;
  url: string;
  title: string;
  statusCode: number;
  status: LinkStatus;
  depth: number;
  children: SitemapNode[];
  parentId?: string;
  isBroken: boolean;
  // New fields for interactive mode
  nodeType: NodeType;
  interactionType?: "click" | "hover" | "expand";
  parentPageUrl?: string; // Original page URL for interactive elements
  // Virtual folder flag (for intermediate paths that weren't actually crawled)
  isVirtual?: boolean;
}

// Failed URL info
export interface FailedUrl {
  url: string;
  errorType: string;
  errorMessage: string;
  retryCount: number;
}

// Error summary
export interface ErrorSummary {
  timeout: number;
  redirect: number;
  other: number;
}

// Crawl result
export interface CrawlResult {
  rootUrl: string;
  pages: CrawledPage[];
  totalPages: number;
  brokenLinks: number;
  crawlTime: number; // in milliseconds
  tree: SitemapNode;
  failedUrls?: FailedUrl[];
  errorSummary?: ErrorSummary;
  sessionId?: string;
}

// Crawl request
export interface CrawlRequest {
  url: string;
  maxDepth?: number;
  maxPages?: number;
  interactiveMode?: boolean; // New: enable interactive element detection
}

// Crawl status
export interface CrawlStatus {
  status: "idle" | "crawling" | "completed" | "error";
  progress: number; // 0-100
  message?: string;
  currentUrl?: string;
  pagesFound: number;
}

// Crawl progress (real-time statistics)
export interface CrawlProgress {
  requestsFinished: number;
  requestsTotal: number;
  requestsFailed: number;
  requestsRetries?: number;
  crawlerRuntimeMillis?: number;
  currentUrl: string;
}
