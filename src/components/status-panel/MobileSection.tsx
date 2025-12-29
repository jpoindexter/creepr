"use client";

import { Button } from "@/components/ui/button";
import { Smartphone, CheckCircle, XCircle, ChevronUp, ChevronDown } from "lucide-react";
import type { MobileResponsiveness } from "@/lib/crawler/types";
import type { ExpandableSectionProps } from "./types";

interface MobileSectionProps extends ExpandableSectionProps {
  mobileResponsiveness: MobileResponsiveness;
}

function getMobileGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}

export function MobileSection({ mobileResponsiveness, isExpanded, onToggle }: MobileSectionProps) {
  const grade = getMobileGrade(mobileResponsiveness.score);

  return (
    <div className="border-border border-t pt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="hover:bg-muted flex w-full items-center justify-between p-2"
        aria-expanded={isExpanded}
        aria-controls="mobile-details"
        aria-label={`${isExpanded ? "Hide" : "Show"} mobile responsiveness: score ${mobileResponsiveness.score}/100`}
      >
        <div className="flex items-center gap-2">
          <Smartphone className="text-foreground h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium">Mobile: {mobileResponsiveness.score}/100</span>
          <span
            className={`px-1.5 py-0.5 text-xs font-bold ${
              mobileResponsiveness.score >= 90
                ? "bg-foreground text-background"
                : mobileResponsiveness.score >= 70
                  ? "bg-muted-foreground text-background"
                  : mobileResponsiveness.score >= 50
                    ? "bg-muted text-foreground border-border border"
                    : "bg-destructive/20 text-destructive"
            }`}
          >
            {grade}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>

      {isExpanded && (
        <div id="mobile-details" className="mt-2 space-y-3 text-xs">
          {/* Quick Stats */}
          <div className="bg-muted space-y-1.5 p-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Viewport Meta</span>
              <span
                className={
                  mobileResponsiveness.hasViewportMeta ? "text-foreground" : "text-destructive"
                }
              >
                {mobileResponsiveness.hasViewportMeta ? "Present" : "Missing"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Media Queries</span>
              <span
                className={
                  mobileResponsiveness.hasMobileMediaQueries
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                {mobileResponsiveness.hasMobileMediaQueries ? "Found" : "None"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Flexbox/Grid</span>
              <span
                className={
                  mobileResponsiveness.hasFlexboxOrGrid
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                {mobileResponsiveness.hasFlexboxOrGrid ? "Used" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Responsive Images</span>
              <span
                className={
                  mobileResponsiveness.hasResponsiveImages
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                {mobileResponsiveness.hasResponsiveImages ? "Yes" : "No"}
              </span>
            </div>
            {mobileResponsiveness.smallTouchTargets > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Small Touch Targets</span>
                <span className="text-destructive">
                  {mobileResponsiveness.smallTouchTargets} elements &lt;44px
                </span>
              </div>
            )}
          </div>

          {/* Issues */}
          {mobileResponsiveness.issues.length > 0 && (
            <div>
              <div className="text-destructive mb-1 flex items-center gap-1 font-medium">
                <XCircle className="h-3 w-3" aria-hidden="true" />
                Issues ({mobileResponsiveness.issues.length})
              </div>
              <ul className="text-muted-foreground list-inside list-disc space-y-1">
                {mobileResponsiveness.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Passed */}
          {mobileResponsiveness.passed.length > 0 && (
            <div>
              <div className="text-foreground mb-1 flex items-center gap-1 font-medium">
                <CheckCircle className="h-3 w-3" aria-hidden="true" />
                Passed ({mobileResponsiveness.passed.length})
              </div>
              <ul className="text-muted-foreground list-inside list-disc space-y-1">
                {mobileResponsiveness.passed.map((pass, i) => (
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
