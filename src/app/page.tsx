'use client';

import { useCallback, useEffect, useState } from 'react';
import { CrawlForm } from '@/components/CrawlForm';
import { StatusPanel } from '@/components/StatusPanel';
import { SitemapFlow } from '@/components/flow/SitemapFlow';
import { useAppStore } from '@/lib/store';
import { buildFlowData } from '@/lib/flow/layout-builder';
import { CrawlResult } from '@/types/sitemap';
import { AlertCircle, Loader2 } from 'lucide-react';

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
      setCrawlStatus('crawling');
      setCrawlError(null);

      try {
        const response = await fetch('/api/crawl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, maxDepth: 10, maxPages: 100 }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to crawl');
        }

        const result: CrawlResult = await response.json();
        setCrawlResult(result);

        // Build flow data from the tree
        const flowData = buildFlowData(result.tree, {
          direction: 'TB',
          nodeSpacing: 100,
          rankSpacing: 150,
        });

        setFlowData(flowData.nodes, flowData.edges);
      } catch (error) {
        setCrawlStatus('error');
        setCrawlError(error instanceof Error ? error.message : 'Unknown error');
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

  const selectedNode = selectedNodeId
    ? flowNodes.find((n) => n.id === selectedNodeId)
    : undefined;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              creepr
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Crawl and visualize your app structure
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-96 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            <CrawlForm
              onSubmit={handleCrawl}
              isLoading={crawlStatus === 'crawling'}
            />

            {crawlStatus === 'error' && crawlError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{crawlError}</p>
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
        <main className="flex-1 relative">
          {crawlStatus === 'idle' && (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-lg font-medium">Ready to crawl</p>
                <p className="text-sm mt-2">Enter a localhost URL to get started</p>
              </div>
            </div>
          )}

          {crawlStatus === 'crawling' && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  Crawling website...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few moments
                </p>
              </div>
            </div>
          )}

          {crawlStatus === 'completed' && flowNodes.length > 0 && (
            <SitemapFlow
              nodes={flowNodes}
              edges={flowEdges}
              onNodeClick={handleNodeClick}
            />
          )}

          {crawlStatus === 'error' && (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Crawl failed</p>
                <p className="text-sm mt-2">Check the error details in the sidebar</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
