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

    return NextResponse.json(
      { error: "Crawl session not found or expired" },
      { status: 404 }
    );
  }

  // Get statistics from crawler
  const stats = crawlSession.crawler.getStats();
  const currentUrl = crawlSession.crawler.getCurrentUrl();

  if (!stats) {
    return NextResponse.json({
      isComplete: false,
      requestsFinished: 0,
      requestsTotal: 0,
      requestsFailed: 0,
      currentUrl: currentUrl || "",
    });
  }

  // Crawlee stats object has different property names
  // Calculate finished and failed from available stats
  const requestsFinished = Math.round(
    (stats.requestsFinishedPerMinute * stats.crawlerRuntimeMillis) / 60000
  );

  return NextResponse.json({
    isComplete: false,
    requestsFinished: requestsFinished,
    requestsTotal: stats.requestsTotal,
    requestsFailed: Math.round((stats.requestsFailedPerMinute * stats.crawlerRuntimeMillis) / 60000),
    requestsRetries: 0, // Not directly available
    crawlerRuntimeMillis: stats.crawlerRuntimeMillis,
    currentUrl: currentUrl || "",
  });
}
