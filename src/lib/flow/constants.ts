/**
 * Visual constants for React Flow sitemap visualization
 * Based on professional sitemap design patterns (Backlinko-inspired)
 */

export const SITEMAP_COLORS = {
  // Root/Homepage node
  root: {
    background:
      "linear-gradient(135deg, oklch(70.28% 0.1753 295.36) 0%, oklch(60% 0.18 295.36) 100%)",
    border: "oklch(60% 0.18 295.36)",
    text: "#FFFFFF",
    shadow: "0 4px 12px rgba(153, 69, 255, 0.3)",
  },

  // Success status (200-299)
  success: {
    background: "#FFFFFF",
    border: "oklch(70.28% 0.1753 295.36)", // Purple theme
    text: "#1A202C",
    shadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },

  // Redirect status (300-399)
  redirect: {
    background: "#FEF3C7", // Light yellow
    border: "#F59E0B", // Orange
    text: "#78350F",
    shadow: "0 2px 8px rgba(245, 158, 11, 0.2)",
  },

  // Error status (400-599)
  error: {
    background: "#FEE2E2", // Light red
    border: "#DC2626", // Red
    text: "#991B1B",
    shadow: "0 2px 8px rgba(220, 38, 38, 0.2)",
  },

  // Edge colors
  edge: {
    normal: "#CBD5E0", // Light gray
    broken: "#DC2626", // Red for broken links
    hover: "oklch(70.28% 0.1753 295.36)", // Purple on hover
  },
} as const;

export const SITEMAP_SPACING = {
  // Layout spacing
  rankSeparation: 100, // Vertical spacing between hierarchy levels
  nodeSeparation: 80, // Horizontal spacing between sibling nodes
  marginX: 40, // Left/right margins
  marginY: 40, // Top/bottom margins

  // Node sizing
  rootNode: {
    minWidth: 200,
    padding: 20,
    borderRadius: 12,
    borderWidth: 3,
  },
  regularNode: {
    minWidth: 160,
    padding: 16,
    borderRadius: 10,
    borderWidth: 3,
  },

  // Edge styling
  edgeStrokeWidth: 2,
} as const;

export const SITEMAP_TYPOGRAPHY = {
  root: {
    titleSize: "16px",
    titleWeight: "600",
    urlSize: "13px",
    urlWeight: "400",
  },
  regular: {
    titleSize: "14px",
    titleWeight: "500",
    urlSize: "12px",
    urlWeight: "400",
  },
  badge: {
    fontSize: "11px",
    fontWeight: "600",
  },
} as const;

export const SITEMAP_EFFECTS = {
  hover: {
    scale: 1.02,
    shadowIntensity: 1.5, // Multiply shadow strength
  },
  transition: {
    duration: "0.2s",
    easing: "ease-out",
  },
} as const;
