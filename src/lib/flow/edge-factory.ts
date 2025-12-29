import { Edge } from "@xyflow/react";
import { CustomEdgeData } from "@/types/flow";
import { LinkStatus } from "@/types/sitemap";
import { SITEMAP_COLORS, SITEMAP_SPACING } from "./constants";

/**
 * Get edge color based on link status
 */
function getEdgeColor(status: LinkStatus): string {
  switch (status) {
    case "success":
      return SITEMAP_COLORS.edge.success;
    case "redirect":
      return SITEMAP_COLORS.edge.redirect;
    case "client-error":
      return SITEMAP_COLORS.edge.clientError;
    case "server-error":
      return SITEMAP_COLORS.edge.serverError;
    default:
      return SITEMAP_COLORS.edge.unknown;
  }
}

/**
 * Creates a styled React Flow edge with professional sitemap styling
 * Colors indicate link status: success (dark), redirect (medium), error (light)
 */
export function createFlowEdge(
  sourceId: string,
  targetId: string,
  status: LinkStatus,
  isBroken: boolean
): Edge<CustomEdgeData> {
  const isError = status === "client-error" || status === "server-error" || isBroken;
  const isRedirect = status === "redirect";

  return {
    id: `${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    type: "smoothstep", // 90-degree corners like professional sitemaps
    animated: false,
    data: {
      isBroken,
      status,
    },
    className: `sitemap-edge ${isError ? "broken" : ""} ${isRedirect ? "redirect" : ""}`,
    style: {
      stroke: getEdgeColor(status),
      strokeWidth: SITEMAP_SPACING.edgeStrokeWidth,
      strokeDasharray: isError ? "5,5" : isRedirect ? "3,3" : undefined, // Dashed for errors, dotted for redirects
    },
    markerEnd: undefined, // No arrow markers for cleaner look
  };
}
