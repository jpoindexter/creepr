import { PlaywrightCrawler } from "@crawlee/playwright";
import { CrawlerOptions, PageInfo } from "./types";
import { shouldCrawlUrl } from "./link-validator";
import { normalizeUrl } from "../utils";
import { detectInteractiveElements, groupElementsByType } from "./interactive-detector";

export class SitemapCrawler {
  private visitedUrls = new Set<string>();
  private pageInfos: PageInfo[] = [];
  private baseUrl: string;
  private options: Required<CrawlerOptions>;

  constructor(baseUrl: string, options: CrawlerOptions = {}) {
    this.baseUrl = normalizeUrl(baseUrl);
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

    // Capture instance variables for use in callbacks
    const pageInfos = this.pageInfos;
    const visitedUrls = this.visitedUrls;
    const baseUrl = this.baseUrl;
    const options = this.options;

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: options.maxPages,
      maxConcurrency: 5,
      requestHandlerTimeoutSecs: options.timeout / 1000,

      async requestHandler({ request, page, enqueueLinks, log, response }) {
        const url = normalizeUrl(request.url);

        log.info(`Crawling: ${url}`);

        try {
          // Get status code from initial navigation (Crawlee already loaded the page!)
          const statusCode = response?.status() ?? 200;

          // Wait for client-side JavaScript and network to settle
          await page.waitForLoadState("networkidle", {
            timeout: options.timeout,
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
        log.error(`Request ${request.url} failed:`, { error });

        // Store failed request
        pageInfos.push({
          url: normalizeUrl(request.url),
          title: "Failed",
          statusCode: 500,
          links: [],
          depth: request.userData.depth ?? 0,
          parentUrl: request.userData.parentUrl,
          error: error.message,
        });
      },
    });

    // Start crawling from the base URL
    await crawler.run([
      {
        url: this.baseUrl,
        userData: { depth: 0 },
      },
    ]);

    return this.pageInfos;
  }

  getVisitedUrls(): Set<string> {
    return new Set(Array.from(this.visitedUrls).map(normalizeUrl));
  }

  getPageCount(): number {
    return this.pageInfos.length;
  }
}
