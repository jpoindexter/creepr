import { PlaywrightCrawler, Configuration, RequestQueue } from "@crawlee/playwright";
import { CrawlerOptions, PageInfo } from "./types";
import { shouldCrawlUrl, isApiEndpoint } from "./link-validator";
import { analyzeSecurityHeaders } from "./security-analyzer";
import { analyzePageKeywords } from "./keyword-analyzer";
import { analyzeMobileResponsiveness } from "./mobile-analyzer";
import { normalizeUrl } from "../utils";
import { detectInteractiveElements, groupElementsByType } from "./interactive-detector";
import { extractAllPageData } from "./page-extractors";
import { extractPageStyles } from "./style-extractor";
import { randomUUID } from "crypto";
import { rm } from "fs/promises";
import { Page } from "playwright";

export class SitemapCrawler {
  private visitedUrls = new Set<string>();
  private pageInfos: PageInfo[] = [];
  private failedUrls: Array<{
    url: string;
    errorType: string;
    errorMessage: string;
    retryCount: number;
  }> = [];
  private baseUrl: string;
  private options: Required<CrawlerOptions>;
  private signal?: AbortSignal;
  private crawler?: PlaywrightCrawler;
  private currentUrl?: string;

  constructor(baseUrl: string, options: CrawlerOptions = {}, signal?: AbortSignal) {
    this.baseUrl = normalizeUrl(baseUrl);
    this.signal = signal;
    this.options = {
      maxDepth: options.maxDepth ?? 15,
      maxPages: options.maxPages ?? 2000,
      timeout: options.timeout ?? 45000,
      userAgent: options.userAgent ?? "SitemapCrawler/1.0",
      interactiveMode: options.interactiveMode ?? false,
    };
  }

