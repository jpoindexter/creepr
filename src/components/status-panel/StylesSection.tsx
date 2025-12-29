"use client";

import { Button } from "@/components/ui/button";
import { Palette, ChevronUp, ChevronDown } from "lucide-react";
import type { PageStyles } from "@/lib/crawler/types";
import type { ExpandableSectionProps } from "./types";

interface StylesSectionProps extends ExpandableSectionProps {
  styles: PageStyles;
}

export function StylesSection({ styles, isExpanded, onToggle }: StylesSectionProps) {
  return (
    <div className="border-border border-t pt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="hover:bg-muted flex w-full items-center justify-between p-2"
        aria-expanded={isExpanded}
        aria-controls="styles-details"
        aria-label={`${isExpanded ? "Hide" : "Show"} page styles: ${styles.uniqueColors.length} colors, ${styles.uniqueFonts.length} fonts`}
      >
        <div className="flex items-center gap-2">
          <Palette className="text-foreground h-4 w-4" />
          <span className="text-sm font-medium">
            Page Styles ({styles.uniqueColors.length} colors, {styles.uniqueFonts.length} fonts)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>

      {isExpanded && (
        <div id="styles-details" className="mt-2 space-y-3 text-xs">
          {/* Colors */}
          {styles.uniqueColors.length > 0 && (
            <div>
              <div className="text-foreground mb-1 font-medium">
                Colors ({styles.uniqueColors.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {styles.uniqueColors.slice(0, 20).map((color, i) => (
                  <span
                    key={i}
                    className="bg-muted inline-flex items-center gap-1 px-1.5 py-0.5"
                    title={color}
                  >
                    <span
                      className="border-border h-3 w-3 border"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-mono text-xs">
                      {color.length > 20 ? color.slice(0, 20) + "..." : color}
                    </span>
                  </span>
                ))}
                {styles.uniqueColors.length > 20 && (
                  <span className="text-muted-foreground">
                    +{styles.uniqueColors.length - 20} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Fonts */}
          {styles.uniqueFonts.length > 0 && (
            <div>
              <div className="text-foreground mb-1 font-medium">
                Fonts ({styles.uniqueFonts.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {styles.uniqueFonts.slice(0, 10).map((font, i) => (
                  <span key={i} className="bg-secondary px-2 py-0.5 font-mono">
                    {font.length > 30 ? font.slice(0, 30) + "..." : font}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Border Radii */}
          {styles.uniqueBorderRadii.length > 0 && (
            <div>
              <div className="text-foreground mb-1 font-medium">
                Border Radii ({styles.uniqueBorderRadii.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {styles.uniqueBorderRadii.slice(0, 10).map((r, i) => (
                  <span key={i} className="bg-accent px-2 py-0.5 font-mono">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Spacings */}
          {styles.uniqueSpacings.length > 0 && (
            <div>
              <div className="text-foreground mb-1 font-medium">
                Spacings ({styles.uniqueSpacings.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {styles.uniqueSpacings.slice(0, 10).map((s, i) => (
                  <span key={i} className="bg-muted px-2 py-0.5 font-mono">
                    {s}
                  </span>
                ))}
                {styles.uniqueSpacings.length > 10 && (
                  <span className="text-muted-foreground">
                    +{styles.uniqueSpacings.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* CSS Variables */}
          {Object.keys(styles.cssVariables).length > 0 && (
            <div>
              <div className="text-foreground mb-1 font-medium">
                CSS Variables ({Object.keys(styles.cssVariables).length})
              </div>
              <div className="max-h-32 space-y-0.5 overflow-y-auto">
                {Object.entries(styles.cssVariables)
                  .slice(0, 15)
                  .map(([key, value], i) => (
                    <div key={i} className="bg-secondary flex items-center gap-2 px-2 py-0.5">
                      <span className="text-foreground font-mono">{key}</span>
                      <span className="text-muted-foreground">:</span>
                      <span className="text-muted-foreground truncate font-mono">{value}</span>
                    </div>
                  ))}
                {Object.keys(styles.cssVariables).length > 15 && (
                  <div className="text-muted-foreground px-2">
                    +{Object.keys(styles.cssVariables).length - 15} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-muted p-2">
            <div className="text-muted-foreground">
              <span className="text-foreground font-medium">{styles.totalRules}</span> CSS rules •{" "}
              <span className="text-foreground font-medium">{styles.inlineStyles.length}</span>{" "}
              inline styles •{" "}
              <span className="text-foreground font-medium">
                {styles.externalStylesheets.length}
              </span>{" "}
              stylesheets
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
