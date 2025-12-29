import { z } from "zod";
import {
  PageStyles,
  SecurityHeaders,
  KeywordDensity,
  MobileResponsiveness,
} from "@/lib/crawler/types";

// Link status types
export type LinkStatus = "success" | "redirect" | "client-error" | "server-error" | "unknown";

// Node types for different elements
export type NodeType = "page" | "api" | "tab" | "modal" | "accordion" | "dropdown" | "button";

// Meta tag information
export interface MetaInfo {
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  robots?: string;
  keywords?: string;
}

// Heading information
export interface HeadingInfo {
  tag: string;
  text: string;
}

// Image information
export interface ImageInfo {
  src: string;
  alt?: string;
  hasAlt: boolean;
  loading?: string;
}

// Link with anchor text
export interface LinkInfo {
  url: string;
  anchorText: string;
  title?: string;
}

// Content metrics
export interface ContentMetrics {
  wordCount: number;
  scriptCount: number;
  stylesheetCount: number;
  imageCount: number;
  formCount: number;
}

// Crawled page schema (basic validation)
export const CrawledPageSchema = z.object({
  url: z.string().url(),
  title: z.string().default("Untitled"),
  statusCode: z.number(),
  links: z.array(z.string()),
  depth: z.number().default(0),
  parentUrl: z.string().url().optional(),
});

// Extended crawled page with SEO/AI data
export interface CrawledPage {
  url: string;
  title: string;
  statusCode: number;
  links: string[];
  depth: number;
  parentUrl?: string;
  // Enhanced SEO/AI fields
  meta?: MetaInfo;
  headings?: HeadingInfo[];
  images?: ImageInfo[];
  linksWithText?: LinkInfo[];
  contentMetrics?: ContentMetrics;
  // Full style extraction for design system analysis
  styles?: PageStyles;
  // API endpoint detection
  isApiEndpoint?: boolean;
  contentType?: string;
  // Security headers analysis
  securityHeaders?: SecurityHeaders;
  // Keyword density analysis
  keywordDensity?: KeywordDensity;
  // Mobile responsiveness analysis
  mobileResponsiveness?: MobileResponsiveness;
}

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
  // API endpoint detection
  isApiEndpoint?: boolean;
  contentType?: string;
  // Security headers analysis
  securityHeaders?: SecurityHeaders;
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
  apiEndpoints: number;
  crawlTime: number; // in milliseconds
  tree: SitemapNode;
  failedUrls?: FailedUrl[];
  errorSummary?: ErrorSummary;
  sessionId?: string;
  error?: string; // Error message if crawl failed
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
  isComplete?: boolean; // Indicates crawl has finished
  requestsFinished: number;
  requestsTotal: number;
  requestsFailed: number;
  requestsRetries?: number;
  crawlerRuntimeMillis?: number;
  currentUrl: string;
}
