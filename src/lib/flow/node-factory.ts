import { Node } from "@xyflow/react";
import { SitemapNode } from "@/types/sitemap";
import { CustomNodeData } from "@/types/flow";
import { SITEMAP_COLORS, SITEMAP_SPACING, SITEMAP_TYPOGRAPHY } from "./constants";

/**
 * Determines node style based on node type, status, and depth
 */
function getNodeStyle(sitemapNode: SitemapNode) {
  const isRoot = sitemapNode.depth === 0 && sitemapNode.nodeType === "page";

  // Root node gets special gradient styling
  if (isRoot) {
    return {
      background: SITEMAP_COLORS.root.background,
      border: `${SITEMAP_SPACING.rootNode.borderWidth}px solid ${SITEMAP_COLORS.root.border}`,
      borderRadius: `${SITEMAP_SPACING.rootNode.borderRadius}px`,
      color: SITEMAP_COLORS.root.text,
      padding: `${SITEMAP_SPACING.rootNode.padding}px`,
      minWidth: `${SITEMAP_SPACING.rootNode.minWidth}px`,
      boxShadow: SITEMAP_COLORS.root.shadow,
      fontSize: SITEMAP_TYPOGRAPHY.root.titleSize,
      fontWeight: SITEMAP_TYPOGRAPHY.root.titleWeight,
    };
  }

  // Interactive elements get their own styling
  if (sitemapNode.nodeType !== "page") {
    const interactiveColors =
      SITEMAP_COLORS[
        sitemapNode.nodeType as keyof Pick<
          typeof SITEMAP_COLORS,
          "tab" | "modal" | "accordion" | "dropdown" | "button"
        >
      ];

    return {
      background: interactiveColors.background,
      border: `${SITEMAP_SPACING.regularNode.borderWidth}px solid ${interactiveColors.border}`,
      borderRadius: `${SITEMAP_SPACING.regularNode.borderRadius}px`,
      color: interactiveColors.text,
      padding: `${SITEMAP_SPACING.regularNode.padding}px`,
      minWidth: `${SITEMAP_SPACING.regularNode.minWidth}px`,
      boxShadow: interactiveColors.shadow,
      fontSize: SITEMAP_TYPOGRAPHY.regular.titleSize,
      fontWeight: SITEMAP_TYPOGRAPHY.regular.titleWeight,
      opacity: 0.95, // Slightly transparent to distinguish from pages
    };
  }

  // Page nodes: Determine status-based styling
  let colorScheme:
    | (typeof SITEMAP_COLORS)["success"]
    | (typeof SITEMAP_COLORS)["error"]
    | (typeof SITEMAP_COLORS)["redirect"] = SITEMAP_COLORS.success;

  if (sitemapNode.isBroken || sitemapNode.statusCode >= 400) {
    colorScheme = SITEMAP_COLORS.error;
  } else if (sitemapNode.statusCode >= 300 && sitemapNode.statusCode < 400) {
    colorScheme = SITEMAP_COLORS.redirect;
  }

  // Apply depth-based opacity for deeper nodes
  const depthOpacity = Math.max(0.6, 1 - sitemapNode.depth * 0.1);

  return {
    background: colorScheme.background,
    border: `${SITEMAP_SPACING.regularNode.borderWidth}px solid ${colorScheme.border}`,
    borderRadius: `${SITEMAP_SPACING.regularNode.borderRadius}px`,
    color: colorScheme.text,
    padding: `${SITEMAP_SPACING.regularNode.padding}px`,
    minWidth: `${SITEMAP_SPACING.regularNode.minWidth}px`,
    boxShadow: colorScheme.shadow,
    fontSize: SITEMAP_TYPOGRAPHY.regular.titleSize,
    fontWeight: SITEMAP_TYPOGRAPHY.regular.titleWeight,
    opacity: depthOpacity,
  };
}

/**
 * Creates a styled React Flow node from a sitemap node
 */
export function createFlowNode(
  sitemapNode: SitemapNode,
  position: { x: number; y: number }
): Node<CustomNodeData> {
  const isRoot = sitemapNode.depth === 0;
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
    },
    style: getNodeStyle(sitemapNode),
    className: `sitemap-node ${sitemapNode.isBroken ? "broken" : ""} ${isRoot ? "root" : ""}`,
  };
}
