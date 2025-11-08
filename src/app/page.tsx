"use client";

import { useCallback } from "react";
import { CrawlForm } from "@/components/CrawlForm";
import { StatusPanel } from "@/components/StatusPanel";
import { SitemapFlow } from "@/components/flow/SitemapFlow";
import { useAppStore } from "@/lib/store";
import { buildFlowData } from "@/lib/flow/layout-builder";
import { CrawlResult } from "@/types/sitemap";
import { AlertCircle, Loader2 } from "lucide-react";

export default function Home() {
  const {
    crawlStatus,
    crawlError,
    crawlResult,
    flowNodes,
    flowEdges,
    selectedNodeId,
    setCrawlStatus,
    setCrawlError,
    setCrawlResult,
    setFlowData,
    setSelectedNode,
  } = useAppStore();

  const handleCrawl = useCallback(
    async (url: string) => {
      setCrawlStatus("crawling");
      setCrawlError(null);

      try {
        const response = await fetch("/api/crawl", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, maxDepth: 10, maxPages: 100 }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to crawl");
        }

        const result: CrawlResult = await response.json();
        setCrawlResult(result);

        // Build flow data from the tree
        const flowData = buildFlowData(result.tree, {
          direction: "TB",
          nodeSpacing: 100,
          rankSpacing: 150,
        });

        setFlowData(flowData.nodes, flowData.edges);
      } catch (error) {
        setCrawlStatus("error");
        setCrawlError(error instanceof Error ? error.message : "Unknown error");
      }
    },
    [setCrawlStatus, setCrawlError, setCrawlResult, setFlowData]
  );

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNode(nodeId);
    },
    [setSelectedNode]
  );

  const selectedNode = selectedNodeId ? flowNodes.find((n) => n.id === selectedNodeId) : undefined;

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">creepr</h1>
            <p className="mt-1 text-sm text-gray-500">Crawl and visualize your app structure</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-96 overflow-y-auto border-r border-gray-200 bg-gray-50 p-6">
          <div className="space-y-6">
            <CrawlForm onSubmit={handleCrawl} isLoading={crawlStatus === "crawling"} />

            {crawlStatus === "error" && crawlError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-red-900">Error</h3>
                    <p className="mt-1 text-sm text-red-700">{crawlError}</p>
                  </div>
                </div>
              </div>
            )}

            {crawlResult && (
              <StatusPanel
                totalPages={crawlResult.totalPages}
                brokenLinks={crawlResult.brokenLinks}
                crawlTime={crawlResult.crawlTime}
                selectedNode={
                  selectedNode
                    ? {
                        title: selectedNode.data.title,
                        url: selectedNode.data.url,
                        statusCode: selectedNode.data.statusCode,
                      }
                    : undefined
                }
              />
            )}
          </div>
        </aside>

        {/* Main visualization area */}
        <main className="relative flex-1">
          {crawlStatus === "idle" && (
            <div className="flex h-full items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="mb-4 text-6xl">🗺️</div>
                <p className="text-lg font-medium">Ready to crawl</p>
                <p className="mt-2 text-sm">Enter a localhost URL to get started</p>
              </div>
            </div>
          )}

          {crawlStatus === "crawling" && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
                <p className="text-lg font-medium text-gray-700">Crawling website...</p>
                <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
              </div>
            </div>
          )}

          {crawlStatus === "completed" && flowNodes.length > 0 && (
            <SitemapFlow nodes={flowNodes} edges={flowEdges} onNodeClick={handleNodeClick} />
          )}

          {crawlStatus === "error" && (
            <div className="flex h-full items-center justify-center text-gray-500">
              <div className="text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                <p className="text-lg font-medium">Crawl failed</p>
                <p className="mt-2 text-sm">Check the error details in the sidebar</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
