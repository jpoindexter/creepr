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
  tag: string; // h1, h2, h3, etc.
  text: string;
}

// Image information
export interface ImageInfo {
  src: string;
  alt?: string;
  hasAlt: boolean;
  loading?: string; // lazy, eager, auto
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
  // Enhanced SEO/AI fields
  meta?: MetaInfo;
  headings?: HeadingInfo[];
  images?: ImageInfo[];
  linksWithText?: LinkInfo[];
  contentMetrics?: ContentMetrics;
}
