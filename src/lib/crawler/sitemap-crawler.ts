import { PlaywrightCrawler } from "@crawlee/playwright";
import { CrawlerOptions, PageInfo } from "./types";
import { shouldCrawlUrl } from "./link-validator";
import { normalizeUrl } from "../utils";
import { detectInteractiveElements, groupElementsByType } from "./interactive-detector";

export class SitemapCrawler {
  private visitedUrls = new Set<string>();
  private pageInfos: PageInfo[] = [];
  private failedUrls: Array<{ url: string; errorType: string; errorMessage: string; retryCount: number }> = [];
  private baseUrl: string;
  private options: Required<CrawlerOptions>;
  private signal?: AbortSignal;
  private crawler?: PlaywrightCrawler;
  private currentUrl?: string;

  constructor(baseUrl: string, options: CrawlerOptions = {}, signal?: AbortSignal) {
    this.baseUrl = normalizeUrl(baseUrl);
    this.signal = signal;
    this.options = {
      maxDepth: options.maxDepth ?? 10,
      maxPages: options.maxPages ?? 100,
      timeout: options.timeout ?? 30000,
      userAgent: options.userAgent ?? "SitemapCrawler/1.0",
      interactiveMode: options.interactiveMode ?? false,
    };
  }

  async crawl(): Promise<PageInfo[]> {
    this.visitedUrls.clear();
    this.pageInfos = [];
    this.failedUrls = [];

    // Capture instance variables for use in callbacks
    const pageInfos = this.pageInfos;
    const visitedUrls = this.visitedUrls;
    const failedUrls = this.failedUrls;
    const baseUrl = this.baseUrl;
    const options = this.options;
    const signal = this.signal;
    const self = this; // Capture 'this' for currentUrl tracking

    this.crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: options.maxPages,
      maxConcurrency: 15, // Increased from 5 to 15 for much faster crawling
      requestHandlerTimeoutSecs: 10, // Reduced from 30s to 10s per page
      navigationTimeoutSecs: 15, // Increased to 15s for slow pages
      maxRequestRetries: 1, // Only retry once instead of 3 times

      async requestHandler({ request, page, enqueueLinks, log, response }) {
        // Check if crawl was cancelled
        if (signal?.aborted) {
          throw new Error("Crawl cancelled by user");
        }

        const url = normalizeUrl(request.url);

        // Track current URL for progress reporting
        self.currentUrl = url;

        try {
          // Get status code from initial navigation (Crawlee already loaded the page!)
          const statusCode = response?.status() ?? 200;

          // Wait for network idle for Next.js apps (ensures client-side JS loads)
          await page.waitForLoadState("networkidle", {
            timeout: 8000, // 8 second timeout
          });

          // Get page title
          const title = await page.title();

          // Extract links using Playwright (captures JS-rendered links!)
          const linkElements = await page.locator("a[href]").all();
          const links: string[] = [];

          for (const linkElement of linkElements) {
            try {
              const href = await linkElement.getAttribute("href");
              if (href) {
                // Resolve relative URLs
                const absoluteUrl = new URL(href, url);
                // Remove hash fragments
                absoluteUrl.hash = "";
                // Normalize trailing slashes
                let pathname = absoluteUrl.pathname;
                if (pathname.endsWith("/") && pathname.length > 1) {
                  pathname = pathname.slice(0, -1);
                }
                absoluteUrl.pathname = pathname;
                links.push(normalizeUrl(absoluteUrl.toString()));
              }
            } catch {
              // Skip invalid URLs
              continue;
            }
          }

          // Also check for Next.js Link components and buttons with routing
          // Look for data-href, data-url, or role="link" elements
          const extraNavElements = await page
            .locator('[data-href], [data-url], [role="link"], button[data-testid*="nav"]')
            .all();

          for (const element of extraNavElements) {
            try {
              const dataHref =
                (await element.getAttribute("data-href")) ||
                (await element.getAttribute("data-url"));
              if (dataHref) {
                const absoluteUrl = new URL(dataHref, url);
                absoluteUrl.hash = "";
                let pathname = absoluteUrl.pathname;
                if (pathname.endsWith("/") && pathname.length > 1) {
                  pathname = pathname.slice(0, -1);
                }
                absoluteUrl.pathname = pathname;
                links.push(normalizeUrl(absoluteUrl.toString()));
              }
            } catch {
              continue;
            }
          }

          // Remove duplicates (normalize URLs to ensure consistency)
          const uniqueLinks = Array.from(new Set(links.map((link) => normalizeUrl(link))));

          // Store page info
          const pageInfo: PageInfo = {
            url,
            title: title || "Untitled",
            statusCode,
            links: uniqueLinks,
            depth: request.userData.depth ?? 0,
            parentUrl: request.userData.parentUrl,
            nodeType: "page", // This is a real page
          };

          pageInfos.push(pageInfo);
          visitedUrls.add(normalizeUrl(url));

          // Interactive mode: Detect and catalog interactive elements
          if (options.interactiveMode) {
            try {
              log.info(`Detecting interactive elements on ${url}...`);

              const interactiveElements = await detectInteractiveElements(page);
              const grouped = groupElementsByType(interactiveElements);

              // Limit to 50 interactions per page for performance
              const maxInteractions = 50;
              let interactionCount = 0;

              // Process each type of interactive element
              for (const [type, elements] of Object.entries(grouped)) {
                if (interactionCount >= maxInteractions) break;

                for (const element of elements) {
                  if (interactionCount >= maxInteractions) break;
                  if (!element.isClickable) continue;

                  try {
                    // Create a PageInfo for this interactive element
                    const interactiveInfo: PageInfo = {
                      url: `${url}#${type}-${element.label.replace(/\s+/g, "-").toLowerCase()}`,
                      title: element.label,
                      statusCode: 200,
                      links: [],
                      depth: (request.userData.depth ?? 0) + 1,
                      parentUrl: url,
                      nodeType: element.type,
                      interactionType: "click",
                      parentPageUrl: url,
                    };

                    pageInfos.push(interactiveInfo);
                    interactionCount++;

                    log.info(`  Found ${type}: ${element.label}`);
                  } catch (error) {
                    log.error(`Error processing ${type} element:`, { error });
                    continue;
                  }
                }
              }

              log.info(`Found ${interactionCount} interactive elements on ${url}`);
            } catch (error) {
              log.error(`Error detecting interactive elements:`, { error });
            }
          }

          // Enqueue links if within depth limit
          const currentDepth = request.userData.depth ?? 0;
          if (currentDepth < options.maxDepth) {
            for (const link of uniqueLinks) {
              if (shouldCrawlUrl(link, baseUrl, visitedUrls)) {
                await enqueueLinks({
                  urls: [link],
                  userData: {
                    depth: currentDepth + 1,
                    parentUrl: url,
                  },
                });
              }
            }
          }
        } catch (error) {
          log.error(`Error crawling ${url}:`, { error });

          // Still store the page with error info
          pageInfos.push({
            url,
            title: "Error",
            statusCode: 500,
            links: [],
            depth: request.userData.depth ?? 0,
            parentUrl: request.userData.parentUrl,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      },

      failedRequestHandler({ request, log }, error) {
        const url = normalizeUrl(request.url);

        // Track failed URL with error details
        const errorMessage = error.message || "Unknown error";
        let errorType = "other";

        if (errorMessage.includes("timeout") || errorMessage.includes("Navigation timed out")) {
          errorType = "timeout";
        } else if (errorMessage.includes("REDIRECT") || errorMessage.includes("TOO_MANY_REDIRECTS")) {
          errorType = "redirect";
        }

        failedUrls.push({
          url,
          errorType,
          errorMessage: errorMessage.substring(0, 200), // Truncate long messages
          retryCount: request.retryCount || 0,
        });

        // Store failed request as broken page
        pageInfos.push({
          url,
          title: "Failed",
          statusCode: 500,
          links: [],
          depth: request.userData.depth ?? 0,
          parentUrl: request.userData.parentUrl,
          error: errorMessage,
        });
      },
    });

    // Start crawling from the base URL
    await this.crawler.run([
      {
        url: this.baseUrl,
        userData: { depth: 0 },
      },
    ]);

    return this.pageInfos;
  }

  async stop(message?: string): Promise<void> {
    if (this.crawler) {
      await this.crawler.stop(message || "Crawl cancelled by user");
    }
  }

  getCurrentUrl(): string | undefined {
    return this.currentUrl;
  }

  getStats() {
    if (!this.crawler) {
      return null;
    }
    return this.crawler.stats.calculate();
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
    const summary = {
      timeout: 0,
      redirect: 0,
      other: 0,
    };

    this.failedUrls.forEach((failed) => {
      if (failed.errorType === "timeout") {
        summary.timeout++;
      } else if (failed.errorType === "redirect") {
        summary.redirect++;
      } else {
        summary.other++;
      }
    });

    return summary;
  }
}
