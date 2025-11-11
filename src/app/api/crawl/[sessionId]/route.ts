import { NextRequest, NextResponse } from "next/server";

// Import the activeCrawls map from the parent route
// Note: In production, you'd want to use a proper cache like Redis
// This works because Next.js keeps the module in memory
import { activeCrawls } from "../route";

export async function DELETE(
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

  // Stop the crawl using Crawlee's built-in method (immediate cancellation)
  await crawlSession.crawler.stop("Crawl cancelled by user");

  // Also abort the signal as backup
  crawlSession.controller.abort();

  // Remove from active crawls
  activeCrawls.delete(sessionId);

  console.info(`Crawl ${sessionId} cancelled by user`);

  return NextResponse.json({ success: true, message: "Crawl cancelled" });
}
