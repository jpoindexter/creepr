/**
 * Design System Auditor Type Definitions
 */

export interface AuditViolation {
  file: string;
  line: number;
  column?: number;
  code: string;
  context?: string;
}

/**
 * Represents an actual inconsistency - when multiple patterns
 * are used for the same type of styling
 */
export interface Inconsistency {
  category: string;
  description: string;
  dominantPattern: string;
  dominantCount: number;
  dominantPercentage: number;
  outliers: Array<{
    pattern: string;
    count: number;
    percentage: number;
    files: Array<{ file: string; line: number }>;
  }>;
  severity: "critical" | "warning" | "info";
  recommendation: string;
}

/**
 * Summary of inconsistencies found
 */
export interface InconsistencySummary {
  totalInconsistencies: number;
  critical: number;
  warning: number;
  info: number;
  inconsistencies: Inconsistency[];
}

export interface AuditCategory {
  pattern: string;
  regex: RegExp;
  description: string;
  count: number;
  violations: AuditViolation[];
}

export interface DesignSystemAuditReport {
  generatedAt: string;
  totalFiles: number;
  totalPatterns: number;
  categories: {
    colors: {
      bgColors: AuditCategory;
      textColors: AuditCategory;
      borderColors: AuditCategory;
      ringColors: AuditCategory;
      hexColors: AuditCategory;
      rgbColors: AuditCategory;
      hslColors: AuditCategory;
      oklchColors: AuditCategory;
      cssVarColors: AuditCategory;
    };
    spacing: {
      padding: AuditCategory;
      margin: AuditCategory;
      gap: AuditCategory;
      space: AuditCategory;
    };
    sizing: {
      width: AuditCategory;
      height: AuditCategory;
      maxWidth: AuditCategory;
      maxHeight: AuditCategory;
      minWidth: AuditCategory;
      minHeight: AuditCategory;
    };
    borderRadius: {
      all: AuditCategory;
    };
    borders: {
      borderWidth: AuditCategory;
      borderStyle: AuditCategory;
    };
    shadows: {
      all: AuditCategory;
    };
    typography: {
      fontSize: AuditCategory;
      fontWeight: AuditCategory;
      fontFamily: AuditCategory;
      lineHeight: AuditCategory;
      letterSpacing: AuditCategory;
      textAlign: AuditCategory;
    };
    layout: {
      display: AuditCategory;
      flex: AuditCategory;
      grid: AuditCategory;
      position: AuditCategory;
      zIndex: AuditCategory;
    };
    effects: {
      opacity: AuditCategory;
      blur: AuditCategory;
      transition: AuditCategory;
      animation: AuditCategory;
    };
    cssVariables: {
      spacing: AuditCategory;
      sizing: AuditCategory;
      radius: AuditCategory;
      shadow: AuditCategory;
      font: AuditCategory;
    };
    inlineStyles: {
      colors: AuditCategory;
      spacing: AuditCategory;
      sizing: AuditCategory;
      fonts: AuditCategory;
    };
    interactivity: {
      cursor: AuditCategory;
      pointerEvents: AuditCategory;
      userSelect: AuditCategory;
      scroll: AuditCategory;
    };
    visibility: {
      overflow: AuditCategory;
      visibility: AuditCategory;
      truncate: AuditCategory;
    };
    transforms: {
      scale: AuditCategory;
      rotate: AuditCategory;
      translate: AuditCategory;
      skew: AuditCategory;
      origin: AuditCategory;
    };
    filters: {
      blur: AuditCategory;
      brightness: AuditCategory;
      contrast: AuditCategory;
      grayscale: AuditCategory;
      saturate: AuditCategory;
      invert: AuditCategory;
      sepia: AuditCategory;
      dropShadow: AuditCategory;
    };
    gradients: {
      direction: AuditCategory;
      stops: AuditCategory;
    };
    textStyles: {
      decoration: AuditCategory;
      transform: AuditCategory;
      indent: AuditCategory;
      verticalAlign: AuditCategory;
    };
    objectFit: {
      fit: AuditCategory;
      position: AuditCategory;
    };
    aspectRatio: {
      all: AuditCategory;
    };
    outlines: {
      width: AuditCategory;
      style: AuditCategory;
      color: AuditCategory;
      offset: AuditCategory;
    };
    rings: {
      width: AuditCategory;
      offset: AuditCategory;
      inset: AuditCategory;
    };
    divide: {
      width: AuditCategory;
      color: AuditCategory;
      style: AuditCategory;
    };
    dynamicClasses: {
      templateLiterals: AuditCategory;
      clsxCn: AuditCategory;
      conditionalClasses: AuditCategory;
    };
    jsVariables: {
      colorVars: AuditCategory;
      spacingVars: AuditCategory;
      sizeVars: AuditCategory;
      styleObjects: AuditCategory;
    };
    themeConfig: {
      tailwindExtend: AuditCategory;
      cssVariableDeclarations: AuditCategory;
      scssVariables: AuditCategory;
    };
  };
  patternSummary: Record<string, number>;
  summary: string;
  inconsistencies: InconsistencySummary;
}
