"use client";

import { useState, useMemo } from "react";
import { CustomNode } from "@/types/flow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Search, Download } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface ListViewProps {
  nodes: CustomNode[];
  onNodeClick?: (nodeId: string) => void;
}

type SortField = "url" | "statusCode" | "depth" | "title" | "childCount";
type SortDirection = "asc" | "desc";

export function ListView({ nodes, onNodeClick }: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("depth");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [treeMode, setTreeMode] = useState(true);

  const { selectedNodeId } = useAppStore();

  // Filter nodes based on search query
  const filteredNodes = useMemo(() => {
    if (!searchQuery) return nodes;

    const query = searchQuery.toLowerCase();
    return nodes.filter(
      (node) =>
        node.data.url.toLowerCase().includes(query) ||
        node.data.title.toLowerCase().includes(query)
    );
  }, [nodes, searchQuery]);

  // Sort nodes
  const sortedNodes = useMemo(() => {
    const sorted = [...filteredNodes];

    sorted.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case "url":
          aVal = a.data.url;
          bVal = b.data.url;
          break;
        case "statusCode":
          aVal = a.data.statusCode;
          bVal = b.data.statusCode;
          break;
        case "depth":
          aVal = a.data.depth;
          bVal = b.data.depth;
          break;
        case "title":
          aVal = a.data.title;
          bVal = b.data.title;
          break;
        case "childCount":
          aVal = a.data.childCount;
          bVal = b.data.childCount;
          break;
        default:
          return 0;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortDirection === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });

    return sorted;
  }, [filteredNodes, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleExportCSV = () => {
    const headers = ["URL", "Title", "Status Code", "Depth", "Children", "Node Type"];
    const rows = sortedNodes.map((node) => [
      node.data.url,
      node.data.title,
      node.data.statusCode.toString(),
      node.data.depth.toString(),
      node.data.childCount.toString(),
      node.data.nodeType,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sitemap-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (statusCode: number, isBroken: boolean) => {
    if (isBroken || statusCode >= 400) return "text-red-600 bg-red-50";
    if (statusCode >= 300) return "text-orange-600 bg-orange-50";
    return "text-green-600 bg-green-50";
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b-2 border-purple-200 bg-gradient-to-r from-purple-50 to-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4">
            {/* Search */}
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

            {/* Tree Mode Toggle */}
            <Button
              variant={treeMode ? "default" : "outline"}
              size="sm"
              onClick={() => setTreeMode(!treeMode)}
              className="whitespace-nowrap"
            >
              {treeMode ? "Tree Mode" : "Flat Mode"}
            </Button>
          </div>

          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2 border-2 border-purple-500 text-purple-700 hover:bg-purple-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-3 flex gap-4 text-sm text-gray-600">
          <span>
            <strong>{filteredNodes.length}</strong> pages
          </span>
          <span>•</span>
          <span>
            <strong>{filteredNodes.filter((n) => n.data.isBroken).length}</strong> broken links
          </span>
          <span>•</span>
          <span>
            Max depth: <strong>{Math.max(...nodes.map((n) => n.data.depth))}</strong>
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-purple-100 border-b-2 border-purple-300">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("url")}
                  className="flex items-center gap-2 font-semibold text-purple-900 hover:text-purple-700"
                >
                  URL
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("title")}
                  className="flex items-center gap-2 font-semibold text-purple-900 hover:text-purple-700"
                >
                  Title
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => handleSort("statusCode")}
                  className="flex items-center gap-2 font-semibold text-purple-900 hover:text-purple-700 mx-auto"
                >
                  Status
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => handleSort("depth")}
                  className="flex items-center gap-2 font-semibold text-purple-900 hover:text-purple-700 mx-auto"
                >
                  Depth
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => handleSort("childCount")}
                  className="flex items-center gap-2 font-semibold text-purple-900 hover:text-purple-700 mx-auto"
                >
                  Children
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedNodes.map((node) => (
              <tr
                key={node.id}
                onClick={() => onNodeClick?.(node.id)}
                className={`border-b border-gray-200 cursor-pointer transition-colors hover:bg-purple-50 ${
                  selectedNodeId === node.id ? "bg-purple-100" : ""
                }`}
              >
                {/* URL (with tree indent if tree mode) */}
                <td className="px-4 py-3">
                  <div
                    className="flex items-center gap-2 font-mono text-sm"
                    style={treeMode ? { paddingLeft: `${node.data.depth * 24}px` } : {}}
                  >
                    {treeMode && node.data.depth > 0 && (
                      <span className="text-gray-400">└─</span>
                    )}
                    <span className={node.data.isBroken ? "text-red-600" : "text-gray-800"}>
                      {node.data.url}
                    </span>
                  </div>
                </td>

                {/* Title */}
                <td className="px-4 py-3 text-sm text-gray-700">{node.data.title}</td>

                {/* Status Code */}
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs font-semibold ${getStatusColor(
                      node.data.statusCode,
                      node.data.isBroken
                    )}`}
                  >
                    {node.data.statusCode}
                  </span>
                </td>

                {/* Depth */}
                <td className="px-4 py-3 text-center text-sm text-gray-600">{node.data.depth}</td>

                {/* Child Count */}
                <td className="px-4 py-3 text-center text-sm text-gray-600">
                  {node.data.childCount > 0 ? node.data.childCount : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
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
