"use client";

import { memo, useCallback } from "react";
import { Handle, Position } from "@xyflow/react";
import { CustomNodeData } from "@/types/flow";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface CustomNodeProps {
  data: CustomNodeData;
  selected?: boolean;
  id: string;
}

/**
 * Compact text-based sitemap node
 * Clean, minimal design with just title and path
 */
function CustomNodeComponent({ data, selected, id }: CustomNodeProps) {
  const isRoot = data.depth === 0 && data.nodeType === "page";
  const hasChildren = data.childCount > 0;

  const { collapsedNodes, toggleNodeCollapse } = useAppStore();
  const isCollapsed = collapsedNodes.has(id);

  // Extract path from URL for display
  const getPath = (url: string) => {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname === "/" ? "/" : parsed.pathname;
      // Truncate long paths
      return path.length > 25 ? path.slice(0, 22) + "..." : path;
    } catch {
      return url;
    }
  };

  const handleToggleCollapse = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    toggleNodeCollapse(id);
  };

  // Keyboard handler for node interactions
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (hasChildren) {
          toggleNodeCollapse(id);
        }
      }
    },
    [hasChildren, id, toggleNodeCollapse]
  );

  // Truncate title
  const displayTitle = data.title.length > 20 ? data.title.slice(0, 17) + "..." : data.title;

  return (
    <div
      className={`font-mono transition-all duration-150 ${selected ? "ring-2 ring-black" : ""} focus:ring-primary focus:ring-2 focus:outline-none`}
      role="treeitem"
      aria-expanded={hasChildren ? !isCollapsed : undefined}
      aria-selected={selected}
      title={data.title}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-background/60 !h-1 !w-1 !rounded-none !border-0"
        aria-hidden="true"
      />

      {/* Compact node content */}
      <div className="flex items-center gap-1.5">
        {/* Collapse button */}
        {hasChildren && (
          <button
            onClick={handleToggleCollapse}
            className="text-background/70 hover:text-background flex min-h-[20px] min-w-[20px] flex-shrink-0 items-center justify-center p-0.5"
            aria-label={
              isCollapsed
                ? `Expand ${data.title} (${data.childCount} children)`
                : `Collapse ${data.title}`
            }
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3 w-3" aria-hidden="true" />
            )}
          </button>
        )}

        {/* API badge */}
        {data.isApiEndpoint && (
          <span
            className="bg-background/20 text-background rounded-none px-1 py-0.5 text-[9px] font-semibold tracking-wide uppercase"
            aria-label="API endpoint"
          >
            API
          </span>
        )}

        {/* Title */}
        <span className={`truncate ${isRoot ? "font-semibold" : ""}`}>{displayTitle}</span>

        {/* Child count badge */}
        {hasChildren && (
          <span
            className="text-background/50 text-[10px]"
            aria-label={`${data.childCount} child pages`}
          >
            ({isCollapsed ? `+${data.childCount}` : data.childCount})
          </span>
        )}
      </div>

      {/* Path - smaller, muted */}
      {!isRoot && (
        <div className="text-background/50 mt-0.5 truncate text-[10px]" title={data.url}>
          {getPath(data.url)}
        </div>
      )}

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-background/60 !h-1 !w-1 !rounded-none !border-0"
        aria-hidden="true"
      />
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);
