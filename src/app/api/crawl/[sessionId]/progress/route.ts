import { NextRequest, NextResponse } from "next/server";
import { activeCrawls, completedCrawls } from "../../route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const crawlSession = activeCrawls.get(sessionId);

  // Check if crawl is complete
  if (!crawlSession) {
    const completedCrawl = completedCrawls.get(sessionId);

    if (completedCrawl) {
      // Crawl is complete - signal frontend to fetch results
      return NextResponse.json({
        isComplete: true,
        requestsFinished: completedCrawl.result.totalPages,
        requestsTotal: completedCrawl.result.totalPages,
        requestsFailed: completedCrawl.result.failedUrls?.length || 0,
        currentUrl: "",
      });
    }

    return NextResponse.json({ error: "Crawl session not found or expired" }, { status: 404 });
  }

  // Get direct progress counts (more accurate than rate-based stats)
  const progress = crawlSession.crawler.getProgress();
  const stats = crawlSession.crawler.getStats();
  const currentUrl = crawlSession.crawler.getCurrentUrl();

  // Use direct page counts for accurate progress display
  // requestsTotal from Crawlee represents queued requests, which grows as new links are discovered
  // We estimate total based on queued URLs vs actual progress ratio
  const estimatedTotal = stats?.requestsTotal
    ? Math.max(stats.requestsTotal, progress.pagesProcessed + 5) // At least 5 more expected
    : Math.max(progress.pagesQueued, progress.pagesProcessed + 10); // Estimate if no stats

  return NextResponse.json({
    isComplete: false,
    requestsFinished: progress.pagesProcessed,
    requestsTotal: estimatedTotal,
    requestsFailed: progress.pagesFailed,
    crawlerRuntimeMillis: stats?.crawlerRuntimeMillis || 0,
    currentUrl: currentUrl || "",
  });
}
