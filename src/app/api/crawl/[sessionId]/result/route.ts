import { NextRequest, NextResponse } from "next/server";
import { completedCrawls } from "../../route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const completedCrawl = completedCrawls.get(sessionId);

  if (!completedCrawl) {
    return NextResponse.json(
      { error: "Crawl result not found or expired" },
      { status: 404 }
    );
  }

  return NextResponse.json(completedCrawl.result);
}
