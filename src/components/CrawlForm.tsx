"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Slider } from "./ui/slider";
import { Loader2, Search, XCircle, Globe, AlertCircle, CheckCircle2 } from "lucide-react";

export interface CrawlConfig {
  url: string;
  maxDepth: number;
  maxPages: number;
  interactiveMode: boolean;
  userAgent?: string;
}

interface CrawlFormProps {
  onSubmit: (config: CrawlConfig) => void;
  onCancel?: () => void;
  isLoading: boolean;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Real-time URL validation
 * Validates URL format, protocol, and provides warnings for non-localhost URLs
 */
function validateUrl(url: string): ValidationResult {
  const trimmedUrl = url.trim();

  // Empty URL
  if (!trimmedUrl) {
    return { isValid: false, error: "URL is required" };
  }

  // Check for valid URL format
  try {
    const parsed = new URL(trimmedUrl);

    // Check protocol
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        isValid: false,
        error: "URL must use http:// or https:// protocol",
      };
    }

    // Check for localhost - warn but allow other hosts
    const isLocalhost =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname.endsWith(".local") ||
      parsed.hostname.startsWith("192.168.") ||
      parsed.hostname.startsWith("10.");

    if (!isLocalhost) {
      return {
        isValid: true,
        warning: "This app is designed for localhost. External URLs may have restrictions.",
      };
    }

    return { isValid: true };
  } catch {
    // Check for common issues
    if (!trimmedUrl.includes("://")) {
      return {
        isValid: false,
        error: "Missing protocol. Try http://localhost:3000",
      };
    }

    if (trimmedUrl.includes(" ")) {
      return {
        isValid: false,
        error: "URL cannot contain spaces",
      };
    }

    return {
      isValid: false,
      error: "Invalid URL format",
    };
  }
}

