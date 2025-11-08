import { NodeType } from "@/types/sitemap";

export interface CrawlerOptions {
  maxDepth?: number;
  maxPages?: number;
  timeout?: number;
  userAgent?: string;
  interactiveMode?: boolean; // Enable interactive element detection
}

export interface CrawlProgress {
  pagesVisited: number;
  pagesQueued: number;
  currentUrl: string;
}

export interface PageInfo {
  url: string;
  title: string;
  statusCode: number;
  links: string[];
  depth: number;
  parentUrl?: string;
  error?: string;
  // New fields for interactive mode
  nodeType?: NodeType;
  interactionType?: "click" | "hover" | "expand";
  parentPageUrl?: string;
}
