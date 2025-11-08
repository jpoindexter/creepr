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

  // Interactive element types
  tab: {
    background: "#DBEAFE", // Light blue
    border: "#3B82F6", // Blue
    text: "#1E40AF",
    shadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
  },

  modal: {
    background: "#FEF3C7", // Light yellow
    border: "#F59E0B", // Orange
    text: "#92400E",
    shadow: "0 2px 8px rgba(245, 158, 11, 0.2)",
  },

  accordion: {
    background: "#D1FAE5", // Light green
    border: "#10B981", // Green
    text: "#065F46",
    shadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
  },

  dropdown: {
    background: "#FFEDD5", // Light orange
    border: "#F97316", // Orange
    text: "#9A3412",
    shadow: "0 2px 8px rgba(249, 115, 22, 0.2)",
  },

  button: {
    background: "#F3F4F6", // Light gray
    border: "#6B7280", // Gray
    text: "#374151",
    shadow: "0 2px 8px rgba(107, 114, 128, 0.2)",
  },

  // Edge colors
  edge: {
    normal: "#CBD5E0", // Light gray
    broken: "#DC2626", // Red for broken links
    hover: "oklch(70.28% 0.1753 295.36)", // Purple on hover
  },
} as const;

export const SITEMAP_SPACING = {
  // Layout spacing - compact for interactive mode with many elements
  rankSeparation: 60, // Vertical spacing between hierarchy levels (reduced from 100)
  nodeSeparation: 40, // Horizontal spacing between sibling nodes (reduced from 80)
  marginX: 20, // Left/right margins (reduced from 40)
  marginY: 20, // Top/bottom margins (reduced from 40)

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

/**
 * Layout presets for different use cases
 */
export const LAYOUT_PRESETS = {
  compact: {
    nodeSpacing: 20,
    rankSpacing: 40,
    description: "Tight spacing for large sitemaps (100+ nodes)",
  },
  balanced: {
    nodeSpacing: 40,
    rankSpacing: 60,
    description: "Default balanced spacing",
  },
  spacious: {
    nodeSpacing: 80,
    rankSpacing: 100,
    description: "Generous spacing for presentations",
  },
} as const;
