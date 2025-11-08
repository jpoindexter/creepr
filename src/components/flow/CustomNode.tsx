"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { CustomNodeData } from "@/types/flow";

interface CustomNodeProps {
  data: CustomNodeData;
  selected?: boolean;
}

/**
 * Professional sitemap node component
 * Styling is controlled by node-factory.ts
 * This component focuses on content layout only
 */
function CustomNodeComponent({ data, selected }: CustomNodeProps) {
  const isRoot = data.depth === 0;

  // Extract path from URL for display
  const getPath = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.pathname === "/" ? "/" : parsed.pathname;
    } catch {
      return url;
    }
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
        {/* Header: Title */}
        <div className={`truncate ${isRoot ? "text-current" : "text-gray-900"}`}>{data.title}</div>

        {/* Body: URL path */}
        <div
          className={`mt-1 truncate text-xs ${isRoot ? "text-current opacity-90" : "text-gray-500"}`}
        >
          {getPath(data.url)}
        </div>

        {/* Footer: Status badge and child count */}
        <div className="mt-2 flex items-center gap-2">
          {/* Status code badge */}
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

          {/* Child count badge */}
          {data.childCount > 0 && (
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-semibold ${isRoot ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              {data.childCount} {data.childCount === 1 ? "page" : "pages"}
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
