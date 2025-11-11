import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function useCrawlProgress() {
  const { crawlStatus, crawlSessionId, setCrawlProgress } = useAppStore();

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
        } else if (response.status === 404) {
          // Crawl session ended, stop polling
          clearInterval(interval);
          setCrawlProgress(null);
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      }
    }, 500); // Poll every 500ms for smooth updates

    return () => clearInterval(interval);
  }, [crawlStatus, crawlSessionId, setCrawlProgress]);
}