  async crawl(): Promise<PageInfo[]> {
    this.visitedUrls.clear();
    this.pageInfos = [];
    this.failedUrls = [];

    const pageInfos = this.pageInfos;
    const visitedUrls = this.visitedUrls;
    const failedUrls = this.failedUrls;
    const baseUrl = this.baseUrl;
    const options = this.options;
    const signal = this.signal;
    const self = this;

    const crawlId = randomUUID();
    const storageDir = `/tmp/creepr-crawl-${crawlId}`;

    const config = new Configuration({
      storageClientOptions: { localDataDirectory: storageDir },
      persistStorage: false,
    });

    const requestQueue = await RequestQueue.open(undefined, { config });

    this.crawler = new PlaywrightCrawler({
      requestQueue,
      maxRequestsPerCrawl: options.maxPages,
      maxConcurrency: 15,
      requestHandlerTimeoutSecs: 10,
      navigationTimeoutSecs: 15,
      maxRequestRetries: 1,

      async requestHandler({ request, page, enqueueLinks, log, response }) {
        if (signal?.aborted) throw new Error("Crawl cancelled by user");

        const url = normalizeUrl(request.url);
        self.currentUrl = url;

        try {
          const statusCode = response?.status() ?? 200;
          const contentType = response?.headers()?.["content-type"] ?? undefined;
          const isRedirect = request.loadedUrl !== request.url;
          if (isRedirect && response) {
            log.info(`Redirect detected: ${request.url} → ${request.loadedUrl} (${statusCode})`);
          }

          // Detect if this is an API endpoint
          const apiEndpoint = isApiEndpoint(url, contentType);
          if (apiEndpoint) {
            log.info(`API endpoint detected: ${url} (${contentType || "no content-type"})`);
          }

          // Analyze security headers
          const responseHeaders = response?.headers() ?? null;
          const securityHeaders = analyzeSecurityHeaders(responseHeaders);

          await page.waitForLoadState("networkidle", { timeout: 15000 });

          const title = await page.title();
          const [pageData, styles, keywordDensity, mobileResponsiveness] = await Promise.all([
            extractAllPageData(page, url),
            extractPageStyles(page),
            analyzePageKeywords(page),
            analyzeMobileResponsiveness(page),
          ]);
          const { links, linksWithText, meta, headings, images, contentMetrics } = pageData;

          const pageInfo: PageInfo = {
            url,
            title: title || "Untitled",
            statusCode,
            links,
            depth: request.userData.depth ?? 0,
            parentUrl: request.userData.parentUrl,
            nodeType: apiEndpoint ? "api" : "page",
            meta,
            headings,
            images,
            linksWithText,
            contentMetrics,
            styles,
            isApiEndpoint: apiEndpoint,
            contentType,
            securityHeaders,
            keywordDensity,
            mobileResponsiveness,
          };

          pageInfos.push(pageInfo);
          visitedUrls.add(normalizeUrl(url));

          if (options.interactiveMode) {
            await processInteractiveElements(page, url, request, pageInfos, log);
          }

          const currentDepth = request.userData.depth ?? 0;
          if (currentDepth < options.maxDepth) {
            for (const link of links) {
              if (shouldCrawlUrl(link, baseUrl, visitedUrls)) {
                await enqueueLinks({
                  urls: [link],
                  userData: { depth: currentDepth + 1, parentUrl: url },
                });
              }
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          log.error(`Error crawling ${url}:`, { error: errorMessage });
          const errorStatusCode = getErrorStatusCode(errorMessage);

          pageInfos.push({
            url,
            title: "Error",
            statusCode: errorStatusCode,
            links: [],
            depth: request.userData.depth ?? 0,
            parentUrl: request.userData.parentUrl,
            error: errorMessage,
          });
        }
      },

      failedRequestHandler({ request }, error) {
        const url = normalizeUrl(request.url);
        const errorMessage = error.message || "Unknown error";
        const errorType = getErrorType(errorMessage);
        const statusCode = getErrorStatusCode(errorMessage);

        failedUrls.push({
          url,
          errorType,
          errorMessage: errorMessage.substring(0, 200),
          retryCount: request.retryCount || 0,
        });

        pageInfos.push({
          url,
          title: "Failed",
          statusCode,
          links: [],
          depth: request.userData.depth ?? 0,
          parentUrl: request.userData.parentUrl,
          error: errorMessage,
        });
      },
    });

    await this.crawler.run([{ url: this.baseUrl, userData: { depth: 0 } }]);

    try {
      await rm(storageDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }

    return this.pageInfos;
  }

  async stop(message?: string): Promise<void> {
    if (this.crawler) await this.crawler.stop(message || "Crawl cancelled by user");
  }

  getCurrentUrl(): string | undefined {
    return this.currentUrl;
  }

  getStats() {
    return this.crawler?.stats.calculate() ?? null;
  }

  /**
   * Get direct progress counts (more accurate than rate-based Crawlee stats)
   */
  getProgress(): { pagesProcessed: number; pagesQueued: number; pagesFailed: number } {
    return {
      pagesProcessed: this.pageInfos.length,
      pagesQueued: this.visitedUrls.size,
      pagesFailed: this.failedUrls.length,
    };
  }

  getVisitedUrls(): Set<string> {
    return new Set(Array.from(this.visitedUrls).map(normalizeUrl));
  }

  getPageCount(): number {
    return this.pageInfos.length;
  }

  getFailedUrls() {
    return this.failedUrls;
  }

  getErrorSummary() {
    const summary = { timeout: 0, redirect: 0, other: 0 };
    this.failedUrls.forEach((failed) => {
      if (failed.errorType === "timeout") summary.timeout++;
      else if (failed.errorType === "redirect") summary.redirect++;
      else summary.other++;
    });
    return summary;
  }
}

function getErrorStatusCode(errorMessage: string): number {
  if (errorMessage.includes("timeout") || errorMessage.includes("Navigation timed out")) return 408;
  if (errorMessage.includes("ERR_TOO_MANY_REDIRECTS")) return 310;
  if (errorMessage.includes("net::ERR_")) return 502;
  if (errorMessage.includes("404")) return 404;
  return 500;
}

function getErrorType(errorMessage: string): string {
  if (errorMessage.includes("timeout") || errorMessage.includes("Navigation timed out"))
    return "timeout";
  if (errorMessage.includes("REDIRECT") || errorMessage.includes("TOO_MANY_REDIRECTS"))
    return "redirect";
  if (errorMessage.includes("404") || errorMessage.includes("Not Found")) return "not-found";
  if (errorMessage.includes("net::ERR_")) return "network";
  return "other";
}

async function processInteractiveElements(
  page: Page,
  url: string,
  request: { userData: { depth?: number } },
  pageInfos: PageInfo[],
  log: { info: (msg: string) => void; error: (msg: string, ctx?: object) => void }
) {
  try {
    log.info(`Detecting interactive elements on ${url}...`);
    const interactiveElements = await detectInteractiveElements(page);
    const grouped = groupElementsByType(interactiveElements);

    const maxInteractions = 50;
    let interactionCount = 0;

    for (const [type, elements] of Object.entries(grouped)) {
      if (interactionCount >= maxInteractions) break;
      for (const element of elements) {
        if (interactionCount >= maxInteractions) break;
        if (!element.isClickable) continue;

        pageInfos.push({
          url: `${url}#${type}-${element.label.replace(/\s+/g, "-").toLowerCase()}`,
          title: element.label,
          statusCode: 200,
          links: [],
          depth: (request.userData.depth ?? 0) + 1,
          parentUrl: url,
          nodeType: element.type,
          interactionType: "click",
          parentPageUrl: url,
        });
        interactionCount++;
        log.info(`  Found ${type}: ${element.label}`);
      }
    }
    log.info(`Found ${interactionCount} interactive elements on ${url}`);
  } catch (error) {
    log.error(`Error detecting interactive elements:`, { error });
  }
}
