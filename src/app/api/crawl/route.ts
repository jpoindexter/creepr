import { NextRequest, NextResponse } from "next/server";
import { SitemapCrawler } from "@/lib/crawler/sitemap-crawler";
import { buildSitemapTree, getTreeStats } from "@/lib/flow/tree-builder";
import { CrawlRequest, CrawlResult } from "@/types/sitemap";
import { isValidUrl } from "@/lib/utils";
import { randomUUID } from "crypto";

// Store active crawlers with their abort controllers
// Exported so the cancel endpoint can access it
export const activeCrawls = new Map<string, { crawler: SitemapCrawler; controller: AbortController }>();

// Store completed crawl results (cleaned up after 5 minutes)
export const completedCrawls = new Map<string, { result: CrawlResult; timestamp: number }>();

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

    // Start crawl in background (don't await it!)
    crawler
      .crawl()
      .then((pages) => {
        console.info(`Crawled ${pages.length} pages in ${Date.now() - startTime}ms`);

        // Build tree structure
        const tree = buildSitemapTree(pages, body.url);
        const stats = getTreeStats(tree);
        const crawlTime = Date.now() - startTime;

        // Get error information
        const failedUrls = crawler.getFailedUrls();
        const errorSummary = crawler.getErrorSummary();

        // Store completed result
        const result: CrawlResult = {
          rootUrl: body.url,
          pages: pages.map((page) => ({
            url: page.url,
            title: page.title,
            statusCode: page.statusCode,
            links: page.links,
            depth: page.depth,
            parentUrl: page.parentUrl,
            // Enhanced SEO/AI fields
            meta: page.meta,
            headings: page.headings,
            images: page.images,
            linksWithText: page.linksWithText,
            contentMetrics: page.contentMetrics,
          })),
          totalPages: stats.totalPages,
          brokenLinks: stats.brokenLinks,
          crawlTime,
          tree,
          failedUrls,
          errorSummary,
          sessionId,
        };

        completedCrawls.set(sessionId, {
          result,
          timestamp: Date.now(),
        });

        console.info(`Crawl ${sessionId} completed - result stored for retrieval`);
      })
      .catch((error) => {
        console.error(`Crawl ${sessionId} failed:`, error);

        // Store error result
        const errorResult: CrawlResult = {
          rootUrl: body.url,
          pages: [],
          totalPages: 0,
          brokenLinks: 0,
          crawlTime: Date.now() - startTime,
          tree: {
            id: body.url,
            url: body.url,
            title: "Error",
            statusCode: 500,
            status: "server-error",
            isBroken: true,
            nodeType: "page",
            children: [],
            depth: 0,
          },
          failedUrls: [],
          errorSummary: { timeout: 0, redirect: 0, other: 1 },
          sessionId,
          error: error instanceof Error ? error.message : "Unknown error",
        };

        completedCrawls.set(sessionId, {
          result: errorResult,
          timestamp: Date.now(),
        });
      })
      .finally(() => {
        // Clean up after crawl completes or fails
        activeCrawls.delete(sessionId);

        // Schedule cleanup of completed result after 5 minutes
        setTimeout(() => {
          completedCrawls.delete(sessionId);
          console.info(`Cleaned up completed crawl ${sessionId}`);
        }, 5 * 60 * 1000);
      });

    // Return session ID immediately so frontend can cancel
    return NextResponse.json(
      {
        sessionId,
        message: "Crawl started. Poll /api/crawl/[sessionId]/status for progress.",
      },
      { status: 202 } // 202 Accepted
    );
  } catch (error) {
    console.error("Failed to start crawl:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start crawl" },
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
