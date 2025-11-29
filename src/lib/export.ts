import { CrawlResult } from "@/types/sitemap";
import { CustomNode } from "@/types/flow";

interface NodeWithParent extends CustomNode {
  parentUrl?: string;
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(nodes: NodeWithParent[]) {
  const headers = ["URL", "Title", "Status Code", "Parent URL", "Depth", "Children", "Node Type", "Is Broken"];
  const rows = nodes.map((node) => [
    node.data.url,
    node.data.title,
    node.data.statusCode.toString(),
    node.parentUrl || "(root)",
    node.data.depth.toString(),
    node.data.childCount.toString(),
    node.data.nodeType,
    node.data.isBroken ? "Yes" : "No",
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  downloadFile(blob, `creepr-crawl-${Date.now()}.csv`);
}

export function exportToJSON(nodes: NodeWithParent[], crawlResult: CrawlResult | null) {
  const jsonData =
    crawlResult?.pages ||
    nodes.map((node) => ({
      url: node.data.url,
      title: node.data.title,
      statusCode: node.data.statusCode,
      parentUrl: node.parentUrl || null,
      depth: node.data.depth,
      childCount: node.data.childCount,
      nodeType: node.data.nodeType,
      isBroken: node.data.isBroken,
    }));

  const exportData = {
    crawledAt: new Date().toISOString(),
    rootUrl: crawlResult?.rootUrl || "",
    totalPages: crawlResult?.totalPages || nodes.length,
    brokenLinks: crawlResult?.brokenLinks || 0,
    crawlTime: crawlResult?.crawlTime || 0,
    pages: jsonData,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  downloadFile(blob, `creepr-crawl-${Date.now()}.json`);
}

export function getStatusColor(statusCode: number, isBroken: boolean) {
  if (isBroken || statusCode >= 400) return "text-red-600 bg-red-50";
  if (statusCode >= 300) return "text-orange-600 bg-orange-50";
  return "text-green-600 bg-green-50";
}
