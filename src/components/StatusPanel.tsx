'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface StatusPanelProps {
  totalPages: number;
  brokenLinks: number;
  crawlTime?: number;
  selectedNode?: {
    title: string;
    url: string;
    statusCode: number;
  };
}

export function StatusPanel({
  totalPages,
  brokenLinks,
  crawlTime,
  selectedNode,
}: StatusPanelProps) {
  const successPages = totalPages - brokenLinks;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Crawl Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Total Pages</span>
            </div>
            <span className="font-semibold">{totalPages}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Success</span>
            </div>
            <span className="font-semibold text-green-600">{successPages}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm">Broken Links</span>
            </div>
            <span className="font-semibold text-red-600">{brokenLinks}</span>
          </div>

          {crawlTime !== undefined && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Crawl Time</span>
              </div>
              <span className="font-mono text-sm">{formatDuration(crawlTime)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Node</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="text-xs text-gray-500 mb-1">Title</div>
              <div className="font-medium text-sm">{selectedNode.title}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">URL</div>
              <div className="text-sm font-mono break-all">{selectedNode.url}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Status Code</div>
              <span
                className={`
                  inline-block px-2 py-1 rounded text-sm font-semibold
                  ${
                    selectedNode.statusCode >= 400
                      ? 'bg-red-100 text-red-700'
                      : selectedNode.statusCode >= 300
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }
                `}
              >
                {selectedNode.statusCode}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
