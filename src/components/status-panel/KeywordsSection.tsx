"use client";

import { Button } from "@/components/ui/button";
import { Tags, ChevronUp, ChevronDown } from "lucide-react";
import type { KeywordDensity } from "@/lib/crawler/types";
import type { ExpandableSectionProps } from "./types";

interface KeywordsSectionProps extends ExpandableSectionProps {
  keywordDensity: KeywordDensity;
}

export function KeywordsSection({ keywordDensity, isExpanded, onToggle }: KeywordsSectionProps) {
  if (keywordDensity.totalWords === 0) return null;

  return (
    <div className="border-border border-t pt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="hover:bg-muted flex w-full items-center justify-between p-2"
        aria-expanded={isExpanded}
        aria-controls="keywords-details"
        aria-label={`${isExpanded ? "Hide" : "Show"} keyword analysis: ${keywordDensity.totalWords} words`}
      >
        <div className="flex items-center gap-2">
          <Tags className="text-foreground h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium">
            Keywords ({keywordDensity.uniqueWords} unique)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>

      {isExpanded && (
        <div id="keywords-details" className="mt-2 space-y-3 text-xs">
          {/* Stats */}
          <div className="bg-muted text-muted-foreground flex gap-4 p-2">
            <div>
              <span className="text-foreground font-medium">{keywordDensity.totalWords}</span> words
            </div>
            <div>
              <span className="text-foreground font-medium">{keywordDensity.uniqueWords}</span>{" "}
              unique
            </div>
            <div>
              avg{" "}
              <span className="text-foreground font-medium">
                {keywordDensity.averageWordLength}
              </span>{" "}
              chars
            </div>
          </div>

          {/* Top Keywords */}
          {keywordDensity.topKeywords.length > 0 && (
            <div>
              <div className="text-foreground mb-2 font-medium">Top Keywords</div>
              <div className="max-h-40 space-y-1.5 overflow-y-auto">
                {keywordDensity.topKeywords.slice(0, 10).map((kw, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-foreground font-mono">{kw.word}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{kw.count}x</span>
                      <span className="bg-muted text-muted-foreground px-1.5 py-0.5 text-[10px]">
                        {kw.density}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
