import { Edge } from "@xyflow/react";
import { CustomEdgeData } from "@/types/flow";
import { SITEMAP_COLORS, SITEMAP_SPACING } from "./constants";

/**
 * Creates a styled React Flow edge with professional sitemap styling
 */
export function createFlowEdge(
  sourceId: string,
  targetId: string,
  isBroken: boolean
): Edge<CustomEdgeData> {
  return {
    id: `${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    type: "smoothstep", // 90-degree corners like professional sitemaps
    animated: false,
    data: {
      isBroken,
    },
    className: `sitemap-edge ${isBroken ? "broken" : ""}`,
    style: {
      stroke: isBroken ? SITEMAP_COLORS.edge.broken : SITEMAP_COLORS.edge.normal,
      strokeWidth: SITEMAP_SPACING.edgeStrokeWidth,
      strokeDasharray: isBroken ? "5,5" : undefined, // Dashed for broken links
    },
    markerEnd: undefined, // No arrow markers for cleaner look
  };
}
