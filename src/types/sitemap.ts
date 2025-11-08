import { z } from "zod";

// Link status types
export type LinkStatus = "success" | "redirect" | "client-error" | "server-error" | "unknown";

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
}

// Crawl result
export interface CrawlResult {
  rootUrl: string;
  pages: CrawledPage[];
  totalPages: number;
  brokenLinks: number;
  crawlTime: number; // in milliseconds
  tree: SitemapNode;
}

// Crawl request
export interface CrawlRequest {
  url: string;
  maxDepth?: number;
  maxPages?: number;
}

// Crawl status
export interface CrawlStatus {
  status: "idle" | "crawling" | "completed" | "error";
  progress: number; // 0-100
  message?: string;
  currentUrl?: string;
  pagesFound: number;
}
