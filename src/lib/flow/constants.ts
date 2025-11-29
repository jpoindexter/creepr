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
    shadow: "0 8px 24px rgba(153, 69, 255, 0.25), 0 4px 8px rgba(0, 0, 0, 0.1)",
  },

  // Success status (200-299)
  success: {
    background: "#FFFFFF",
    border: "oklch(70.28% 0.1753 295.36)", // Purple theme
    text: "#1A202C",
    shadow: "0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)",
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
  // Layout spacing - generous spacing for professional appearance and readability
  rankSeparation: 150, // Vertical spacing between hierarchy levels
  nodeSeparation: 120, // Horizontal spacing between sibling nodes
  marginX: 40, // Left/right margins
  marginY: 40, // Top/bottom margins

  // Node sizing - spacious and readable like professional sitemap tools
  rootNode: {
    minWidth: 320,
    padding: 24,
    borderRadius: 16,
    borderWidth: 3,
  },
  regularNode: {
    minWidth: 280,
    padding: 24,
    borderRadius: 14,
    borderWidth: 3,
  },

  // Edge styling
  edgeStrokeWidth: 2,
} as const;

export const SITEMAP_TYPOGRAPHY = {
  root: {
    titleSize: "20px",
    titleWeight: "700",
    urlSize: "15px",
    urlWeight: "400",
  },
  regular: {
    titleSize: "17px",
    titleWeight: "600",
    urlSize: "14px",
    urlWeight: "400",
  },
  badge: {
    fontSize: "12px",
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
    nodeSpacing: 80,
    rankSpacing: 100,
    description: "Tighter spacing for large sitemaps (100+ nodes)",
  },
  balanced: {
    nodeSpacing: 120,
    rankSpacing: 150,
    description: "Default professional spacing (recommended)",
  },
  spacious: {
    nodeSpacing: 160,
    rankSpacing: 200,
    description: "Maximum spacing for presentations",
  },
} as const;
