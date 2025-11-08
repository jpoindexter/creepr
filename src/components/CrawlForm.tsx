"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Loader2, Search } from "lucide-react";

interface CrawlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function CrawlForm({ onSubmit, isLoading }: CrawlFormProps) {
  const [url, setUrl] = useState("http://localhost:3000");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
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
