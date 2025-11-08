"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { CustomNodeData } from "@/types/flow";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { getStatusColor } from "@/lib/utils";

interface CustomNodeProps {
  data: CustomNodeData;
  selected?: boolean;
}

function CustomNodeComponent({ data, selected }: CustomNodeProps) {
  const statusColor = getStatusColor(data.statusCode);
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

  const StatusIcon = () => {
    if (data.isBroken) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (data.statusCode >= 300 && data.statusCode < 400) {
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div
      className={`min-w-[200px] max-w-[300px] rounded-lg border-2 bg-white px-4 py-3 shadow-md transition-all duration-200 ${selected ? "ring-2 ring-blue-400" : ""} ${data.isBroken ? "border-red-400 bg-red-50" : "border-gray-300"} ${isRoot ? "border-blue-500 bg-blue-50 font-semibold" : ""} hover:shadow-lg`}
      style={{
        borderLeftWidth: 4,
        borderLeftColor: statusColor,
      }}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 !bg-blue-500" />

      <div className="flex items-start gap-2">
        <StatusIcon />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-gray-900">{data.title}</div>
          <div className="mt-1 truncate text-xs text-gray-500">{getPath(data.url)}</div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`rounded px-1.5 py-0.5 text-xs ${data.isBroken ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"} `}
            >
              {data.statusCode}
            </span>
            {isRoot && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">Root</span>
            )}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="h-3 w-3 !bg-blue-500" />
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);
