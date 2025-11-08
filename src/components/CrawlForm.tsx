"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Loader2, Search } from "lucide-react";

export interface CrawlConfig {
  url: string;
  maxDepth: number;
  maxPages: number;
  interactiveMode: boolean;
}

interface CrawlFormProps {
  onSubmit: (config: CrawlConfig) => void;
  isLoading: boolean;
}

export function CrawlForm({ onSubmit, isLoading }: CrawlFormProps) {
  const [url, setUrl] = useState("http://localhost:3000");
  const [maxDepth, setMaxDepth] = useState(10);
  const [maxPages, setMaxPages] = useState(100);
  const [interactiveMode, setInteractiveMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit({
        url: url.trim(),
        maxDepth,
        maxPages,
        interactiveMode,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sitemap Crawler</CardTitle>
        <CardDescription>
          Enter a localhost URL to crawl and visualize its structure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              Localhost URL
            </label>
            <Input
              id="url"
              type="text"
              placeholder="http://localhost:3000"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Make sure your local development server is running
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Crawl Mode</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInteractiveMode(false)}
                disabled={isLoading}
                className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                  !interactiveMode
                    ? "border-purple-500 bg-purple-50 text-purple-900"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                📄 Sitemap Mode
              </button>
              <button
                type="button"
                onClick={() => setInteractiveMode(true)}
                disabled={isLoading}
                className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                  interactiveMode
                    ? "border-purple-500 bg-purple-50 text-purple-900"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                🔍 Interactive Mode
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {interactiveMode
                ? "Detects tabs, modals, accordions, and other UI elements"
                : "Only crawls URL-addressable pages (standard sitemap)"}
            </p>
          </div>

          {/* Max Depth */}
          <div className="space-y-2">
            <label htmlFor="maxDepth" className="text-sm font-medium">
              Max Depth: {maxDepth}
            </label>
            <input
              id="maxDepth"
              type="range"
              min="1"
              max="20"
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Maximum hierarchy depth to crawl</p>
          </div>

          {/* Max Pages */}
          <div className="space-y-2">
            <label htmlFor="maxPages" className="text-sm font-medium">
              Max Pages: {maxPages}
            </label>
            <input
              id="maxPages"
              type="range"
              min="10"
              max="500"
              step="10"
              value={maxPages}
              onChange={(e) => setMaxPages(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of pages/elements to crawl
            </p>
          </div>

          <Button type="submit" disabled={isLoading || !url.trim()} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Crawling...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Start Crawl
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
