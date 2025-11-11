import { NextRequest, NextResponse } from "next/server";
import { SitemapCrawler } from "@/lib/crawler/sitemap-crawler";
import { buildSitemapTree, getTreeStats } from "@/lib/flow/tree-builder";
import { CrawlRequest, CrawlResult } from "@/types/sitemap";
import { isValidUrl } from "@/lib/utils";
import { randomUUID } from "crypto";

// Store active crawlers with their abort controllers
// Exported so the cancel endpoint can access it
export const activeCrawls = new Map<string, { crawler: SitemapCrawler; controller: AbortController }>();

export async function POST(request: NextRequest) {
  try {
    const body: CrawlRequest = await request.json();

    // Validate request
    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!isValidUrl(body.url)) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Default options
    const maxDepth = body.maxDepth ?? 10;
    const maxPages = body.maxPages ?? 100;
    const interactiveMode = body.interactiveMode ?? false;

    // Generate session ID for this crawl
    const sessionId = randomUUID();

    console.info(
      `Starting crawl ${sessionId} for ${body.url} (${interactiveMode ? "Interactive Mode" : "Sitemap Mode"})`
    );
    const startTime = Date.now();

    // Create abort controller for this crawl
    const controller = new AbortController();

    // Create and run crawler with abort signal
    const crawler = new SitemapCrawler(
      body.url,
      {
        maxDepth,
        maxPages,
        timeout: 30000,
        interactiveMode,
      },
      controller.signal
    );

    // Store in active crawls map
    activeCrawls.set(sessionId, { crawler, controller });

    try {
      const pages = await crawler.crawl();

      console.info(`Crawled ${pages.length} pages in ${Date.now() - startTime}ms`);

      // Build tree structure
      const tree = buildSitemapTree(pages, body.url);
      const stats = getTreeStats(tree);

      const crawlTime = Date.now() - startTime;

      // Get error information
      const failedUrls = crawler.getFailedUrls();
      const errorSummary = crawler.getErrorSummary();

      // Prepare response
      const result: CrawlResult = {
        rootUrl: body.url,
        pages: pages.map((page) => ({
          url: page.url,
          title: page.title,
          statusCode: page.statusCode,
          links: page.links,
          depth: page.depth,
          parentUrl: page.parentUrl,
        })),
        totalPages: stats.totalPages,
        brokenLinks: stats.brokenLinks,
        crawlTime,
        tree,
        failedUrls,
        errorSummary,
        sessionId,
      };

      return NextResponse.json(result);
    } finally {
      // Clean up: remove from active crawls
      activeCrawls.delete(sessionId);
    }
  } catch (error) {
    console.error("Crawl error:", error);

    return NextResponse.json(
      {
        error: "Failed to crawl website",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Sitemap crawler API is running",
  });
}
