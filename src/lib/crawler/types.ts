export interface CrawlerOptions {
  maxDepth?: number;
  maxPages?: number;
  timeout?: number;
  userAgent?: string;
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
}
