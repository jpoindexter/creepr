"use client";

import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, ChevronUp, ChevronDown } from "lucide-react";
import type { SecurityHeaders } from "@/lib/crawler/types";
import type { ExpandableSectionProps } from "./types";

interface SecuritySectionProps extends ExpandableSectionProps {
  securityHeaders: SecurityHeaders;
}

function getSecurityGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}

export function SecuritySection({ securityHeaders, isExpanded, onToggle }: SecuritySectionProps) {
  const grade = getSecurityGrade(securityHeaders.score);

  return (
    <div className="border-border border-t pt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="hover:bg-muted flex w-full items-center justify-between p-2"
        aria-expanded={isExpanded}
        aria-controls="security-details"
        aria-label={`${isExpanded ? "Hide" : "Show"} security headers: score ${securityHeaders.score}/100`}
      >
        <div className="flex items-center gap-2">
          <Shield className="text-foreground h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium">Security: {securityHeaders.score}/100</span>
          <span
            className={`px-1.5 py-0.5 text-xs font-bold ${
              securityHeaders.score >= 90
                ? "bg-foreground text-background"
                : securityHeaders.score >= 70
                  ? "bg-muted-foreground text-background"
                  : securityHeaders.score >= 50
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
        <div id="security-details" className="mt-2 space-y-3 text-xs">
          {/* Missing Headers */}
          {securityHeaders.missingHeaders.length > 0 && (
            <div>
              <div className="text-destructive mb-1 flex items-center gap-1 font-medium">
                <XCircle className="h-3 w-3" aria-hidden="true" />
                Missing ({securityHeaders.missingHeaders.length})
              </div>
              <ul className="text-muted-foreground list-inside list-disc space-y-1">
                {securityHeaders.missingHeaders.map((header, i) => (
                  <li key={i}>{header}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Present Headers */}
          {securityHeaders.presentHeaders.length > 0 && (
            <div>
              <div className="text-foreground mb-1 flex items-center gap-1 font-medium">
                <CheckCircle className="h-3 w-3" aria-hidden="true" />
                Present ({securityHeaders.presentHeaders.length})
              </div>
              <ul className="text-muted-foreground list-inside list-disc space-y-1">
                {securityHeaders.presentHeaders.map((header, i) => (
                  <li key={i}>{header}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Header Values */}
          {(securityHeaders.contentSecurityPolicy || securityHeaders.strictTransportSecurity) && (
            <div className="bg-muted max-h-32 space-y-1 overflow-y-auto p-2">
              {securityHeaders.contentSecurityPolicy && (
                <div>
                  <span className="text-foreground font-medium">CSP: </span>
                  <span className="text-muted-foreground text-[10px] break-all">
                    {securityHeaders.contentSecurityPolicy.slice(0, 100)}
                    {securityHeaders.contentSecurityPolicy.length > 100 && "..."}
                  </span>
                </div>
              )}
              {securityHeaders.strictTransportSecurity && (
                <div>
                  <span className="text-foreground font-medium">HSTS: </span>
                  <span className="text-muted-foreground text-[10px]">
                    {securityHeaders.strictTransportSecurity}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
