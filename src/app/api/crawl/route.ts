import { NextRequest, NextResponse } from "next/server";
import { SitemapCrawler } from "@/lib/crawler/sitemap-crawler";
import { buildSitemapTree, getTreeStats } from "@/lib/flow/tree-builder";
import { CrawlResult } from "@/types/sitemap";
import { isValidUrl } from "@/lib/utils";
import { randomUUID } from "crypto";
import { z } from "zod";

// Route segment config - set max duration for this API route
// The actual crawl runs in background but we need time for initial setup
export const maxDuration = 60; // seconds

// Zod schema for crawl request validation with bounds checking
const CrawlRequestSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .refine((url) => isValidUrl(url), {
      message: "Invalid URL format. Must be a valid HTTP or HTTPS URL.",
    }),
  maxDepth: z
    .number()
    .int("maxDepth must be an integer")
    .min(1, "maxDepth must be at least 1")
    .max(20, "maxDepth cannot exceed 20")
    .optional()
    .default(10),
  maxPages: z
    .number()
    .int("maxPages must be an integer")
    .min(1, "maxPages must be at least 1")
    .max(500, "maxPages cannot exceed 500")
    .optional()
    .default(100),
  interactiveMode: z.boolean().optional().default(false),
});

// Configuration for memory management
const MAX_COMPLETED_CRAWLS = 50; // Maximum number of completed crawls to store
const MAX_ACTIVE_CRAWLS = 10; // Maximum concurrent crawls
const CLEANUP_INTERVAL_MS = 60 * 1000; // Run cleanup every minute
const RESULT_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL for completed results

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 requests per minute per IP

// Simple in-memory rate limiter per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Check if a request should be rate limited
 * @returns true if the request should be blocked
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // New window - reset the counter
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  // Increment counter
  record.count++;
  return false;
}

/**
 * Get remaining rate limit allowance for an IP
 */
function getRateLimitInfo(ip: string): { remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    return { remaining: RATE_LIMIT_MAX_REQUESTS, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  return {
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count),
    resetIn: Math.max(0, record.resetTime - now),
  };
}

// Store active crawlers with their abort controllers
// Exported so the cancel endpoint can access it
export const activeCrawls = new Map<
  string,
  { crawler: SitemapCrawler; controller: AbortController }
>();

// Store completed crawl results with timestamps
export const completedCrawls = new Map<string, { result: CrawlResult; timestamp: number }>();

/**
 * Clean up stale entries from the maps to prevent memory leaks
 */
function cleanupStaleCrawls(): void {
  const now = Date.now();

  // Clean up old completed crawls
  for (const [sessionId, { timestamp }] of completedCrawls) {
    if (now - timestamp > RESULT_TTL_MS) {
      completedCrawls.delete(sessionId);
      console.info(`[Cleanup] Removed stale completed crawl: ${sessionId}`);
    }
  }

  // Enforce maximum completed crawls limit (FIFO)
  if (completedCrawls.size > MAX_COMPLETED_CRAWLS) {
    // Convert to array, sort by timestamp, and remove oldest
    const entries = Array.from(completedCrawls.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );

    const toRemove = entries.slice(0, completedCrawls.size - MAX_COMPLETED_CRAWLS);
    for (const [sessionId] of toRemove) {
      completedCrawls.delete(sessionId);
      console.info(`[Cleanup] Removed oldest crawl to enforce limit: ${sessionId}`);
    }
  }

  // Clean up expired rate limit entries
  for (const [ip, { resetTime }] of rateLimitMap) {
    if (now > resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

// Start periodic cleanup (only on first import, using closure to track)
let cleanupIntervalId: ReturnType<typeof setInterval> | null = null;
if (!cleanupIntervalId && typeof setInterval !== "undefined") {
  cleanupIntervalId = setInterval(cleanupStaleCrawls, CLEANUP_INTERVAL_MS);
  // Don't keep the process alive for cleanup
  if (cleanupIntervalId.unref) {
    cleanupIntervalId.unref();
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

    // Check IP-based rate limit
    if (isRateLimited(clientIp)) {
      const { resetIn } = getRateLimitInfo(clientIp);
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfterMs: resetIn,
          retryAfterSec: Math.ceil(resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(resetIn / 1000)),
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Date.now() + resetIn),
          },
        }
      );
    }

    // Check concurrent crawl limit
    if (activeCrawls.size >= MAX_ACTIVE_CRAWLS) {
      return NextResponse.json(
        {
          error: "Too many concurrent crawls. Please wait for existing crawls to complete.",
          activeCrawls: activeCrawls.size,
          maxCrawls: MAX_ACTIVE_CRAWLS,
        },
        { status: 429 }
      );
    }

    const rawBody = await request.json();

    // Validate request with Zod schema
    const validationResult = CrawlRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return NextResponse.json(
        {
          error: "Validation failed",
          details: errors,
        },
        { status: 400 }
      );
    }

    const { url, maxDepth, maxPages, interactiveMode } = validationResult.data;

    // Generate session ID for this crawl
    const sessionId = randomUUID();

    console.info(
      `Starting crawl ${sessionId} for ${url} (${interactiveMode ? "Interactive Mode" : "Sitemap Mode"})`
    );
    const startTime = Date.now();

    // Create abort controller for this crawl
    const controller = new AbortController();

    // Create and run crawler with abort signal
    const crawler = new SitemapCrawler(
      url,
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
        const tree = buildSitemapTree(pages, url);
        const stats = getTreeStats(tree);
        const crawlTime = Date.now() - startTime;

        // Get error information
        const failedUrls = crawler.getFailedUrls();
        const errorSummary = crawler.getErrorSummary();

        // Store completed result
        const result: CrawlResult = {
          rootUrl: url,
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
            // Full style extraction for design system analysis
            styles: page.styles,
            // API endpoint detection
            isApiEndpoint: page.isApiEndpoint,
            contentType: page.contentType,
            // Security headers analysis
            securityHeaders: page.securityHeaders,
            // Keyword density analysis
            keywordDensity: page.keywordDensity,
            // Mobile responsiveness analysis
            mobileResponsiveness: page.mobileResponsiveness,
          })),
          totalPages: stats.totalPages,
          brokenLinks: stats.brokenLinks,
          apiEndpoints: stats.apiEndpoints,
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
          rootUrl: url,
          pages: [],
          totalPages: 0,
          brokenLinks: 0,
          apiEndpoints: 0,
          crawlTime: Date.now() - startTime,
          tree: {
            id: url,
            url: url,
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
        // Clean up active crawl entry - completed results are cleaned up by periodic cleanup
        activeCrawls.delete(sessionId);
        console.info(`Crawl ${sessionId} finished and removed from active crawls`);
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
