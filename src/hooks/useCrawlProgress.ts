import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { buildFlowData } from "@/lib/flow/layout-builder";

export function useCrawlProgress() {
  const {
    crawlStatus,
    crawlSessionId,
    setCrawlProgress,
    setCrawlResult,
    setFlowData,
    setCrawlStatus,
    setCrawlError,
  } = useAppStore();

  // Track if we're already fetching results to prevent duplicate fetches
  const isFetchingResults = useRef(false);

  useEffect(() => {
    // Reset the fetching flag when starting a new crawl
    isFetchingResults.current = false;
  }, [crawlSessionId]);

  useEffect(() => {
    if (crawlStatus !== "crawling" || !crawlSessionId) {
      // Clear progress when not crawling
      if (crawlStatus !== "crawling") {
        setCrawlProgress(null);
      }
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/crawl/${crawlSessionId}/progress`);
        if (response.ok) {
          const progress = await response.json();
          setCrawlProgress(progress);

          // Check if crawl is complete - only fetch once
          if (progress.isComplete && !isFetchingResults.current) {
            isFetchingResults.current = true;
            console.info("[Progress Hook] Crawl complete, fetching results...");

            // Stop polling immediately
            clearInterval(interval);

            // Fetch the completed result
            const resultResponse = await fetch(`/api/crawl/${crawlSessionId}/result`);

            if (resultResponse.ok) {
              const result = await resultResponse.json();
              console.info("[Progress Hook] Results fetched successfully");

              setCrawlResult(result);

              // Build flow data from the tree
              const flowData = buildFlowData(result.tree, {
                direction: "TB",
                nodeSpacing: 120,
                rankSpacing: 150,
              });

              setFlowData(flowData.nodes, flowData.edges);
            } else {
              console.error("[Progress Hook] Failed to fetch results");
              setCrawlStatus("error");
              setCrawlError("Failed to retrieve crawl results");
            }
          }
        } else if (response.status === 404) {
          // Crawl session ended without completion (cancelled or expired)
          console.info("[Progress Hook] Crawl session ended (404)");
          clearInterval(interval);
          setCrawlProgress(null);
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      }
    }, 500); // Poll every 500ms for smooth updates

    return () => clearInterval(interval);
  }, [
    crawlStatus,
    crawlSessionId,
    setCrawlProgress,
    setCrawlResult,
    setFlowData,
    setCrawlStatus,
    setCrawlError,
  ]);
}