export function CrawlForm({ onSubmit, onCancel, isLoading }: CrawlFormProps) {
  const [url, setUrl] = useState("http://localhost:3000");
  const [maxDepth, setMaxDepth] = useState(10);
  const [maxPages, setMaxPages] = useState(100);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [userAgent, setUserAgent] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [touched, setTouched] = useState(false);

  // Real-time validation
  const validation = useMemo(() => validateUrl(url), [url]);

  // Show validation feedback only after user has interacted
  const showValidation = touched || url !== "http://localhost:3000";

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(e.target.value);
      if (!touched) setTouched(true);
    },
    [touched]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (validation.isValid && url.trim()) {
      onSubmit({
        url: url.trim(),
        maxDepth,
        maxPages,
        interactiveMode,
        userAgent: userAgent.trim() || undefined,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader title="SITEMAP_CRAWLER" icon={<Globe className="h-4 w-4" />} />
      <CardContent>
        <p className="text-muted-foreground mb-4 text-sm">
          Enter a localhost URL to crawl and visualize its structure
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input with real-time validation */}
          <div className="space-y-2">
            <label htmlFor="url" className="text-xs font-medium tracking-wide uppercase">
              Localhost URL
            </label>
            <div className="relative">
              <Input
                id="url"
                type="url"
                placeholder="http://localhost:3000"
                value={url}
                onChange={handleUrlChange}
                onBlur={() => setTouched(true)}
                disabled={isLoading}
                className={`pr-10 font-mono ${
                  showValidation && validation.error
                    ? "border-destructive focus-visible:ring-destructive"
                    : showValidation && validation.warning
                      ? "border-warning focus-visible:ring-warning"
                      : showValidation && validation.isValid
                        ? "border-success focus-visible:ring-success"
                        : ""
                }`}
                aria-describedby={`url-help ${showValidation && validation.error ? "url-error" : ""} ${showValidation && validation.warning ? "url-warning" : ""}`}
                aria-required="true"
                aria-invalid={showValidation && !!validation.error}
              />
              {/* Validation icon */}
              {showValidation && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  {validation.error ? (
                    <AlertCircle className="text-destructive h-4 w-4" aria-hidden="true" />
                  ) : validation.warning ? (
                    <AlertCircle className="text-warning h-4 w-4" aria-hidden="true" />
                  ) : validation.isValid ? (
                    <CheckCircle2 className="text-success h-4 w-4" aria-hidden="true" />
                  ) : null}
                </div>
              )}
            </div>

            {/* Validation messages */}
            {showValidation && validation.error && (
              <p
                id="url-error"
                className="text-destructive flex items-center gap-1 text-xs"
                role="alert"
              >
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {validation.error}
              </p>
            )}
            {showValidation && validation.warning && !validation.error && (
              <p
                id="url-warning"
                className="text-warning flex items-center gap-1 text-xs"
                role="status"
              >
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {validation.warning}
              </p>
            )}

            <p id="url-help" className="text-muted-foreground text-xs">
              Make sure your local development server is running
            </p>
          </div>

          {/* Mode Toggle */}
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium tracking-wide uppercase">Crawl Mode</legend>
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Select crawl mode">
              <Button
                type="button"
                variant={!interactiveMode ? "default" : "outline"}
                onClick={() => setInteractiveMode(false)}
                disabled={isLoading}
                className="w-full"
                aria-pressed={!interactiveMode}
                aria-label="Sitemap Mode - Only crawls URL-addressable pages"
              >
                📄 Sitemap Mode
              </Button>
              <Button
                type="button"
                variant={interactiveMode ? "default" : "outline"}
                onClick={() => setInteractiveMode(true)}
                disabled={isLoading}
                className="w-full"
                aria-pressed={interactiveMode}
                aria-label="Interactive Mode - Detects tabs, modals, accordions"
              >
                🔍 Interactive Mode
              </Button>
            </div>
            <p id="mode-help" className="text-muted-foreground text-xs" aria-live="polite">
              {interactiveMode
                ? "Detects tabs, modals, accordions, and other UI elements"
                : "Only crawls URL-addressable pages (standard sitemap)"}
            </p>
          </fieldset>

          {/* Max Depth */}
          <div className="space-y-2">
            <label htmlFor="maxDepth" className="text-xs font-medium tracking-wide uppercase">
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
              aria-label={`Maximum crawl depth: ${maxDepth} levels`}
              aria-valuemin={1}
              aria-valuemax={20}
              aria-valuenow={maxDepth}
              aria-valuetext={`${maxDepth} levels deep`}
            />
            <p id="depth-help" className="text-muted-foreground text-xs">
              Maximum hierarchy depth to crawl
            </p>
          </div>

          {/* Max Pages */}
          <div className="space-y-2">
            <label htmlFor="maxPages" className="text-xs font-medium tracking-wide uppercase">
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
              aria-label={`Maximum pages to crawl: ${maxPages}`}
              aria-valuemin={10}
              aria-valuemax={500}
              aria-valuenow={maxPages}
              aria-valuetext={`${maxPages} pages maximum`}
            />
            <p id="pages-help" className="text-muted-foreground text-xs">
              Maximum number of pages/elements to crawl
            </p>
          </div>

          {/* Advanced Options Toggle */}
          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs"
              aria-expanded={showAdvanced}
              aria-controls="advanced-options"
            >
              {showAdvanced ? "▼" : "▶"} Advanced Options
            </Button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div id="advanced-options" className="border-border space-y-4 border-l-2 pl-2">
              {/* Custom User-Agent */}
              <div className="space-y-2">
                <label htmlFor="userAgent" className="text-xs font-medium tracking-wide uppercase">
                  Custom User-Agent
                </label>
                <Input
                  id="userAgent"
                  type="text"
                  placeholder="SitemapCrawler/1.0 (default)"
                  value={userAgent}
                  onChange={(e) => setUserAgent(e.target.value)}
                  disabled={isLoading}
                  className="font-mono text-xs"
                  aria-describedby="userAgent-help"
                />
                <p id="userAgent-help" className="text-muted-foreground text-xs">
                  Custom identifier sent to the server (leave empty for default)
                </p>
              </div>
            </div>
          )}

          {!isLoading ? (
            <Button
              type="submit"
              disabled={!validation.isValid || !url.trim()}
              className="w-full"
              aria-label="Start crawling the website"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Start Crawl
            </Button>
          ) : (
            <div className="space-y-2" role="status" aria-live="polite">
              <Button type="button" disabled className="w-full" aria-busy="true">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Crawling...
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onCancel}
                  className="w-full"
                  aria-label="Cancel the current crawl operation"
                >
                  <XCircle className="h-4 w-4" aria-hidden="true" />
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
