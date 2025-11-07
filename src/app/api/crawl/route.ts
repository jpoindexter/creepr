import { NextRequest, NextResponse } from 'next/server';
import { SitemapCrawler } from '@/lib/crawler/sitemap-crawler';
import { buildSitemapTree, getTreeStats } from '@/lib/flow/tree-builder';
import { CrawlRequest, CrawlResult } from '@/types/sitemap';
import { isValidUrl } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body: CrawlRequest = await request.json();

    // Validate request
    if (!body.url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(body.url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Default options
    const maxDepth = body.maxDepth ?? 10;
    const maxPages = body.maxPages ?? 100;

    console.log(`Starting crawl for ${body.url}`);
    const startTime = Date.now();

    // Create and run crawler
    const crawler = new SitemapCrawler(body.url, {
      maxDepth,
      maxPages,
      timeout: 30000,
    });

    const pages = await crawler.crawl();

    console.log(`Crawled ${pages.length} pages`);

    // Build tree structure
    const tree = buildSitemapTree(pages, body.url);
    const stats = getTreeStats(tree);

    const crawlTime = Date.now() - startTime;

    // Prepare response
    const result: CrawlResult = {
      rootUrl: body.url,
      pages: pages.map(page => ({
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
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Crawl error:', error);

    return NextResponse.json(
      {
        error: 'Failed to crawl website',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Sitemap crawler API is running',
  });
}
