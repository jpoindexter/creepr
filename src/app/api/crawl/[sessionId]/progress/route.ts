import { NextRequest, NextResponse } from "next/server";
import { activeCrawls } from "../../route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const crawlSession = activeCrawls.get(sessionId);

  if (!crawlSession) {
    return NextResponse.json(
      { error: "Crawl session not found or already completed" },
      { status: 404 }
    );
  }

  // Get statistics from crawler
  const stats = crawlSession.crawler.getStats();
  const currentUrl = crawlSession.crawler.getCurrentUrl();

  if (!stats) {
    return NextResponse.json({
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
    requestsFinished: requestsFinished,
    requestsTotal: stats.requestsTotal,
    requestsFailed: Math.round((stats.requestsFailedPerMinute * stats.crawlerRuntimeMillis) / 60000),
    requestsRetries: 0, // Not directly available
    crawlerRuntimeMillis: stats.crawlerRuntimeMillis,
    currentUrl: currentUrl || "",
  });
}
