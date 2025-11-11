"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Slider } from "./ui/slider";
import { Loader2, Search, XCircle } from "lucide-react";

export interface CrawlConfig {
  url: string;
  maxDepth: number;
  maxPages: number;
  interactiveMode: boolean;
}

interface CrawlFormProps {
  onSubmit: (config: CrawlConfig) => void;
  onCancel?: () => void;
  isLoading: boolean;
}

export function CrawlForm({ onSubmit, onCancel, isLoading }: CrawlFormProps) {
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
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant={!interactiveMode ? "default" : "outline"}
                onClick={() => setInteractiveMode(false)}
                disabled={isLoading}
                className="w-full"
              >
                📄 Sitemap Mode
              </Button>
              <Button
                type="button"
                variant={interactiveMode ? "default" : "outline"}
                onClick={() => setInteractiveMode(true)}
                disabled={isLoading}
                className="w-full"
              >
                🔍 Interactive Mode
              </Button>
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
            <Slider
              id="maxDepth"
              min={1}
              max={20}
              step={1}
              value={[maxDepth]}
              onValueChange={(value) => setMaxDepth(value[0])}
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
            <Slider
              id="maxPages"
              min={10}
              max={500}
              step={10}
              value={[maxPages]}
              onValueChange={(value) => setMaxPages(value[0])}
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of pages/elements to crawl
            </p>
          </div>

          {!isLoading ? (
            <Button type="submit" disabled={!url.trim()} className="w-full">
              <Search className="h-4 w-4" />
              Start Crawl
            </Button>
          ) : (
            <div className="space-y-2">
              <Button type="button" disabled className="w-full">
                <Loader2 className="h-4 w-4 animate-spin" />
                Crawling...
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onCancel}
                  className="w-full"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Crawl
                </Button>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
