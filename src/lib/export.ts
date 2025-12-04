import { CrawlResult } from "@/types/sitemap";
import { CustomNode } from "@/types/flow";
import { FullAuditReport } from "./source-auditor";

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

// Extract computed style values from elementStyles into categorized sets
function extractFromElementStyles(
  elementStyles: Array<{
    selector: string;
    element: string;
    classes: string[];
    computedStyles: Record<string, string | undefined>;
  }>,
  pageUrl: string,
  usage: {
    colors: Record<string, string[]>;
    fonts: Record<string, string[]>;
    fontSizes: Record<string, string[]>;
    fontWeights: Record<string, string[]>;
    lineHeights: Record<string, string[]>;
    letterSpacings: Record<string, string[]>;
    borderRadii: Record<string, string[]>;
    borderWidths: Record<string, string[]>;
    spacings: Record<string, string[]>;
    shadows: Record<string, string[]>;
    widths: Record<string, string[]>;
    heights: Record<string, string[]>;
  }
) {
  const addToUsage = (map: Record<string, string[]>, value: string | undefined) => {
    if (!value || value === "none" || value === "normal" || value === "auto" || value === "0px") return;
    if (!map[value]) map[value] = [];
    if (!map[value].includes(pageUrl)) map[value].push(pageUrl);
  };

  elementStyles.forEach((el) => {
    const s = el.computedStyles;
    // Colors
    addToUsage(usage.colors, s.color);
    addToUsage(usage.colors, s.backgroundColor);
    addToUsage(usage.colors, s.borderColor);
    // Typography
    addToUsage(usage.fonts, s.fontFamily);
    addToUsage(usage.fontSizes, s.fontSize);
    addToUsage(usage.fontWeights, s.fontWeight);
    addToUsage(usage.lineHeights, s.lineHeight);
    addToUsage(usage.letterSpacings, s.letterSpacing);
    // Borders & Radius
    addToUsage(usage.borderRadii, s.borderRadius);
    addToUsage(usage.borderWidths, s.borderWidth);
    // Spacing
    addToUsage(usage.spacings, s.padding);
    addToUsage(usage.spacings, s.margin);
    addToUsage(usage.spacings, s.gap);
    // Shadows
    addToUsage(usage.shadows, s.boxShadow);
    addToUsage(usage.shadows, s.textShadow);
    // Sizing
    addToUsage(usage.widths, s.width);
    addToUsage(usage.widths, s.maxWidth);
    addToUsage(usage.heights, s.height);
    addToUsage(usage.heights, s.minHeight);
  });
}

export function exportStylesToJSON(crawlResult: CrawlResult | null) {
  if (!crawlResult?.pages) {
    alert("No crawl data available to export styles");
    return;
  }

  // Track which pages use which values (for finding inconsistencies)
  const usage = {
    colors: {} as Record<string, string[]>,
    fonts: {} as Record<string, string[]>,
    fontSizes: {} as Record<string, string[]>,
    fontWeights: {} as Record<string, string[]>,
    lineHeights: {} as Record<string, string[]>,
    letterSpacings: {} as Record<string, string[]>,
    borderRadii: {} as Record<string, string[]>,
    borderWidths: {} as Record<string, string[]>,
    spacings: {} as Record<string, string[]>,
    shadows: {} as Record<string, string[]>,
    widths: {} as Record<string, string[]>,
    heights: {} as Record<string, string[]>,
  };

  const allCSSVariables: Record<string, string> = {};

  crawlResult.pages.forEach((page) => {
    if (!page.styles) return;
    const pageUrl = page.url;

    // Extract from elementStyles (computed styles for buttons, headings, etc.)
    if (page.styles.elementStyles) {
      extractFromElementStyles(page.styles.elementStyles, pageUrl, usage);
    }

    // Also add the pre-extracted unique values from raw CSS parsing
    page.styles.uniqueColors?.forEach((c) => {
      if (!usage.colors[c]) usage.colors[c] = [];
      if (!usage.colors[c].includes(pageUrl)) usage.colors[c].push(pageUrl);
    });
    page.styles.uniqueFonts?.forEach((f) => {
      if (!usage.fonts[f]) usage.fonts[f] = [];
      if (!usage.fonts[f].includes(pageUrl)) usage.fonts[f].push(pageUrl);
    });
    page.styles.uniqueBorderRadii?.forEach((r) => {
      if (!usage.borderRadii[r]) usage.borderRadii[r] = [];
      if (!usage.borderRadii[r].includes(pageUrl)) usage.borderRadii[r].push(pageUrl);
    });
    page.styles.uniqueSpacings?.forEach((s) => {
      if (!usage.spacings[s]) usage.spacings[s] = [];
      if (!usage.spacings[s].includes(pageUrl)) usage.spacings[s].push(pageUrl);
    });

    // Merge CSS variables
    if (page.styles.cssVariables) {
      Object.entries(page.styles.cssVariables).forEach(([key, value]) => {
        allCSSVariables[key] = value;
      });
    }
  });

  // Sort by number of pages using each value (most common first)
  const sortByUsage = (usageMap: Record<string, string[]>) =>
    Object.entries(usageMap)
      .sort((a, b) => b[1].length - a[1].length)
      .reduce((acc, [key, pages]) => {
        acc[key] = { count: pages.length, pages };
        return acc;
      }, {} as Record<string, { count: number; pages: string[] }>);

  const exportData = {
    crawledAt: new Date().toISOString(),
    rootUrl: crawlResult.rootUrl,
    totalPages: crawlResult.pages.filter((p) => p.styles).length,

    // Global CSS variables (from :root) - your design tokens
    cssVariables: allCSSVariables,

    // Design system breakdown with page usage
    designSystem: {
      colors: sortByUsage(usage.colors),
      fonts: sortByUsage(usage.fonts),
      fontSizes: sortByUsage(usage.fontSizes),
      fontWeights: sortByUsage(usage.fontWeights),
      lineHeights: sortByUsage(usage.lineHeights),
      letterSpacings: sortByUsage(usage.letterSpacings),
      borderRadii: sortByUsage(usage.borderRadii),
      borderWidths: sortByUsage(usage.borderWidths),
      spacings: sortByUsage(usage.spacings),
      shadows: sortByUsage(usage.shadows),
      widths: sortByUsage(usage.widths),
      heights: sortByUsage(usage.heights),
    },
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  downloadFile(blob, `creepr-styles-${Date.now()}.json`);
}

export function getStatusColor(statusCode: number, isBroken: boolean) {
  if (isBroken || statusCode >= 400) return "text-red-600 bg-red-50";
  if (statusCode >= 300) return "text-orange-600 bg-orange-50";
  return "text-green-600 bg-green-50";
}

/**
 * Run source code audit and export results
 * This scans .tsx/.ts files for design system violations like:
 * - rounded-md, rounded-lg (should be rounded-none for terminal aesthetic)
 * - shadow-sm, shadow-lg (should be no shadows)
 * - bg-white, text-gray-* (should use design tokens)
 * - p-3, p-5, p-7 (not on 8-point grid)
 */
export async function runSourceAudit(scanPath: string = "src"): Promise<FullAuditReport | null> {
  try {
    const response = await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: scanPath }),
    });

    if (!response.ok) {
      const error = await response.json();
      alert(`Audit failed: ${error.error}`);
      return null;
    }

    const report: FullAuditReport = await response.json();
    return report;
  } catch (error) {
    alert(`Audit error: ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
}

export function exportAuditReport(report: FullAuditReport) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  downloadFile(blob, `creepr-audit-${Date.now()}.json`);
}
