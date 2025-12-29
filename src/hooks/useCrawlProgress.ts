import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { buildFlowData } from "@/lib/flow/layout-builder";

// Exponential backoff configuration
const BASE_POLL_INTERVAL = 500; // Base polling interval (ms)
const MAX_POLL_INTERVAL = 5000; // Maximum polling interval (ms)
const BACKOFF_MULTIPLIER = 1.5; // Multiply interval by this on each error
const MAX_CONSECUTIVE_ERRORS = 10; // Stop polling after this many consecutive errors

export function useCrawlProgress() {
  const {
    crawlStatus,
    crawlSessionId,
    setCrawlProgress,
    setCrawlResult,
    setFlowData,
    setCrawlStatus,
    setCrawlError,
    setLayoutStatus,
  } = useAppStore();

  // Track if we're already fetching results to prevent duplicate fetches
  const isFetchingResults = useRef(false);
  // Track consecutive errors for exponential backoff
  const consecutiveErrors = useRef(0);
  // Track current poll interval
  const currentInterval = useRef(BASE_POLL_INTERVAL);
  // Track timeout ID for cleanup
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when starting a new crawl
  useEffect(() => {
    isFetchingResults.current = false;
    consecutiveErrors.current = 0;
    currentInterval.current = BASE_POLL_INTERVAL;
  }, [crawlSessionId]);

  // Memoized poll function
  const pollProgress = useCallback(async () => {
    if (crawlStatus !== "crawling" || !crawlSessionId || isFetchingResults.current) {
      return;
    }

    try {
      const response = await fetch(`/api/crawl/${crawlSessionId}/progress`);

      if (response.ok) {
        // Success - reset backoff
        consecutiveErrors.current = 0;
        currentInterval.current = BASE_POLL_INTERVAL;

        const progress = await response.json();
        setCrawlProgress(progress);

        // Check if crawl is complete - only fetch once
        if (progress.isComplete && !isFetchingResults.current) {
          isFetchingResults.current = true;
          console.info("[Progress Hook] Crawl complete, fetching results...");

          // Fetch the completed result
          const resultResponse = await fetch(`/api/crawl/${crawlSessionId}/result`);

          if (resultResponse.ok) {
            const result = await resultResponse.json();
            console.info("[Progress Hook] Results fetched successfully");

            setCrawlResult(result);

            // Build flow data from the tree (show loading indicator)
            setLayoutStatus("calculating");

            // Use setTimeout to allow the UI to update before layout calculation
            setTimeout(() => {
              const flowData = buildFlowData(result.tree, {
                direction: "TB",
                nodeSpacing: 120,
                rankSpacing: 150,
              });

              setFlowData(flowData.nodes, flowData.edges);
              setLayoutStatus("done");
            }, 0);
          } else {
            console.error("[Progress Hook] Failed to fetch results");
            setCrawlStatus("error");
            setCrawlError("Failed to retrieve crawl results");
          }
          return; // Don't schedule another poll
        }
      } else if (response.status === 404) {
        // Crawl session ended without completion (cancelled or expired)
        console.info("[Progress Hook] Crawl session ended (404)");
        setCrawlProgress(null);
        return; // Don't schedule another poll
      } else {
        // Other error - apply backoff
        consecutiveErrors.current++;
        currentInterval.current = Math.min(
          currentInterval.current * BACKOFF_MULTIPLIER,
          MAX_POLL_INTERVAL
        );
        console.warn(
          `[Progress Hook] Error ${response.status}, backing off to ${currentInterval.current}ms (${consecutiveErrors.current} consecutive errors)`
        );
      }
    } catch (error) {
      // Network error - apply backoff
      consecutiveErrors.current++;
      currentInterval.current = Math.min(
        currentInterval.current * BACKOFF_MULTIPLIER,
        MAX_POLL_INTERVAL
      );
      console.error(
        `[Progress Hook] Network error, backing off to ${currentInterval.current}ms:`,
        error
      );
    }

    // Check if we should stop polling due to too many errors
    if (consecutiveErrors.current >= MAX_CONSECUTIVE_ERRORS) {
      console.error(
        `[Progress Hook] Too many consecutive errors (${consecutiveErrors.current}), stopping polling`
      );
      setCrawlStatus("error");
      setCrawlError("Lost connection to server. Please try again.");
      return;
    }

    // Schedule next poll with current interval (exponential backoff)
    if (crawlStatus === "crawling" && !isFetchingResults.current) {
      timeoutId.current = setTimeout(pollProgress, currentInterval.current);
    }
  }, [
    crawlStatus,
    crawlSessionId,
    setCrawlProgress,
    setCrawlResult,
    setFlowData,
    setCrawlStatus,
    setCrawlError,
    setLayoutStatus,
  ]);

  useEffect(() => {
    if (crawlStatus !== "crawling" || !crawlSessionId) {
      // Clear progress when not crawling
      if (crawlStatus !== "crawling") {
        setCrawlProgress(null);
      }
      return;
    }

    // Start polling
    timeoutId.current = setTimeout(pollProgress, BASE_POLL_INTERVAL);

    // Cleanup
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
    };
  }, [crawlStatus, crawlSessionId, setCrawlProgress, pollProgress]);
}
