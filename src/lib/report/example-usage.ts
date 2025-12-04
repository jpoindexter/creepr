/**
 * Example usage of the markdown report generator
 *
 * This file demonstrates how to use the markdown-generator to create
 * comprehensive 404 audit reports.
 */

import { generateMarkdownReport, ReportData, SourceLink } from './markdown-generator';
import { PageInfo } from '../crawler/types';

/**
 * Example: Generate a markdown report from crawl results
 */
export function exampleGenerateReport() {
  // Sample crawl results with broken URLs
  const crawlResults: PageInfo[] = [
    {
      url: 'https://example.com/',
      title: 'Home Page',
      statusCode: 200,
      links: ['https://example.com/about', 'https://example.com/old/docs'],
      depth: 0,
    },
    {
      url: 'https://example.com/about',
      title: 'About Us',
      statusCode: 200,
      links: ['https://example.com/', 'https://example.com/contact'],
      depth: 1,
      parentUrl: 'https://example.com/',
    },
    {
      url: 'https://example.com/old/docs',
      title: '',
      statusCode: 404,
      links: [],
      depth: 1,
      parentUrl: 'https://example.com/',
      error: 'Page not found',
    },
    {
      url: 'https://example.com/old/docs/advanced',
      title: '',
      statusCode: 404,
      links: [],
      depth: 2,
      parentUrl: 'https://example.com/old/docs',
      error: 'Page not found',
    },
    {
      url: 'https://example.com/api/users/12345',
      title: '',
      statusCode: 404,
      links: [],
      depth: 1,
      parentUrl: 'https://example.com/',
      error: 'Resource not found',
    },
    {
      url: 'https://example.com/products',
      title: '',
      statusCode: 500,
      links: [],
      depth: 1,
      parentUrl: 'https://example.com/',
      error: 'Internal server error',
    },
  ];

  // Sample source links (where broken URLs are referenced from)
  const sourceLinks: SourceLink[] = [
    {
      brokenUrl: 'https://example.com/old/docs',
      referrerUrl: 'https://example.com/',
      referrerTitle: 'Home Page',
    },
    {
      brokenUrl: 'https://example.com/old/docs/advanced',
      referrerUrl: 'https://example.com/old/docs',
      referrerTitle: 'Old Documentation',
    },
    {
      brokenUrl: 'https://example.com/old/docs/advanced',
      referrerUrl: 'https://example.com/about',
      referrerTitle: 'About Us',
    },
    {
      brokenUrl: 'https://example.com/api/users/12345',
      referrerUrl: 'https://example.com/',
      referrerTitle: 'Home Page',
    },
    {
      brokenUrl: 'https://example.com/products',
      referrerUrl: 'https://example.com/',
      referrerTitle: 'Home Page',
    },
  ];

  // Prepare report data
  const reportData: ReportData = {
    crawlResults,
    sourceLinks,
    baseUrl: 'https://example.com',
    timestamp: new Date(),
    crawlDuration: 45000, // 45 seconds in milliseconds
  };

  // Generate markdown report
  const markdownReport = generateMarkdownReport(reportData);

  // Output or save the report
  console.log(markdownReport);

  return markdownReport;
}

/**
 * Example: Integration with crawl API
 *
 * This shows how you might integrate the report generator with your crawl API
 */
export async function exampleApiIntegration() {
  // In your API route (e.g., app/api/crawl/[sessionId]/report/route.ts):

  /*
  import { generateMarkdownReport, ReportData } from '@/lib/report/markdown-generator';

  export async function GET(
    request: Request,
    { params }: { params: { sessionId: string } }
  ) {
    // Fetch crawl results from your store
    const crawlResult = getCrawlResult(params.sessionId);

    if (!crawlResult) {
      return NextResponse.json(
        { error: 'Crawl result not found' },
        { status: 404 }
      );
    }

    // Build source links from crawl data
    const sourceLinks = buildSourceLinks(crawlResult.pages);

    // Prepare report data
    const reportData: ReportData = {
      crawlResults: crawlResult.pages,
      sourceLinks,
      baseUrl: crawlResult.rootUrl,
      timestamp: new Date(crawlResult.timestamp),
      crawlDuration: crawlResult.crawlTime,
    };

    // Generate markdown report
    const markdown = generateMarkdownReport(reportData);

    // Return as downloadable file or display
    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="404-audit-${params.sessionId}.md"`,
      },
    });
  }
  */
}

