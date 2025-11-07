'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from '@/types/flow';
import { ExternalLink, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { getStatusColor } from '@/lib/utils';

function CustomNodeComponent({ data, selected }: NodeProps<CustomNodeData>) {
  const statusColor = getStatusColor(data.statusCode);
  const isRoot = data.depth === 0;

  // Extract path from URL for display
  const getPath = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.pathname === '/' ? '/' : parsed.pathname;
    } catch {
      return url;
    }
  };

  const StatusIcon = () => {
    if (data.isBroken) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (data.statusCode >= 300 && data.statusCode < 400) {
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px] max-w-[300px]
        transition-all duration-200
        ${selected ? 'ring-2 ring-blue-400' : ''}
        ${data.isBroken ? 'border-red-400 bg-red-50' : 'border-gray-300'}
        ${isRoot ? 'border-blue-500 bg-blue-50 font-semibold' : ''}
        hover:shadow-lg
      `}
      style={{
        borderLeftWidth: 4,
        borderLeftColor: statusColor,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500"
      />

      <div className="flex items-start gap-2">
        <StatusIcon />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900 truncate">
            {data.title}
          </div>
          <div className="text-xs text-gray-500 truncate mt-1">
            {getPath(data.url)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`
                text-xs px-1.5 py-0.5 rounded
                ${data.isBroken ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}
              `}
            >
              {data.statusCode}
            </span>
            {isRoot && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                Root
              </span>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500"
      />
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);
