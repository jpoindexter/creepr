import { NodeType } from "@/types/sitemap";

export interface CrawlerOptions {
  maxDepth?: number;
  maxPages?: number;
  timeout?: number;
  userAgent?: string;
  interactiveMode?: boolean; // Enable interactive element detection
}

export interface CrawlProgress {
  pagesVisited: number;
  pagesQueued: number;
  currentUrl: string;
}

// Meta tag information
export interface MetaInfo {
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  robots?: string;
  keywords?: string;
}

// Heading information
export interface HeadingInfo {
  tag: string; // h1, h2, h3, etc.
  text: string;
}

// Image information
export interface ImageInfo {
  src: string;
  alt?: string;
  hasAlt: boolean;
  loading?: string; // lazy, eager, auto
}

// Link with anchor text
export interface LinkInfo {
  url: string;
  anchorText: string;
  title?: string;
}

// Content metrics
export interface ContentMetrics {
  wordCount: number;
  scriptCount: number;
  stylesheetCount: number;
  imageCount: number;
  formCount: number;
}

// Inline style tag content
export interface InlineStyle {
  content: string;
  mediaQuery?: string; // If style has media attribute
}

// External stylesheet reference
export interface ExternalStylesheet {
  href: string;
  content?: string; // Fetched CSS content
  mediaQuery?: string;
  fetchError?: string; // If failed to fetch
}

// CSS custom properties (variables)
export interface CSSVariables {
  [key: string]: string; // --color-primary: #6b5ce7
}

// Computed styles for key elements (for design system analysis)
export interface ElementStyles {
  selector: string; // e.g., "button.primary", "h1", ".card"
  element: string; // Tag name
  classes: string[];
  computedStyles: {
    // Typography
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textTransform?: string;
    // Colors
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    // Spacing
    padding?: string;
    margin?: string;
    gap?: string;
    // Border & Shape
    borderRadius?: string;
    borderWidth?: string;
    borderStyle?: string;
    // Shadow
    boxShadow?: string;
    textShadow?: string;
    // Layout
    display?: string;
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
    // Size
    width?: string;
    height?: string;
    maxWidth?: string;
    minHeight?: string;
  };
}

// Full style information for a page
export interface PageStyles {
  // All inline <style> tag contents
  inlineStyles: InlineStyle[];
  // All linked stylesheets with their content
  externalStylesheets: ExternalStylesheet[];
  // CSS custom properties from :root
  cssVariables: CSSVariables;
  // Computed styles for key UI elements (buttons, headings, cards, etc.)
  elementStyles: ElementStyles[];
  // Raw CSS text (all styles concatenated for easy searching)
  rawCSS: string;
  // Summary stats
  totalRules: number;
  uniqueColors: string[];
  uniqueFonts: string[];
  uniqueBorderRadii: string[];
  uniqueSpacings: string[];
}

export interface PageInfo {
  url: string;
  title: string;
  statusCode: number;
  links: string[];
  depth: number;
  parentUrl?: string;
  error?: string;
  // New fields for interactive mode
  nodeType?: NodeType;
  interactionType?: "click" | "hover" | "expand";
  parentPageUrl?: string;
  // Enhanced SEO/AI fields
  meta?: MetaInfo;
  headings?: HeadingInfo[];
  images?: ImageInfo[];
  linksWithText?: LinkInfo[];
  contentMetrics?: ContentMetrics;
  // Full style extraction for design system analysis
  styles?: PageStyles;
}
