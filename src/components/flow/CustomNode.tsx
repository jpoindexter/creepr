"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { CustomNodeData } from "@/types/flow";
import { NodeType } from "@/types/sitemap";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface CustomNodeProps {
  data: CustomNodeData;
  selected?: boolean;
  id: string;
}

/**
 * Returns an icon for the given node type
 */
function getNodeIcon(nodeType: NodeType): string {
  switch (nodeType) {
    case "page":
      return "📄";
    case "tab":
      return "📑";
    case "modal":
      return "🔘";
    case "accordion":
      return "▼";
    case "dropdown":
      return "⋮";
    case "button":
      return "🎯";
    default:
      return "📄";
  }
}

/**
 * Returns a human-readable label for the node type
 */
function getNodeTypeLabel(nodeType: NodeType): string {
  switch (nodeType) {
    case "page":
      return "Page";
    case "tab":
      return "Tab";
    case "modal":
      return "Modal";
    case "accordion":
      return "Accordion";
    case "dropdown":
      return "Dropdown";
    case "button":
      return "Button";
    default:
      return "Page";
  }
}

/**
 * Professional sitemap node component
 * Styling is controlled by node-factory.ts
 * This component focuses on content layout only
 */
function CustomNodeComponent({ data, selected, id }: CustomNodeProps) {
  const isRoot = data.depth === 0 && data.nodeType === "page";
  const isInteractive = data.nodeType !== "page";
  const hasChildren = data.childCount > 0;
  const isVirtual = data.isVirtual === true;

  const { collapsedNodes, toggleNodeCollapse } = useAppStore();
  const isCollapsed = collapsedNodes.has(id);

  // Extract path from URL for display
  const getPath = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.pathname === "/" ? "/" : parsed.pathname;
    } catch {
      return url;
    }
  };

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNodeCollapse(id);
  };

  return (
    <div
      className={`transition-all duration-200 ${selected ? "ring-2 ring-purple-500 ring-offset-2" : ""} hover:scale-[1.02] hover:shadow-lg`}
    >
      {/* Connection handles - invisible but functional */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-2 !border-purple-500 !bg-white opacity-0 hover:opacity-100"
      />

      {/* Node content - two-part design */}
      <div className="flex flex-col">
        {/* Header: Icon + Title + Collapse button */}
        <div className="flex items-center gap-2">
          {/* Collapse/Expand button (only if has children) */}
          {hasChildren && (
            <button
              onClick={handleToggleCollapse}
              className={`flex-shrink-0 transition-colors hover:bg-gray-100 rounded p-0.5 ${isRoot ? "text-white hover:bg-white/20" : "text-gray-600"}`}
              title={isCollapsed ? "Expand children" : "Collapse children"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
          <span className="text-base leading-none">
            {isVirtual ? "📁" : getNodeIcon(data.nodeType)}
          </span>
          <div className={`flex-1 truncate ${isRoot ? "text-current" : isVirtual ? "text-gray-600 italic" : "text-gray-900"}`}>
            {data.title}
          </div>
        </div>

        {/* Body: URL path (only for pages) or Type label (for interactive elements) */}
        <div
          className={`mt-1 truncate text-xs ${isRoot ? "text-current opacity-90" : "text-gray-500"}`}
        >
          {isInteractive ? (
            <span className="font-medium">{getNodeTypeLabel(data.nodeType)}</span>
          ) : (
            getPath(data.url)
          )}
        </div>

        {/* Footer: Status badge and child count */}
        <div className="mt-2 flex items-center gap-2">
          {/* Status code badge (only for pages) */}
          {!isInteractive && (
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                data.isBroken || data.statusCode >= 400
                  ? "bg-red-100 text-red-700"
                  : data.statusCode >= 300 && data.statusCode < 400
                    ? "bg-orange-100 text-orange-700"
                    : isRoot
                      ? "bg-white/20 text-white"
                      : "bg-purple-100 text-purple-700"
              }`}
            >
              {data.statusCode}
            </span>
          )}

          {/* Child count badge */}
          {data.childCount > 0 && (
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-semibold ${isRoot ? "bg-white/20 text-white" : isCollapsed ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}
            >
              {isCollapsed ? `${data.childCount} hidden` : `${data.childCount} ${data.childCount === 1 ? "item" : "items"}`}
            </span>
          )}
        </div>
      </div>

      {/* Bottom connection handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-2 !border-purple-500 !bg-white opacity-0 hover:opacity-100"
      />
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);
