"use client";

import { useState, useMemo, useCallback } from "react";
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

type StatusFilter = "all" | "success" | "redirect" | "broken";
type DepthFilter = "all" | "0" | "1" | "2" | "3+";

export function ListView({ nodes, onNodeClick }: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("depth");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [treeMode, setTreeMode] = useState(true);
  const [showParentColumn, setShowParentColumn] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [depthFilter, setDepthFilter] = useState<DepthFilter>("all");

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
    return nodesWithParent.filter((node) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          node.data.url.toLowerCase().includes(query) ||
          node.data.title.toLowerCase().includes(query) ||
          node.parentUrl?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const status = node.data.statusCode;
        if (statusFilter === "success" && (status < 200 || status >= 300)) return false;
        if (statusFilter === "redirect" && (status < 300 || status >= 400)) return false;
        if (statusFilter === "broken" && status < 400) return false;
      }

      // Depth filter
      if (depthFilter !== "all") {
        const depth = node.data.depth;
        if (depthFilter === "0" && depth !== 0) return false;
        if (depthFilter === "1" && depth !== 1) return false;
        if (depthFilter === "2" && depth !== 2) return false;
        if (depthFilter === "3+" && depth < 3) return false;
      }

      return true;
    });
  }, [nodesWithParent, searchQuery, statusFilter, depthFilter]);

  const sortedNodes = useMemo(() => {
    const sorted = [...filteredNodes];
    sorted.sort((a, b) => {
      const getValue = (node: NodeWithParent) => {
        switch (sortField) {
          case "url":
            return node.data.url;
          case "statusCode":
            return node.data.statusCode;
          case "depth":
            return node.data.depth;
          case "title":
            return node.data.title;
          case "childCount":
            return node.data.childCount;
        }
      };
      const aVal = getValue(a),
        bVal = getValue(b);
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [filteredNodes, sortField, sortDirection]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField]
  );

  const maxDepth = useMemo(() => Math.max(0, ...nodes.map((n) => n.data.depth)), [nodes]);
  const brokenCount = useMemo(
    () => filteredNodes.filter((n) => n.data.isBroken).length,
    [filteredNodes]
  );

  return (
    <div className="bg-background flex h-full flex-col font-mono">
      {/* Header */}
      <div className="border-border bg-card border-b p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 flex-wrap items-center gap-4">
            <div className="relative max-w-md min-w-[200px] flex-1">
              <Search
                className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search URLs or titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search pages by URL or title"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="status-filter" className="sr-only">
                Filter by status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="bg-background border-input focus:ring-ring h-9 rounded-none border px-3 text-sm focus:ring-2 focus:outline-none"
                aria-label="Filter by HTTP status"
              >
                <option value="all">All Status</option>
                <option value="success">✓ Success (2xx)</option>
                <option value="redirect">→ Redirect (3xx)</option>
                <option value="broken">✗ Broken (4xx/5xx)</option>
              </select>
              <label htmlFor="depth-filter" className="sr-only">
                Filter by depth
              </label>
              <select
                id="depth-filter"
                value={depthFilter}
                onChange={(e) => setDepthFilter(e.target.value as DepthFilter)}
                className="bg-background border-input focus:ring-ring h-9 rounded-none border px-3 text-sm focus:ring-2 focus:outline-none"
                aria-label="Filter by page depth"
              >
                <option value="all">All Depths</option>
                <option value="0">Root (0)</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3+">Level 3+</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={treeMode ? "default" : "outline"}
                size="sm"
                onClick={() => setTreeMode(!treeMode)}
                aria-pressed={treeMode}
              >
                {treeMode ? "Tree Mode" : "Flat Mode"}
              </Button>
              <Button
                variant={showParentColumn ? "default" : "outline"}
                size="sm"
                onClick={() => setShowParentColumn(!showParentColumn)}
                aria-pressed={showParentColumn}
              >
                {showParentColumn ? "Hide Parent" : "Show Parent"}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="Export options">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToJSON(sortedNodes, crawlResult)}
              className="flex items-center gap-2"
              aria-label="Export crawl data as JSON"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(sortedNodes)}
              className="flex items-center gap-2"
              aria-label="Export crawl data as CSV"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportStylesToJSON(crawlResult)}
              className="flex items-center gap-2"
              aria-label="Export extracted styles as JSON"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Styles
            </Button>
          </div>
        </div>
        <div
          className="text-muted-foreground mt-3 flex gap-4 text-sm"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>
            <strong className="text-foreground">{filteredNodes.length}</strong> pages
          </span>
          <span aria-hidden="true">•</span>
          <span>
            <strong className="text-foreground">{brokenCount}</strong> broken links
          </span>
          <span aria-hidden="true">•</span>
          <span>
            Max depth: <strong className="text-foreground">{maxDepth}</strong>
          </span>
        </div>
      </div>

      {/* Table */}
      <div
        className="flex-1 overflow-auto"
        role="region"
        aria-label="Sitemap pages table"
        tabIndex={0}
      >
        <table className="w-full border-collapse" aria-describedby="table-summary">
          <caption id="table-summary" className="sr-only">
            Crawled pages showing URL, title, status code, depth, and child count. Click column
            headers to sort.
          </caption>
          <thead className="bg-muted border-border sticky top-0 border-b">
            <tr>
              <SortHeader
                field="url"
                label="URL"
                current={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeader
                field="title"
                label="Title"
                current={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeader
                field="statusCode"
                label="Status"
                current={sortField}
                direction={sortDirection}
                onSort={handleSort}
                center
              />
              {showParentColumn && (
                <th
                  scope="col"
                  className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase"
                >
                  Parent URL
                </th>
              )}
              <SortHeader
                field="depth"
                label="Depth"
                current={sortField}
                direction={sortDirection}
                onSort={handleSort}
                center
              />
              <SortHeader
                field="childCount"
                label="Children"
                current={sortField}
                direction={sortDirection}
                onSort={handleSort}
                center
              />
            </tr>
          </thead>
          <tbody>
            {sortedNodes.map((node) => (
              <tr
                key={node.id}
                onClick={() => onNodeClick?.(node.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onNodeClick?.(node.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={selectedNodeId === node.id}
                className={`border-border hover:bg-muted focus:ring-ring cursor-pointer border-b transition-colors focus:ring-2 focus:outline-none focus:ring-inset ${selectedNodeId === node.id ? "bg-accent" : ""}`}
              >
                <td className="max-w-xs px-4 py-3 xl:max-w-md">
                  <div
                    className="flex items-center gap-2 text-sm"
                    style={treeMode ? { paddingLeft: `${node.data.depth * 24}px` } : {}}
                  >
                    {treeMode && node.data.depth > 0 && (
                      <span className="text-muted-foreground" aria-hidden="true">
                        └─
                      </span>
                    )}
                    <span
                      className={`truncate ${node.data.isBroken ? "text-destructive" : "text-foreground"}`}
                      title={node.data.url}
                    >
                      {node.data.url}
                    </span>
                  </div>
                </td>
                <td className="text-muted-foreground max-w-xs px-4 py-3 text-sm">
                  <span className="block truncate" title={node.data.title}>
                    {node.data.title}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold ${getStatusColor(node.data.statusCode, node.data.isBroken)}`}
                  >
                    {node.data.statusCode}
                  </span>
                </td>
                {showParentColumn && (
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {node.parentUrl ? (
                      <span>{node.parentUrl}</span>
                    ) : (
                      <span className="italic">(root)</span>
                    )}
                  </td>
                )}
                <td className="text-muted-foreground px-4 py-3 text-center text-sm">
                  {node.data.depth}
                </td>
                <td className="text-muted-foreground px-4 py-3 text-center text-sm">
                  {node.data.childCount > 0 ? node.data.childCount : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedNodes.length === 0 && (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
            <Search className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No pages found</p>
            <p className="text-sm">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SortHeader({
  field,
  label,
  current,
  direction,
  onSort,
  center,
}: {
  field: SortField;
  label: string;
  current?: SortField;
  direction?: SortDirection;
  onSort: (f: SortField) => void;
  center?: boolean;
}) {
  const isActive = current === field;
  const ariaSortValue: "ascending" | "descending" | "none" = isActive
    ? direction === "asc"
      ? "ascending"
      : "descending"
    : "none";

  return (
    <th
      scope="col"
      className={`px-4 py-3 ${center ? "text-center" : "text-left"}`}
      aria-sort={ariaSortValue}
    >
      <button
        onClick={() => onSort(field)}
        className={`text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs font-semibold tracking-wide uppercase ${center ? "mx-auto" : ""} ${isActive ? "text-foreground" : ""}`}
        aria-label={`Sort by ${label}, currently ${isActive ? (direction === "asc" ? "ascending" : "descending") : "not sorted"}`}
      >
        {label}
        <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </th>
  );
}
