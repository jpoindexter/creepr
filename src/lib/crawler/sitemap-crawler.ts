import { PlaywrightCrawler } from "@crawlee/playwright";
import { CrawlerOptions, PageInfo } from "./types";
import { shouldCrawlUrl, extractLinks } from "./link-validator";
import { normalizeUrl } from "../utils";

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

      async requestHandler({ request, page, enqueueLinks, log }) {
        const url = normalizeUrl(request.url);

        log.info(`Crawling: ${url}`);

        try {
          // Wait for page to load
          await page.waitForLoadState("networkidle", {
            timeout: options.timeout,
          });

          // Get page title
          const title = await page.title();

          // Get page content
          const content = await page.content();

          // Extract links
          const links = extractLinks(content, url);

          // Get status code from response
          const response = await page.goto(url, {
            waitUntil: "networkidle",
            timeout: options.timeout,
          });
          const statusCode = response?.status() ?? 200;

          // Store page info
          const pageInfo: PageInfo = {
            url,
            title: title || "Untitled",
            statusCode,
            links,
            depth: request.userData.depth ?? 0,
            parentUrl: request.userData.parentUrl,
          };

          pageInfos.push(pageInfo);
          visitedUrls.add(normalizeUrl(url));

          // Enqueue links if within depth limit
          const currentDepth = request.userData.depth ?? 0;
          if (currentDepth < options.maxDepth) {
            for (const link of links) {
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
