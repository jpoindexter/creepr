import { PageInfo } from "../crawler/types";
import { SitemapNode } from "@/types/sitemap";
import { getLinkStatus } from "../crawler/link-validator";
import { isBrokenLink } from "../utils";

export function buildSitemapTree(pages: PageInfo[], rootUrl: string): SitemapNode {
  // Create a map for quick lookup
  const pageMap = new Map<string, PageInfo>();
  pages.forEach((page) => pageMap.set(page.url, page));

  // Create nodes map
  const nodesMap = new Map<string, SitemapNode>();

  // Create all nodes first
  pages.forEach((page) => {
    const node: SitemapNode = {
      id: page.url,
      url: page.url,
      title: page.title,
      statusCode: page.statusCode,
      status: getLinkStatus(page.statusCode),
      depth: page.depth,
      children: [],
      parentId: page.parentUrl,
      isBroken: isBrokenLink(page.statusCode),
    };
    nodesMap.set(page.url, node);
  });

  // Find root node
  let rootNode = nodesMap.get(rootUrl);

  if (!rootNode) {
    // Create a default root if not found
    rootNode = {
      id: rootUrl,
      url: rootUrl,
      title: "Root",
      statusCode: 200,
      status: "success",
      depth: 0,
      children: [],
      isBroken: false,
    };
    nodesMap.set(rootUrl, rootNode);
  }

  // Build parent-child relationships
  nodesMap.forEach((node) => {
    if (node.parentId && node.parentId !== node.id) {
      const parent = nodesMap.get(node.parentId);
      if (parent && !parent.children.find((child) => child.id === node.id)) {
        parent.children.push(node);
      }
    }
  });

  // Collect orphaned nodes (nodes without parents that aren't the root)
  const orphanedNodes: SitemapNode[] = [];
  nodesMap.forEach((node) => {
    if (node.id !== rootNode!.id && (!node.parentId || !nodesMap.has(node.parentId))) {
      orphanedNodes.push(node);
    }
  });

  // Attach orphaned nodes to root
  orphanedNodes.forEach((orphan) => {
    if (!rootNode!.children.find((child) => child.id === orphan.id)) {
      rootNode!.children.push(orphan);
      orphan.parentId = rootNode!.id;
    }
  });

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
  };
}
