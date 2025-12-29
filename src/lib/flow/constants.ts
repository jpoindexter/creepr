/**
 * Visual constants for React Flow sitemap visualization
 * Based on professional sitemap design patterns (Backlinko-inspired)
 */

export const SITEMAP_COLORS = {
  // Root/Homepage node - Black, high contrast on white bg
  root: {
    background: "#0A0A0A", // Near black
    border: "#000000", // Pure black border
    text: "#FFFFFF", // White text
    shadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },

  // Success status (200-299) - Dark node
  success: {
    background: "#1A1A1A", // Dark background
    border: "#333333", // Dark border
    text: "#FFFFFF", // White text
    shadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },

  // Redirect status (300-399) - Medium gray
  redirect: {
    background: "#4A4A4A", // Medium gray
    border: "#666666", // Medium border
    text: "#FFFFFF", // White text
    shadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },

  // Error status (400-599) - Lighter gray (muted)
  error: {
    background: "#888888", // Light gray for errors
    border: "#AAAAAA", // Light border
    text: "#FFFFFF", // White text
    shadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },

  // Interactive element types - Grayscale variants
  tab: {
    background: "#2A2A2A",
    border: "#444444",
    text: "#FFFFFF",
    shadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },

  modal: {
    background: "#333333",
    border: "#555555",
    text: "#FFFFFF",
    shadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },

  accordion: {
    background: "#3A3A3A",
    border: "#5A5A5A",
    text: "#FFFFFF",
    shadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },

  dropdown: {
    background: "#404040",
    border: "#606060",
    text: "#FFFFFF",
    shadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },

  button: {
    background: "#484848",
    border: "#686868",
    text: "#FFFFFF",
    shadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },

  // API endpoint - Distinguished with blue tint
  api: {
    background: "#1a365d", // Dark blue
    border: "#2a4a7f", // Medium blue border
    text: "#FFFFFF",
    shadow: "0 2px 6px rgba(26, 54, 93, 0.2)",
  },

  // Edge colors - Dark on white bg, by link status
  edge: {
    success: "#333333", // Dark gray for success
    redirect: "#666666", // Medium gray for redirects
    clientError: "#999999", // Light gray for 4xx errors
    serverError: "#AAAAAA", // Lighter gray for 5xx errors
    unknown: "#888888", // Default gray for unknown
    hover: "#000000", // Pure black on hover
    // Legacy compatibility
    normal: "#333333",
    broken: "#888888",
  },
} as const;

export const SITEMAP_SPACING = {
  // Layout spacing - compact for text-based tree
  rankSeparation: 80, // Vertical spacing between hierarchy levels
  nodeSeparation: 40, // Horizontal spacing between sibling nodes
  marginX: 30, // Left/right margins
  marginY: 30, // Top/bottom margins

  // Node sizing - compact text-based nodes
  rootNode: {
    minWidth: 180,
    padding: 12,
    borderRadius: 0,
    borderWidth: 2,
  },
  regularNode: {
    minWidth: 140,
    padding: 8,
    borderRadius: 0,
    borderWidth: 1,
  },

  // Edge styling
  edgeStrokeWidth: 1,
} as const;

export const SITEMAP_TYPOGRAPHY = {
  root: {
    titleSize: "13px",
    titleWeight: "600",
    urlSize: "11px",
    urlWeight: "400",
  },
  regular: {
    titleSize: "12px",
    titleWeight: "500",
    urlSize: "10px",
    urlWeight: "400",
  },
  badge: {
    fontSize: "9px",
    fontWeight: "500",
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
    nodeSpacing: 25,
    rankSpacing: 50,
    description: "Tight spacing for large sitemaps",
  },
  balanced: {
    nodeSpacing: 40,
    rankSpacing: 80,
    description: "Default spacing",
  },
  spacious: {
    nodeSpacing: 60,
    rankSpacing: 120,
    description: "Generous spacing",
  },
} as const;
