"use client";

import { Button } from "@/components/ui/button";
import { Search, CheckCircle, XCircle, ChevronUp, ChevronDown } from "lucide-react";
import type { SEOScoreResult } from "@/lib/utils";
import type { ExpandableSectionProps } from "./types";

interface SEOScoreSectionProps extends ExpandableSectionProps {
  seoScore: SEOScoreResult;
}

export function SEOScoreSection({ seoScore, isExpanded, onToggle }: SEOScoreSectionProps) {
  return (
    <div className="border-border border-t pt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="hover:bg-muted flex w-full items-center justify-between p-2"
        aria-expanded={isExpanded}
        aria-controls="seo-details"
        aria-label={`${isExpanded ? "Hide" : "Show"} SEO analysis: grade ${seoScore.grade}, score ${seoScore.score}/100`}
      >
        <div className="flex items-center gap-2">
          <Search className="text-foreground h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium">SEO Score: {seoScore.score}/100</span>
          <span
            className={`px-1.5 py-0.5 text-xs font-bold ${
              seoScore.grade === "A"
                ? "bg-foreground text-background"
                : seoScore.grade === "B"
                  ? "bg-muted-foreground text-background"
                  : seoScore.grade === "C"
                    ? "bg-muted text-foreground border-border border"
                    : "bg-destructive/20 text-destructive"
            }`}
          >
            {seoScore.grade}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>

      {isExpanded && (
        <div id="seo-details" className="mt-2 space-y-3 text-xs">
          {/* Issues */}
          {seoScore.issues.length > 0 && (
            <div>
              <div className="text-destructive mb-1 flex items-center gap-1 font-medium">
                <XCircle className="h-3 w-3" aria-hidden="true" />
                Issues ({seoScore.issues.length})
              </div>
              <ul className="text-muted-foreground list-inside list-disc space-y-1">
                {seoScore.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Passed */}
          {seoScore.passed.length > 0 && (
            <div>
              <div className="text-foreground mb-1 flex items-center gap-1 font-medium">
                <CheckCircle className="h-3 w-3" aria-hidden="true" />
                Passed ({seoScore.passed.length})
              </div>
              <ul className="text-muted-foreground list-inside list-disc space-y-1">
                {seoScore.passed.map((pass, i) => (
                  <li key={i}>{pass}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
