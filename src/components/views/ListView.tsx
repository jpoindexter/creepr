"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
import { CustomNode } from "@/types/flow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Search, Download } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { exportToCSV, exportToJSON, exportStylesToJSON, getStatusColor } from "@/lib/export";

interface ListViewProps {
  nodes: CustomNode[];
  onNodeClick?: (nodeId: string) => void;
}

type SortField = "url" | "statusCode" | "depth" | "title" | "childCount";
type SortDirection = "asc" | "desc";

interface NodeWithParent extends CustomNode {
  parentUrl?: string;
}

export function ListView({ nodes, onNodeClick }: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("depth");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [treeMode, setTreeMode] = useState(true);
  const [showParentColumn, setShowParentColumn] = useState(false);

  const { selectedNodeId, flowEdges, crawlResult } = useAppStore();

  const nodeIdToParentUrl = useMemo(() => {
    const map = new Map<string, string>();
    const nodeMap = new Map(nodes.map((n) => [n.id, n.data.url]));
    flowEdges.forEach((edge) => {
      const parentUrl = nodeMap.get(edge.source);
      if (parentUrl) map.set(edge.target, parentUrl);
    });
    return map;
  }, [nodes, flowEdges]);

  const nodesWithParent: NodeWithParent[] = useMemo(
    () => nodes.map((node) => ({ ...node, parentUrl: nodeIdToParentUrl.get(node.id) })),
    [nodes, nodeIdToParentUrl]
  );

  const filteredNodes = useMemo(() => {
    if (!searchQuery) return nodesWithParent;
    const query = searchQuery.toLowerCase();
    return nodesWithParent.filter(
      (node) =>
        node.data.url.toLowerCase().includes(query) ||
        node.data.title.toLowerCase().includes(query) ||
        node.parentUrl?.toLowerCase().includes(query)
    );
  }, [nodesWithParent, searchQuery]);

  const sortedNodes = useMemo(() => {
    const sorted = [...filteredNodes];
    sorted.sort((a, b) => {
      const getValue = (node: NodeWithParent) => {
        switch (sortField) {
          case "url": return node.data.url;
          case "statusCode": return node.data.statusCode;
          case "depth": return node.data.depth;
          case "title": return node.data.title;
          case "childCount": return node.data.childCount;
        }
      };
      const aVal = getValue(a), bVal = getValue(b);
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [filteredNodes, sortField, sortDirection]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField]);

  const maxDepth = useMemo(() => Math.max(0, ...nodes.map((n) => n.data.depth)), [nodes]);
  const brokenCount = useMemo(() => filteredNodes.filter((n) => n.data.isBroken).length, [filteredNodes]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b-2 border-purple-200 bg-gradient-to-r from-purple-50 to-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search URLs or titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-purple-300 focus:border-purple-500"
              />
            </div>
            <Button variant={treeMode ? "default" : "outline"} size="sm" onClick={() => setTreeMode(!treeMode)}>
              {treeMode ? "Tree Mode" : "Flat Mode"}
            </Button>
            <Button variant={showParentColumn ? "default" : "outline"} size="sm" onClick={() => setShowParentColumn(!showParentColumn)}>
              {showParentColumn ? "Hide Parent" : "Show Parent"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToJSON(sortedNodes, crawlResult)} className="flex items-center gap-2 border-2 border-purple-500 text-purple-700 hover:bg-purple-50">
              <Download className="h-4 w-4" />JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToCSV(sortedNodes)} className="flex items-center gap-2 border-2 border-purple-500 text-purple-700 hover:bg-purple-50">
              <Download className="h-4 w-4" />CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportStylesToJSON(crawlResult)} className="flex items-center gap-2 border-2 border-pink-500 text-pink-700 hover:bg-pink-50">
              <Download className="h-4 w-4" />Styles
            </Button>
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-sm text-gray-600">
          <span><strong>{filteredNodes.length}</strong> pages</span>
          <span>•</span>
          <span><strong>{brokenCount}</strong> broken links</span>
          <span>•</span>
          <span>Max depth: <strong>{maxDepth}</strong></span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-purple-100 border-b-2 border-purple-300">
            <tr>
              <SortHeader field="url" label="URL" current={sortField} onSort={handleSort} />
              <SortHeader field="title" label="Title" current={sortField} onSort={handleSort} />
              <SortHeader field="statusCode" label="Status" current={sortField} onSort={handleSort} center />
              {showParentColumn && <th className="px-4 py-3 text-left font-semibold text-purple-900">Parent URL</th>}
              <SortHeader field="depth" label="Depth" current={sortField} onSort={handleSort} center />
              <SortHeader field="childCount" label="Children" current={sortField} onSort={handleSort} center />
            </tr>
          </thead>
          <tbody>
            {sortedNodes.map((node) => (
              <tr
                key={node.id}
                onClick={() => onNodeClick?.(node.id)}
                className={`border-b border-gray-200 cursor-pointer transition-colors hover:bg-purple-50 ${selectedNodeId === node.id ? "bg-purple-100" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 font-mono text-sm" style={treeMode ? { paddingLeft: `${node.data.depth * 24}px` } : {}}>
                    {treeMode && node.data.depth > 0 && <span className="text-gray-400">└─</span>}
                    <span className={node.data.isBroken ? "text-red-600" : "text-gray-800"}>{node.data.url}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{node.data.title}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${getStatusColor(node.data.statusCode, node.data.isBroken)}`}>
                    {node.data.statusCode}
                  </span>
                </td>
                {showParentColumn && (
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                    {node.parentUrl ? <span className="text-gray-500">{node.parentUrl}</span> : <span className="text-gray-400 italic">(root)</span>}
                  </td>
                )}
                <td className="px-4 py-3 text-center text-sm text-gray-600">{node.data.depth}</td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">{node.data.childCount > 0 ? node.data.childCount : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedNodes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Search className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No pages found</p>
            <p className="text-sm">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SortHeader({ field, label, onSort, center }: { field: SortField; label: string; current?: SortField; onSort: (f: SortField) => void; center?: boolean }) {
  return (
    <th className={`px-4 py-3 ${center ? "text-center" : "text-left"}`}>
      <button onClick={() => onSort(field)} className={`flex items-center gap-2 font-semibold text-purple-900 hover:text-purple-700 ${center ? "mx-auto" : ""}`}>
        {label}<ArrowUpDown className="h-3.5 w-3.5" />
      </button>
    </th>
  );
}