/**
 * Helper: Build source links from page data
 */
function buildSourceLinks(pages: PageInfo[]): SourceLink[] {
  const sourceLinks: SourceLink[] = [];

  // For each page, check its links and create source references
  pages.forEach((page) => {
    // Only consider pages that loaded successfully
    if (page.statusCode >= 200 && page.statusCode < 400) {
      page.links.forEach((link) => {
        // Find if this link points to a broken page
        const linkedPage = pages.find((p) => p.url === link);
        if (linkedPage && linkedPage.statusCode >= 400) {
          sourceLinks.push({
            brokenUrl: link,
            referrerUrl: page.url,
            referrerTitle: page.title || 'Untitled',
          });
        }
      });
    }
  });

  return sourceLinks;
}

/**
 * Example output structure:
 *
 * # 404 Audit Report
 *
 * **Website**: https://example.com
 * **Generated**: November 11, 2025, 5:30 PM EST
 * **Crawl Duration**: 45s
 *
 * ---
 *
 * ## Executive Summary
 *
 * 🟠 **Health Score**: 33/100
 *
 * ### Overview
 * - **Total Pages Crawled**: 6
 * - **Broken URLs Found**: 4 (66.7% error rate)
 * - **Client Errors (4xx)**: 3
 * - **Server Errors (5xx)**: 1
 * - **Timeouts**: 0
 *
 * ---
 *
 * ## Broken URLs by Category
 *
 * ### 1. /old/* (2 URLs)
 * **Severity**: 🟢 LOW
 *
 * **Affected URLs**:
 * - https://example.com/old/docs
 * - https://example.com/old/docs/advanced
 *
 * ---
 *
 * ## Broken URLs by Error Type
 *
 * ### 404 Not Found (3 URLs)
 * - https://example.com/old/docs
 * - https://example.com/old/docs/advanced
 * - https://example.com/api/users/12345
 *
 * ### 500 Internal Server Error (1 URLs)
 * - https://example.com/products
 *
 * ---
 *
 * ## Pattern Analysis
 *
 * ### Pattern 1: Old/Archive Category Structure
 * **Frequency**: 2 occurrences
 * **Root Cause**: URLs reference deprecated category paths that were restructured
 *
 * ---
 *
 * ## Fix Recommendations
 *
 * ### Priority Actions
 *
 * #### 1. Fix Server Errors 🔴 CRITICAL
 * **Action**: Investigate and resolve server-side errors causing 5xx responses
 * **Affected URLs**: 1
 * **Estimated Effort**: 1 hours (debugging & fixes)
 *
 * #### 2. Implement 301 Redirects 🟡 MEDIUM
 * **Action**: Create redirect rules mapping old URLs to new locations
 * **Affected URLs**: 3
 * **Estimated Effort**: 1 hours (bulk redirect setup)
 *
 * ---
 *
 * ## Source References
 *
 * ### https://example.com/old/docs
 * Referenced by 1 page(s):
 * - [Home Page](https://example.com/)
 *
 * ---
 *
 * ## Appendix: Full URL List
 *
 * | # | URL | Status | Error |
 * |---|-----|--------|-------|
 * | 1 | https://example.com/old/docs | 404 | Page not found |
 * | 2 | https://example.com/old/docs/advanced | 404 | Page not found |
 * | 3 | https://example.com/api/users/12345 | 404 | Resource not found |
 * | 4 | https://example.com/products | 500 | Internal server error |
 */
