import { PageInfo } from "../crawler/types";
import { SitemapNode } from "@/types/sitemap";
import { getLinkStatus } from "../crawler/link-validator";
import { isBrokenLink, normalizeUrl, getPathParent, getPathSegments } from "../utils";

/**
 * Get a human-readable title for a page, falling back to URL path if title is empty/generic
 */
function getDisplayTitle(title: string, url: string): string {
  // If title is meaningful, use it
  if (
    title &&
    title.trim() !== "" &&
    title !== "Untitled" &&
    title !== "Error" &&
    title !== "Failed"
  ) {
    return title;
  }

  // Fall back to URL path segment
  const segments = getPathSegments(url);
  if (segments.length > 0) {
    // Use the last path segment, formatted nicely
    const lastSegment = segments[segments.length - 1];
    // Convert kebab-case or snake_case to Title Case
    return lastSegment.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }

  // If no path segments (root), use "Home"
  return "Home";
}

export function buildSitemapTree(pages: PageInfo[], rootUrl: string): SitemapNode {
  // Create nodes map (includes both real pages and virtual folders)
  const nodesMap = new Map<string, SitemapNode>();

  // First, create nodes for all actual crawled pages
  pages.forEach((page) => {
    const node: SitemapNode = {
      id: page.url,
      url: page.url,
      title: getDisplayTitle(page.title, page.url),
      statusCode: page.statusCode,
      status: getLinkStatus(page.statusCode),
      depth: page.depth,
      children: [],
      isBroken: isBrokenLink(page.statusCode),
      nodeType: page.nodeType || "page",
      interactionType: page.interactionType,
      parentPageUrl: page.parentPageUrl,
      isVirtual: false,
      isApiEndpoint: page.isApiEndpoint,
      contentType: page.contentType,
      securityHeaders: page.securityHeaders,
    };
    nodesMap.set(page.url, node);
  });

  // Find root node or create it
  let rootNode = nodesMap.get(rootUrl);
  if (!rootNode) {
    rootNode = {
      id: rootUrl,
      url: rootUrl,
      title: "Root",
      statusCode: 200,
      status: "success",
      depth: 0,
      children: [],
      isBroken: false,
      nodeType: "page",
      isVirtual: false,
    };
    nodesMap.set(rootUrl, rootNode);
  }

  // Build path-based hierarchy by creating virtual folder nodes for missing intermediates
  const allUrls = Array.from(nodesMap.keys());

  allUrls.forEach((url) => {
    // Walk up the path hierarchy and create virtual folders if needed
    let currentUrl = url;
    let parentUrl = getPathParent(currentUrl);

    while (parentUrl && !nodesMap.has(parentUrl)) {
      // Create virtual folder node
      const segments = getPathSegments(parentUrl);
      const folderName = segments[segments.length - 1] || "/";

      const virtualNode: SitemapNode = {
        id: parentUrl,
        url: parentUrl,
        title: folderName,
        statusCode: 200, // Virtual folders are "successful"
        status: "success",
        depth: segments.length, // Depth based on path segments
        children: [],
        isBroken: false,
        nodeType: "page",
        isVirtual: true, // Mark as virtual
      };

      nodesMap.set(parentUrl, virtualNode);

      // Continue walking up
      currentUrl = parentUrl;
      parentUrl = getPathParent(currentUrl);
    }
  });

  // Now build parent-child relationships based on path hierarchy
  nodesMap.forEach((node) => {
    if (node.id === rootNode!.id) return; // Skip root

    // Get path-based parent (not the link-based parent)
    const parentUrl = getPathParent(node.id);

    if (parentUrl) {
      const parent = nodesMap.get(normalizeUrl(parentUrl));
      if (parent && !parent.children.find((child) => child.id === node.id)) {
        parent.children.push(node);
        node.parentId = parent.id;

        // Update depth to be parent depth + 1
        node.depth = parent.depth + 1;
      }
    } else {
      // No parent means this is a direct child of root
      if (!rootNode!.children.find((child) => child.id === node.id)) {
        rootNode!.children.push(node);
        node.parentId = rootNode!.id;
        node.depth = 1;
      }
    }
  });

  // Update depths recursively to ensure consistency
  function updateDepths(node: SitemapNode, depth: number) {
    node.depth = depth;
    node.children.forEach((child) => updateDepths(child, depth + 1));
  }
  updateDepths(rootNode, 0);

  return rootNode;
}

export function flattenTree(root: SitemapNode): SitemapNode[] {
  const result: SitemapNode[] = [];

  function traverse(node: SitemapNode) {
    result.push(node);
    node.children.forEach((child) => traverse(child));
  }

  traverse(root);
  return result;
}

export function getTreeStats(root: SitemapNode) {
  const nodes = flattenTree(root);

  return {
    totalPages: nodes.length,
    brokenLinks: nodes.filter((n) => n.isBroken).length,
    maxDepth: Math.max(...nodes.map((n) => n.depth), 0),
    successPages: nodes.filter((n) => n.status === "success").length,
    redirectPages: nodes.filter((n) => n.status === "redirect").length,
    apiEndpoints: nodes.filter((n) => n.isApiEndpoint).length,
  };
}
