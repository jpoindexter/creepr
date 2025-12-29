"use client";

import { ChevronRight, Home } from "lucide-react";
import type { BreadcrumbItem } from "./types";

interface BreadcrumbNavProps {
  path: BreadcrumbItem[];
  onNavigate: (nodeId: string) => void;
}

export function BreadcrumbNav({ path, onNavigate }: BreadcrumbNavProps) {
  if (path.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb navigation" className="border-border border-b pb-2">
      <ol className="flex flex-wrap items-center gap-1 text-xs">
        {path.map((crumb, index) => {
          const isLast = index === path.length - 1;
          const isFirst = index === 0;

          return (
            <li key={crumb.id} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  className="text-muted-foreground h-3 w-3 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  className="text-foreground max-w-[120px] truncate font-medium"
                  title={crumb.title}
                  aria-current="page"
                >
                  {isFirst ? <Home className="mr-1 inline h-3 w-3" aria-hidden="true" /> : null}
                  {crumb.title.length > 20 ? crumb.title.slice(0, 20) + "..." : crumb.title}
                </span>
              ) : (
                <button
                  onClick={() => onNavigate(crumb.id)}
                  className="text-muted-foreground hover:text-foreground focus:ring-ring max-w-[100px] truncate hover:underline focus:ring-1 focus:outline-none"
                  title={`Go to ${crumb.title}`}
                >
                  {isFirst ? <Home className="mr-1 inline h-3 w-3" aria-hidden="true" /> : null}
                  {crumb.title.length > 15 ? crumb.title.slice(0, 15) + "..." : crumb.title}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
