import { Node } from "@xyflow/react";
import { SitemapNode } from "@/types/sitemap";
import { CustomNodeData } from "@/types/flow";
import { SITEMAP_COLORS, SITEMAP_SPACING, SITEMAP_TYPOGRAPHY } from "./constants";

/**
 * Determines node style - compact text-based design
 */
function getNodeStyle(sitemapNode: SitemapNode) {
  const isRoot = sitemapNode.depth === 0 && sitemapNode.nodeType === "page";

  // Root node - larger, more prominent
  if (isRoot) {
    return {
      background: SITEMAP_COLORS.root.background,
      border: `${SITEMAP_SPACING.rootNode.borderWidth}px solid ${SITEMAP_COLORS.root.border}`,
      color: SITEMAP_COLORS.root.text,
      padding: `${SITEMAP_SPACING.rootNode.padding}px`,
      minWidth: `${SITEMAP_SPACING.rootNode.minWidth}px`,
      fontSize: SITEMAP_TYPOGRAPHY.root.titleSize,
      fontWeight: SITEMAP_TYPOGRAPHY.root.titleWeight,
      fontFamily: "ui-monospace, monospace",
    };
  }

  // API endpoint nodes - blue tint
  if (sitemapNode.isApiEndpoint) {
    const opacity = Math.max(0.7, 1 - sitemapNode.depth * 0.08);
    return {
      background: SITEMAP_COLORS.api.background,
      border: `${SITEMAP_SPACING.regularNode.borderWidth}px solid ${SITEMAP_COLORS.api.border}`,
      color: SITEMAP_COLORS.api.text,
      padding: `${SITEMAP_SPACING.regularNode.padding}px`,
      minWidth: `${SITEMAP_SPACING.regularNode.minWidth}px`,
      fontSize: SITEMAP_TYPOGRAPHY.regular.titleSize,
      fontWeight: SITEMAP_TYPOGRAPHY.regular.titleWeight,
      fontFamily: "ui-monospace, monospace",
      opacity,
    };
  }

  // Regular nodes - compact
  // Determine which color scheme to use based on status
  const colors: { background: string; border: string; text: string; shadow: string } =
    sitemapNode.isBroken || sitemapNode.statusCode >= 400
      ? SITEMAP_COLORS.error
      : sitemapNode.statusCode >= 300 && sitemapNode.statusCode < 400
        ? SITEMAP_COLORS.redirect
        : SITEMAP_COLORS.success;

  // Fade deeper nodes slightly
  const opacity = Math.max(0.7, 1 - sitemapNode.depth * 0.08);

  return {
    background: colors.background,
    border: `${SITEMAP_SPACING.regularNode.borderWidth}px solid ${colors.border}`,
    color: colors.text,
    padding: `${SITEMAP_SPACING.regularNode.padding}px`,
    minWidth: `${SITEMAP_SPACING.regularNode.minWidth}px`,
    fontSize: SITEMAP_TYPOGRAPHY.regular.titleSize,
    fontWeight: SITEMAP_TYPOGRAPHY.regular.titleWeight,
    fontFamily: "ui-monospace, monospace",
    opacity,
  };
}

/**
 * Creates a styled React Flow node from a sitemap node
 */
export function createFlowNode(
  sitemapNode: SitemapNode,
  position: { x: number; y: number }
): Node<CustomNodeData> {
  const childCount = sitemapNode.children.length;

  return {
    id: sitemapNode.id,
    type: "custom",
    position,
    data: {
      label: sitemapNode.title,
      url: sitemapNode.url,
      statusCode: sitemapNode.statusCode,
      isBroken: sitemapNode.isBroken,
      depth: sitemapNode.depth,
      title: sitemapNode.title,
      childCount,
      nodeType: sitemapNode.nodeType,
      isVirtual: sitemapNode.isVirtual,
      isApiEndpoint: sitemapNode.isApiEndpoint,
    },
    style: getNodeStyle(sitemapNode),
  };
}
