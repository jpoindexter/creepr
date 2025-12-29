/**
 * Comprehensive Design System Auditor
 * Scans ALL source files for design patterns using pattern matching
 * Returns results with file:line format for easy navigation
 *
 * ENHANCED: Now detects ACTUAL inconsistencies by:
 * - Identifying the dominant pattern (what most code uses)
 * - Flagging outliers (patterns that differ from the norm)
 * - Grouping related patterns to find conflicts
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
  // NEW: Actual inconsistency detection
  inconsistencies: InconsistencySummary;
}

// Generic pattern definitions - find ALL occurrences
const AUDIT_PATTERNS = {
  colors: {
    bgColors: {
      pattern: "bg-* colors",
      regex: /\bbg-[a-z]+-\d+\b|\bbg-[a-z]+\b/g,
      description: "Background color classes",
    },
    textColors: {
      pattern: "text-* colors",
      regex: /\btext-[a-z]+-\d+\b/g,
      description: "Text color classes",
    },
    borderColors: {
      pattern: "border-* colors",
      regex: /\bborder-[a-z]+-\d+\b/g,
      description: "Border color classes",
    },
    ringColors: {
      pattern: "ring-* colors",
      regex: /\bring-[a-z]+-\d+\b|\bring-[a-z]+\b/g,
      description: "Ring/outline color classes",
    },
    hexColors: {
      pattern: "#hex colors",
      regex: /#[A-Fa-f0-9]{3,8}\b/g,
      description: "Hardcoded hex color values",
    },
    rgbColors: {
      pattern: "rgb/rgba colors",
      regex: /rgba?\([^)]+\)/g,
      description: "RGB/RGBA color values",
    },
    hslColors: {
      pattern: "hsl/hsla colors",
      regex: /hsla?\([^)]+\)/g,
      description: "HSL/HSLA color values",
    },
    oklchColors: {
      pattern: "oklch colors",
      regex: /oklch\([^)]+\)/g,
      description: "OKLCH color values",
    },
    cssVarColors: {
      pattern: "CSS variable colors",
      regex: /var\(--[a-z0-9-]*(color|bg|background|text|border|fill|stroke)[a-z0-9-]*\)/gi,
      description: "CSS variable colors",
    },
  },
  spacing: {
    padding: {
      pattern: "p-* padding",
      regex: /\bp[xytrbl]?-\d+(?:\.\d+)?\b|\bp[xytrbl]?-\[\d+[a-z]+\]/g,
      description: "Padding classes",
    },
    margin: {
      pattern: "m-* margin",
      regex: /\b-?m[xytrbl]?-\d+(?:\.\d+)?\b|\b-?m[xytrbl]?-\[\d+[a-z]+\]/g,
      description: "Margin classes",
    },
    gap: {
      pattern: "gap-* spacing",
      regex: /\bgap-[xy]?-?\d+\b|\bgap-\[\d+[a-z]+\]/g,
      description: "Gap/flex spacing classes",
    },
    space: {
      pattern: "space-* spacing",
      regex: /\bspace-[xy]-\d+\b|\bspace-[xy]-\[\d+[a-z]+\]/g,
      description: "Space between classes",
    },
  },
  sizing: {
    width: {
      pattern: "w-* width",
      regex: /\bw-\d+\b|\bw-\[\d+[a-z%]+\]|\bw-(full|screen|auto|min|max|fit)\b/g,
      description: "Width classes",
    },
    height: {
      pattern: "h-* height",
      regex: /\bh-\d+\b|\bh-\[\d+[a-z%]+\]|\bh-(full|screen|auto|min|max|fit)\b/g,
      description: "Height classes",
    },
    maxWidth: {
      pattern: "max-w-* max-width",
      regex: /\bmax-w-[a-z0-9]+\b|\bmax-w-\[\d+[a-z%]+\]/g,
      description: "Max-width classes",
    },
    maxHeight: {
      pattern: "max-h-* max-height",
      regex: /\bmax-h-[a-z0-9]+\b|\bmax-h-\[\d+[a-z%]+\]/g,
      description: "Max-height classes",
    },
    minWidth: {
      pattern: "min-w-* min-width",
      regex: /\bmin-w-[a-z0-9]+\b|\bmin-w-\[\d+[a-z%]+\]/g,
      description: "Min-width classes",
    },
    minHeight: {
      pattern: "min-h-* min-height",
      regex: /\bmin-h-[a-z0-9]+\b|\bmin-h-\[\d+[a-z%]+\]/g,
      description: "Min-height classes",
    },
  },
  borderRadius: {
    all: {
      pattern: "rounded-* borders",
      regex: /\brounded(-[a-z0-9]+)*\b/g,
      description: "Border radius classes",
    },
  },
  borders: {
    borderWidth: {
      pattern: "border-* width",
      regex: /\bborder(-[trbl])?(-\d+)?\b/g,
      description: "Border width classes",
    },
    borderStyle: {
      pattern: "border-* style",
      regex: /\bborder-(solid|dashed|dotted|double|hidden|none)\b/g,
      description: "Border style classes",
    },
  },
  shadows: {
    all: {
      pattern: "shadow-* effects",
      regex: /\bshadow(-[a-z0-9]+)*\b/g,
      description: "Shadow classes",
    },
  },
  typography: {
    fontSize: {
      pattern: "text-* sizes",
      regex: /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/g,
      description: "Font size classes",
    },
    fontWeight: {
      pattern: "font-* weights",
      regex: /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g,
      description: "Font weight classes",
    },
    fontFamily: {
      pattern: "font-* families",
      regex: /\bfont-(sans|serif|mono)\b/g,
      description: "Font family classes",
    },
    lineHeight: {
      pattern: "leading-* line-height",
      regex: /\bleading-[a-z0-9]+\b/g,
      description: "Line height classes",
    },
    letterSpacing: {
      pattern: "tracking-* letter-spacing",
      regex: /\btracking-[a-z]+\b/g,
      description: "Letter spacing classes",
    },
    textAlign: {
      pattern: "text-* alignment",
      regex: /\btext-(left|center|right|justify|start|end)\b/g,
      description: "Text alignment classes",
    },
  },
  layout: {
    display: {
      pattern: "display classes",
      regex:
        /\b(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden|contents|flow-root)\b/g,
      description: "Display classes",
    },
    flex: {
      pattern: "flex-* classes",
      regex: /\bflex(-[a-z0-9]+)*\b|\bitems-[a-z]+\b|\bjustify-[a-z]+\b|\bself-[a-z]+\b/g,
      description: "Flex layout classes",
    },
    grid: {
      pattern: "grid-* classes",
      regex: /\bgrid(-[a-z0-9]+)*\b|\bcol-[a-z0-9-]+\b|\brow-[a-z0-9-]+\b/g,
      description: "Grid layout classes",
    },
    position: {
      pattern: "position classes",
      regex:
        /\b(static|fixed|absolute|relative|sticky)\b|\b(top|right|bottom|left|inset)-[a-z0-9-]+\b/g,
      description: "Position classes",
    },
    zIndex: {
      pattern: "z-* classes",
      regex: /\bz-\d+\b|\bz-\[\d+\]|\bz-(auto)\b/g,
      description: "Z-index classes",
    },
  },
  effects: {
    opacity: {
      pattern: "opacity-* classes",
      regex: /\bopacity-\d+\b/g,
      description: "Opacity classes",
    },
    blur: {
      pattern: "blur-* classes",
      regex: /\bblur(-[a-z0-9]+)?\b|\bbackdrop-blur(-[a-z0-9]+)?\b/g,
      description: "Blur effect classes",
    },
    transition: {
      pattern: "transition-* classes",
      regex: /\btransition(-[a-z]+)?\b|\bduration-\d+\b|\bease-[a-z-]+\b|\bdelay-\d+\b/g,
      description: "Transition classes",
    },
    animation: {
      pattern: "animate-* classes",
      regex: /\banimate-[a-z-]+\b/g,
      description: "Animation classes",
    },
  },
  cssVariables: {
    spacing: {
      pattern: "CSS var spacing",
      regex: /var\(--[a-z0-9-]*(space|spacing|gap|padding|margin|inset)[a-z0-9-]*\)/gi,
      description: "CSS variable spacing",
    },
    sizing: {
      pattern: "CSS var sizing",
      regex: /var\(--[a-z0-9-]*(width|height|size)[a-z0-9-]*\)/gi,
      description: "CSS variable sizing",
    },
    radius: {
      pattern: "CSS var radius",
      regex: /var\(--[a-z0-9-]*(radius|rounded)[a-z0-9-]*\)/gi,
      description: "CSS variable border radius",
    },
    shadow: {
      pattern: "CSS var shadow",
      regex: /var\(--[a-z0-9-]*(shadow)[a-z0-9-]*\)/gi,
      description: "CSS variable shadows",
    },
    font: {
      pattern: "CSS var font",
      regex: /var\(--[a-z0-9-]*(font|text|leading|tracking)[a-z0-9-]*\)/gi,
      description: "CSS variable typography",
    },
  },
  inlineStyles: {
    colors: {
      pattern: "inline color styles",
      regex: /(color|backgroundColor|borderColor|fill|stroke)\s*[:=]\s*['"`][^'"`]+['"`]/g,
      description: "Inline style colors",
    },
    spacing: {
      pattern: "inline spacing styles",
      regex: /(padding|margin|gap|top|right|bottom|left)\s*[:=]\s*['"`]?\d+[a-z%]*['"`]?/gi,
      description: "Inline style spacing",
    },
    sizing: {
      pattern: "inline sizing styles",
      regex:
        /(width|height|maxWidth|maxHeight|minWidth|minHeight)\s*[:=]\s*['"`]?\d+[a-z%]*['"`]?/gi,
      description: "Inline style sizing",
    },
    fonts: {
      pattern: "inline font styles",
      regex:
        /(fontSize|fontWeight|fontFamily|lineHeight|letterSpacing)\s*[:=]\s*['"`]?[^,;}]+['"`]?/gi,
      description: "Inline style fonts",
    },
  },
  interactivity: {
    cursor: {
      pattern: "cursor-* classes",
      regex:
        /\bcursor-(pointer|default|wait|text|move|not-allowed|grab|grabbing|auto|none|crosshair|help)\b/g,
      description: "Cursor classes",
    },
    pointerEvents: {
      pattern: "pointer-events-* classes",
      regex: /\bpointer-events-(none|auto)\b/g,
      description: "Pointer events classes",
    },
    userSelect: {
      pattern: "select-* classes",
      regex: /\bselect-(none|text|all|auto)\b/g,
      description: "User select classes",
    },
    scroll: {
      pattern: "scroll-* classes",
      regex:
        /\bscroll-(auto|smooth|snap-[a-z]+|m[trblxy]?-\d+|p[trblxy]?-\d+)\b|\bsnap-(start|end|center|align-none|normal|always)\b|\boverscroll-(auto|contain|none)\b/g,
      description: "Scroll behavior classes",
    },
  },
  visibility: {
    overflow: {
      pattern: "overflow-* classes",
      regex: /\boverflow(-[xy])?-(auto|hidden|visible|scroll|clip)\b/g,
      description: "Overflow classes",
    },
    visibility: {
      pattern: "visibility classes",
      regex: /\b(visible|invisible|collapse)\b/g,
      description: "Visibility classes",
    },
    truncate: {
      pattern: "truncate/whitespace classes",
      regex:
        /\b(truncate|whitespace-(normal|nowrap|pre|pre-line|pre-wrap|break-spaces))\b|\btext-(ellipsis|clip)\b|\bline-clamp-\d+\b/g,
      description: "Text truncation classes",
    },
  },
  transforms: {
    scale: {
      pattern: "scale-* classes",
      regex: /\bscale(-[xy])?-\d+\b/g,
      description: "Scale transform classes",
    },
    rotate: {
      pattern: "rotate-* classes",
      regex: /\b-?rotate-\d+\b/g,
      description: "Rotate transform classes",
    },
    translate: {
      pattern: "translate-* classes",
      regex: /\b-?translate-[xy]-\d+\b|\b-?translate-[xy]-\[\d+[a-z%]+\]/g,
      description: "Translate transform classes",
    },
    skew: {
      pattern: "skew-* classes",
      regex: /\b-?skew-[xy]-\d+\b/g,
      description: "Skew transform classes",
    },
    origin: {
      pattern: "origin-* classes",
      regex:
        /\borigin-(center|top|top-right|right|bottom-right|bottom|bottom-left|left|top-left)\b/g,
      description: "Transform origin classes",
    },
  },
  filters: {
    blur: {
      pattern: "blur filter classes",
      regex: /\bblur(-[a-z0-9]+)?\b|\bbackdrop-blur(-[a-z0-9]+)?\b/g,
      description: "Blur filter classes",
    },
    brightness: {
      pattern: "brightness-* classes",
      regex: /\bbrightness-\d+\b|\bbackdrop-brightness-\d+\b/g,
      description: "Brightness filter classes",
    },
    contrast: {
      pattern: "contrast-* classes",
      regex: /\bcontrast-\d+\b|\bbackdrop-contrast-\d+\b/g,
      description: "Contrast filter classes",
    },
    grayscale: {
      pattern: "grayscale classes",
      regex: /\bgrayscale(-0)?\b|\bbackdrop-grayscale(-0)?\b/g,
      description: "Grayscale filter classes",
    },
    saturate: {
      pattern: "saturate-* classes",
      regex: /\bsaturate-\d+\b|\bbackdrop-saturate-\d+\b/g,
      description: "Saturate filter classes",
    },
    invert: {
      pattern: "invert classes",
      regex: /\binvert(-0)?\b|\bbackdrop-invert(-0)?\b/g,
      description: "Invert filter classes",
    },
    sepia: {
      pattern: "sepia classes",
      regex: /\bsepia(-0)?\b|\bbackdrop-sepia(-0)?\b/g,
      description: "Sepia filter classes",
    },
    dropShadow: {
      pattern: "drop-shadow-* classes",
      regex: /\bdrop-shadow(-[a-z0-9]+)?\b/g,
      description: "Drop shadow filter classes",
    },
  },
  gradients: {
    direction: {
      pattern: "bg-gradient-* classes",
      regex: /\bbg-gradient-to-(t|tr|r|br|b|bl|l|tl)\b/g,
      description: "Gradient direction classes",
    },
    stops: {
      pattern: "gradient stop classes",
      regex: /\b(from|via|to)-[a-z]+-\d+\b|\b(from|via|to)-\[[^\]]+\]/g,
      description: "Gradient color stops",
    },
  },
  textStyles: {
    decoration: {
      pattern: "text decoration classes",
      regex:
        /\b(underline|overline|line-through|no-underline)\b|\bdecoration-(solid|double|dotted|dashed|wavy)\b|\bdecoration-[a-z]+-\d+\b|\bdecoration-\d+\b/g,
      description: "Text decoration classes",
    },
    transform: {
      pattern: "text transform classes",
      regex: /\b(uppercase|lowercase|capitalize|normal-case)\b/g,
      description: "Text transform classes",
    },
    indent: {
      pattern: "text indent classes",
      regex: /\bindent-\d+\b/g,
      description: "Text indent classes",
    },
    verticalAlign: {
      pattern: "vertical align classes",
      regex: /\balign-(baseline|top|middle|bottom|text-top|text-bottom|sub|super)\b/g,
      description: "Vertical align classes",
    },
  },
  objectFit: {
    fit: {
      pattern: "object-* classes",
      regex: /\bobject-(contain|cover|fill|none|scale-down)\b/g,
      description: "Object fit classes",
    },
    position: {
      pattern: "object-position classes",
      regex:
        /\bobject-(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)\b/g,
      description: "Object position classes",
    },
  },
  aspectRatio: {
    all: {
      pattern: "aspect-* classes",
      regex: /\baspect-(auto|square|video|\[\d+\/\d+\])\b/g,
      description: "Aspect ratio classes",
    },
  },
  outlines: {
    width: {
      pattern: "outline-* width",
      regex: /\boutline(-\d+)?\b/g,
      description: "Outline width classes",
    },
    style: {
      pattern: "outline style classes",
      regex: /\boutline-(none|dashed|dotted|double)\b/g,
      description: "Outline style classes",
    },
    color: {
      pattern: "outline-* colors",
      regex: /\boutline-[a-z]+-\d+\b/g,
      description: "Outline color classes",
    },
    offset: {
      pattern: "outline-offset-* classes",
      regex: /\boutline-offset-\d+\b/g,
      description: "Outline offset classes",
    },
  },
  rings: {
    width: {
      pattern: "ring-* width",
      regex: /\bring(-\d+)?\b/g,
      description: "Ring width classes",
    },
    offset: {
      pattern: "ring-offset-* classes",
      regex: /\bring-offset-\d+\b|\bring-offset-[a-z]+-\d+\b/g,
      description: "Ring offset classes",
    },
    inset: {
      pattern: "ring-inset class",
      regex: /\bring-inset\b/g,
      description: "Ring inset class",
    },
  },
  divide: {
    width: {
      pattern: "divide-* width",
      regex: /\bdivide-[xy](-\d+)?\b/g,
      description: "Divide width classes",
    },
    color: {
      pattern: "divide-* colors",
      regex: /\bdivide-[a-z]+-\d+\b/g,
      description: "Divide color classes",
    },
    style: {
      pattern: "divide-* style",
      regex: /\bdivide-(solid|dashed|dotted|double|none)\b/g,
      description: "Divide style classes",
    },
  },
  dynamicClasses: {
    templateLiterals: {
      pattern: "template literal classes",
      regex:
        /`[^`]*\$\{[^}]*(color|bg|text|border|p-|m-|w-|h-|rounded|shadow|font|flex|grid)[^}]*\}[^`]*`/gi,
      description: "Dynamic template literal classes",
    },
    clsxCn: {
      pattern: "clsx/cn conditionals",
      regex: /\b(clsx|cn|classnames|twMerge)\s*\([^)]+\)/gi,
      description: "Conditional class utilities (clsx, cn, classnames)",
    },
    conditionalClasses: {
      pattern: "ternary class conditionals",
      regex:
        /\?\s*['"`][^'"`]*(?:bg-|text-|border-|p-|m-|w-|h-|rounded|shadow|flex|grid)[^'"`]*['"`]\s*:/g,
      description: "Ternary conditional classes",
    },
  },
  jsVariables: {
    colorVars: {
      pattern: "JS color variables",
      regex: /\b(const|let|var)\s+\w*(color|Color|COLOR)\w*\s*=\s*['"`][^'"`]+['"`]/gi,
      description: "JavaScript color variable declarations",
    },
    spacingVars: {
      pattern: "JS spacing variables",
      regex:
        /\b(const|let|var)\s+\w*(spacing|padding|margin|gap|Spacing|Padding|Margin|Gap)\w*\s*=\s*['"`\d][^;]*/gi,
      description: "JavaScript spacing variable declarations",
    },
    sizeVars: {
      pattern: "JS size variables",
      regex: /\b(const|let|var)\s+\w*(width|height|size|Width|Height|Size)\w*\s*=\s*['"`\d][^;]*/gi,
      description: "JavaScript size variable declarations",
    },
    styleObjects: {
      pattern: "style object literals",
      regex: /style\s*[=:]\s*\{\{?\s*[^}]+\}\}?/g,
      description: "Inline style object literals",
    },
  },
  themeConfig: {
    tailwindExtend: {
      pattern: "tailwind theme extend",
      regex: /theme\s*:\s*\{[\s\S]*?extend\s*:\s*\{[\s\S]*?\}/g,
      description: "Tailwind theme.extend configuration",
    },
    cssVariableDeclarations: {
      pattern: "CSS variable declarations",
      regex: /--[a-z][a-z0-9-]*\s*:\s*[^;]+;/gi,
      description: "CSS custom property declarations",
    },
    scssVariables: {
      pattern: "SCSS/Less variables",
      regex: /\$[a-z][a-z0-9-]*\s*:\s*[^;]+;|@[a-z][a-z0-9-]*\s*:\s*[^;]+;/gi,
      description: "SCSS/Less variable declarations",
    },
  },
};

function findPatterns(content: string, filePath: string, regex: RegExp): AuditViolation[] {
  const patterns: AuditViolation[] = [];
  const lines = content.split("\n");

  // Reset regex lastIndex for global regex
  regex.lastIndex = 0;

  let match;
  while ((match = regex.exec(content)) !== null) {
    // Find line number
    const textBeforeMatch = content.substring(0, match.index);
    const lineNumber = textBeforeMatch.split("\n").length;
    const lineContent = lines[lineNumber - 1] || "";

    // Find column
    const lastNewlineIndex = textBeforeMatch.lastIndexOf("\n");
    const column = match.index - lastNewlineIndex;

    patterns.push({
      file: filePath,
      line: lineNumber,
      column,
      code: match[0],
      context: lineContent.trim().substring(0, 100),
    });
  }

  return patterns;
}

function countUniquePatterns(violations: AuditViolation[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const v of violations) {
    counts[v.code] = (counts[v.code] || 0) + 1;
  }
  return counts;
}

/**
 * Groups patterns by their "base" type to detect inconsistencies.
 * For example, "rounded-lg", "rounded-md", "rounded-sm" all belong to "rounded" group.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _groupPatternsByBase(violations: AuditViolation[]): Map<string, AuditViolation[]> {
  const groups = new Map<string, AuditViolation[]>();

  for (const v of violations) {
    // Extract base pattern (e.g., "rounded" from "rounded-lg", "p" from "p-4")
    const base = extractPatternBase(v.code);
    if (!groups.has(base)) {
      groups.set(base, []);
    }
    groups.get(base)!.push(v);
  }

  return groups;
}

/**
 * Extract the base pattern from a class name.
 * Examples:
 *   "rounded-lg" -> "rounded"
 *   "p-4" -> "p"
 *   "text-gray-500" -> "text-gray" (color group)
 *   "bg-blue-600" -> "bg-blue" (color group)
 */
function extractPatternBase(code: string): string {
  // Color patterns - group by color name (e.g., bg-blue, text-gray)
  const colorMatch = code.match(/^(bg|text|border|ring|outline|divide|from|via|to)-([a-z]+)/);
  if (colorMatch) {
    return `${colorMatch[1]}-${colorMatch[2]}`;
  }

  // Spacing patterns - group by direction (e.g., p, px, py, pt)
  const spacingMatch = code.match(/^(-?[pm][xytrbl]?)-/);
  if (spacingMatch) {
    return spacingMatch[1];
  }

  // Sizing patterns - group by dimension (w, h, max-w, etc.)
  const sizingMatch = code.match(/^(min-|max-)?(w|h)-/);
  if (sizingMatch) {
    return `${sizingMatch[1] || ""}${sizingMatch[2]}`;
  }

  // Rounded patterns - all are one group
  if (code.startsWith("rounded")) {
    return "rounded";
  }

  // Shadow patterns - all are one group
  if (code.startsWith("shadow")) {
    return "shadow";
  }

  // Font size - group text sizes
  const textSizeMatch = code.match(/^text-(xs|sm|base|lg|xl|[2-9]xl)/);
  if (textSizeMatch) {
    return "text-size";
  }

  // Gap patterns
  if (code.startsWith("gap")) {
    return "gap";
  }

  // Z-index patterns
  if (code.startsWith("z-")) {
    return "z-index";
  }

  // Default: use the first segment before "-" or the whole code
  const dashIndex = code.indexOf("-");
  return dashIndex > 0 ? code.substring(0, dashIndex) : code;
}

/**
 * Detect actual inconsistencies in a category.
 * An inconsistency is when:
 * 1. Multiple different patterns are used for the same styling purpose
 * 2. There's a clear dominant pattern (>50% usage) with outliers
 */
function detectCategoryInconsistencies(
  categoryName: string,
  categoryDescription: string,
  violations: AuditViolation[]
): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];

  if (violations.length < 2) return inconsistencies;

  // Count unique patterns
  const patternCounts = countUniquePatterns(violations);
  const uniquePatterns = Object.keys(patternCounts);

  // If only one pattern, no inconsistency
  if (uniquePatterns.length <= 1) return inconsistencies;

  // Group violations by their pattern for file references
  const violationsByPattern = new Map<string, AuditViolation[]>();
  for (const v of violations) {
    if (!violationsByPattern.has(v.code)) {
      violationsByPattern.set(v.code, []);
    }
    violationsByPattern.get(v.code)!.push(v);
  }

  // Group patterns by their base type
  const baseGroups = new Map<string, string[]>();
  for (const pattern of uniquePatterns) {
    const base = extractPatternBase(pattern);
    if (!baseGroups.has(base)) {
      baseGroups.set(base, []);
    }
    baseGroups.get(base)!.push(pattern);
  }

  // Check each base group for inconsistencies
  for (const [base, patterns] of baseGroups) {
    if (patterns.length < 2) continue;

    // Calculate totals for this group
    const groupTotal = patterns.reduce((sum, p) => sum + patternCounts[p], 0);

    // Sort by count descending
    const sortedPatterns = patterns.sort((a, b) => patternCounts[b] - patternCounts[a]);

    const dominantPattern = sortedPatterns[0];
    const dominantCount = patternCounts[dominantPattern];
    const dominantPercentage = Math.round((dominantCount / groupTotal) * 100);

    // Only flag as inconsistency if:
    // 1. There are multiple variants (patterns.length > 1)
    // 2. AND either:
    //    a. There's a clear dominant pattern (>60%) with outliers
    //    b. OR the distribution is too fragmented (no pattern > 40% and many variants)
    const outlierPatterns = sortedPatterns.slice(1);
    const hasSignificantOutliers = outlierPatterns.some(
      (p) => patternCounts[p] >= 2 // At least 2 occurrences to be significant
    );

    if (!hasSignificantOutliers) continue;

    // Determine severity
    let severity: "critical" | "warning" | "info";
    if (dominantPercentage >= 70 && outlierPatterns.length > 0) {
      // Clear dominant with outliers - likely accidental inconsistency
      severity = "warning";
    } else if (dominantPercentage < 40 && patterns.length >= 3) {
      // Highly fragmented - no clear standard
      severity = "critical";
    } else {
      severity = "info";
    }

    // Build outliers list
    const outliers = outlierPatterns
      .filter((p) => patternCounts[p] >= 2)
      .map((pattern) => {
        const count = patternCounts[pattern];
        const percentage = Math.round((count / groupTotal) * 100);
        const patternViolations = violationsByPattern.get(pattern) || [];

        return {
          pattern,
          count,
          percentage,
          files: patternViolations.slice(0, 5).map((v) => ({
            file: v.file,
            line: v.line,
          })),
        };
      });

    if (outliers.length === 0) continue;

    // Generate recommendation
    let recommendation: string;
    if (dominantPercentage >= 60) {
      recommendation = `Standardize on \`${dominantPattern}\` (currently ${dominantPercentage}% of usage). Update ${outliers.reduce((sum, o) => sum + o.count, 0)} outlier occurrences.`;
    } else {
      recommendation = `Define a standard for ${base} patterns. Consider using \`${dominantPattern}\` as the base and update inconsistent usages.`;
    }

    inconsistencies.push({
      category: categoryName,
      description: `${categoryDescription}: Multiple "${base}" variants detected`,
      dominantPattern,
      dominantCount,
      dominantPercentage,
      outliers,
      severity,
      recommendation,
    });
  }

  return inconsistencies;
}

/**
 * Detect inconsistencies across all categories
 */
function detectAllInconsistencies(
  categories: DesignSystemAuditReport["categories"]
): InconsistencySummary {
  const allInconsistencies: Inconsistency[] = [];

  // Map of category groups to human-readable names
  const categoryNames: Record<string, string> = {
    colors: "Colors",
    spacing: "Spacing",
    sizing: "Sizing",
    borderRadius: "Border Radius",
    borders: "Borders",
    shadows: "Shadows",
    typography: "Typography",
    layout: "Layout",
    effects: "Effects",
  };

  // Process each category group
  for (const [groupKey, groupName] of Object.entries(categoryNames)) {
    const categoryGroup = categories[groupKey as keyof typeof categories];
    if (!categoryGroup) continue;

    // Combine all violations in this group for better analysis
    for (const [, category] of Object.entries(categoryGroup as Record<string, AuditCategory>)) {
      if (category.count < 2) continue;

      const inconsistencies = detectCategoryInconsistencies(
        groupName,
        category.description,
        category.violations
      );

      allInconsistencies.push(...inconsistencies);
    }
  }

  // Sort by severity (critical > warning > info)
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  allInconsistencies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    totalInconsistencies: allInconsistencies.length,
    critical: allInconsistencies.filter((i) => i.severity === "critical").length,
    warning: allInconsistencies.filter((i) => i.severity === "warning").length,
    info: allInconsistencies.filter((i) => i.severity === "info").length,
    inconsistencies: allInconsistencies,
  };
}

export function createEmptyReport(): DesignSystemAuditReport {
  return {
    generatedAt: new Date().toISOString(),
    totalFiles: 0,
    totalPatterns: 0,
    categories: {
      colors: {
        bgColors: { ...AUDIT_PATTERNS.colors.bgColors, count: 0, violations: [] },
        textColors: { ...AUDIT_PATTERNS.colors.textColors, count: 0, violations: [] },
        borderColors: { ...AUDIT_PATTERNS.colors.borderColors, count: 0, violations: [] },
        ringColors: { ...AUDIT_PATTERNS.colors.ringColors, count: 0, violations: [] },
        hexColors: { ...AUDIT_PATTERNS.colors.hexColors, count: 0, violations: [] },
        rgbColors: { ...AUDIT_PATTERNS.colors.rgbColors, count: 0, violations: [] },
        hslColors: { ...AUDIT_PATTERNS.colors.hslColors, count: 0, violations: [] },
        oklchColors: { ...AUDIT_PATTERNS.colors.oklchColors, count: 0, violations: [] },
        cssVarColors: { ...AUDIT_PATTERNS.colors.cssVarColors, count: 0, violations: [] },
      },
      spacing: {
        padding: { ...AUDIT_PATTERNS.spacing.padding, count: 0, violations: [] },
        margin: { ...AUDIT_PATTERNS.spacing.margin, count: 0, violations: [] },
        gap: { ...AUDIT_PATTERNS.spacing.gap, count: 0, violations: [] },
        space: { ...AUDIT_PATTERNS.spacing.space, count: 0, violations: [] },
      },
      sizing: {
        width: { ...AUDIT_PATTERNS.sizing.width, count: 0, violations: [] },
        height: { ...AUDIT_PATTERNS.sizing.height, count: 0, violations: [] },
        maxWidth: { ...AUDIT_PATTERNS.sizing.maxWidth, count: 0, violations: [] },
        maxHeight: { ...AUDIT_PATTERNS.sizing.maxHeight, count: 0, violations: [] },
        minWidth: { ...AUDIT_PATTERNS.sizing.minWidth, count: 0, violations: [] },
        minHeight: { ...AUDIT_PATTERNS.sizing.minHeight, count: 0, violations: [] },
      },
      borderRadius: {
        all: { ...AUDIT_PATTERNS.borderRadius.all, count: 0, violations: [] },
      },
      borders: {
        borderWidth: { ...AUDIT_PATTERNS.borders.borderWidth, count: 0, violations: [] },
        borderStyle: { ...AUDIT_PATTERNS.borders.borderStyle, count: 0, violations: [] },
      },
      shadows: {
        all: { ...AUDIT_PATTERNS.shadows.all, count: 0, violations: [] },
      },
      typography: {
        fontSize: { ...AUDIT_PATTERNS.typography.fontSize, count: 0, violations: [] },
        fontWeight: { ...AUDIT_PATTERNS.typography.fontWeight, count: 0, violations: [] },
        fontFamily: { ...AUDIT_PATTERNS.typography.fontFamily, count: 0, violations: [] },
        lineHeight: { ...AUDIT_PATTERNS.typography.lineHeight, count: 0, violations: [] },
        letterSpacing: { ...AUDIT_PATTERNS.typography.letterSpacing, count: 0, violations: [] },
        textAlign: { ...AUDIT_PATTERNS.typography.textAlign, count: 0, violations: [] },
      },
      layout: {
        display: { ...AUDIT_PATTERNS.layout.display, count: 0, violations: [] },
        flex: { ...AUDIT_PATTERNS.layout.flex, count: 0, violations: [] },
        grid: { ...AUDIT_PATTERNS.layout.grid, count: 0, violations: [] },
        position: { ...AUDIT_PATTERNS.layout.position, count: 0, violations: [] },
        zIndex: { ...AUDIT_PATTERNS.layout.zIndex, count: 0, violations: [] },
      },
      effects: {
        opacity: { ...AUDIT_PATTERNS.effects.opacity, count: 0, violations: [] },
        blur: { ...AUDIT_PATTERNS.effects.blur, count: 0, violations: [] },
        transition: { ...AUDIT_PATTERNS.effects.transition, count: 0, violations: [] },
        animation: { ...AUDIT_PATTERNS.effects.animation, count: 0, violations: [] },
      },
      cssVariables: {
        spacing: { ...AUDIT_PATTERNS.cssVariables.spacing, count: 0, violations: [] },
        sizing: { ...AUDIT_PATTERNS.cssVariables.sizing, count: 0, violations: [] },
        radius: { ...AUDIT_PATTERNS.cssVariables.radius, count: 0, violations: [] },
        shadow: { ...AUDIT_PATTERNS.cssVariables.shadow, count: 0, violations: [] },
        font: { ...AUDIT_PATTERNS.cssVariables.font, count: 0, violations: [] },
      },
      inlineStyles: {
        colors: { ...AUDIT_PATTERNS.inlineStyles.colors, count: 0, violations: [] },
        spacing: { ...AUDIT_PATTERNS.inlineStyles.spacing, count: 0, violations: [] },
        sizing: { ...AUDIT_PATTERNS.inlineStyles.sizing, count: 0, violations: [] },
        fonts: { ...AUDIT_PATTERNS.inlineStyles.fonts, count: 0, violations: [] },
      },
      interactivity: {
        cursor: { ...AUDIT_PATTERNS.interactivity.cursor, count: 0, violations: [] },
        pointerEvents: { ...AUDIT_PATTERNS.interactivity.pointerEvents, count: 0, violations: [] },
        userSelect: { ...AUDIT_PATTERNS.interactivity.userSelect, count: 0, violations: [] },
        scroll: { ...AUDIT_PATTERNS.interactivity.scroll, count: 0, violations: [] },
      },
      visibility: {
        overflow: { ...AUDIT_PATTERNS.visibility.overflow, count: 0, violations: [] },
        visibility: { ...AUDIT_PATTERNS.visibility.visibility, count: 0, violations: [] },
        truncate: { ...AUDIT_PATTERNS.visibility.truncate, count: 0, violations: [] },
      },
      transforms: {
        scale: { ...AUDIT_PATTERNS.transforms.scale, count: 0, violations: [] },
        rotate: { ...AUDIT_PATTERNS.transforms.rotate, count: 0, violations: [] },
        translate: { ...AUDIT_PATTERNS.transforms.translate, count: 0, violations: [] },
        skew: { ...AUDIT_PATTERNS.transforms.skew, count: 0, violations: [] },
        origin: { ...AUDIT_PATTERNS.transforms.origin, count: 0, violations: [] },
      },
      filters: {
        blur: { ...AUDIT_PATTERNS.filters.blur, count: 0, violations: [] },
        brightness: { ...AUDIT_PATTERNS.filters.brightness, count: 0, violations: [] },
        contrast: { ...AUDIT_PATTERNS.filters.contrast, count: 0, violations: [] },
        grayscale: { ...AUDIT_PATTERNS.filters.grayscale, count: 0, violations: [] },
        saturate: { ...AUDIT_PATTERNS.filters.saturate, count: 0, violations: [] },
        invert: { ...AUDIT_PATTERNS.filters.invert, count: 0, violations: [] },
        sepia: { ...AUDIT_PATTERNS.filters.sepia, count: 0, violations: [] },
        dropShadow: { ...AUDIT_PATTERNS.filters.dropShadow, count: 0, violations: [] },
      },
      gradients: {
        direction: { ...AUDIT_PATTERNS.gradients.direction, count: 0, violations: [] },
        stops: { ...AUDIT_PATTERNS.gradients.stops, count: 0, violations: [] },
      },
      textStyles: {
        decoration: { ...AUDIT_PATTERNS.textStyles.decoration, count: 0, violations: [] },
        transform: { ...AUDIT_PATTERNS.textStyles.transform, count: 0, violations: [] },
        indent: { ...AUDIT_PATTERNS.textStyles.indent, count: 0, violations: [] },
        verticalAlign: { ...AUDIT_PATTERNS.textStyles.verticalAlign, count: 0, violations: [] },
      },
      objectFit: {
        fit: { ...AUDIT_PATTERNS.objectFit.fit, count: 0, violations: [] },
        position: { ...AUDIT_PATTERNS.objectFit.position, count: 0, violations: [] },
      },
      aspectRatio: {
        all: { ...AUDIT_PATTERNS.aspectRatio.all, count: 0, violations: [] },
      },
      outlines: {
        width: { ...AUDIT_PATTERNS.outlines.width, count: 0, violations: [] },
        style: { ...AUDIT_PATTERNS.outlines.style, count: 0, violations: [] },
        color: { ...AUDIT_PATTERNS.outlines.color, count: 0, violations: [] },
        offset: { ...AUDIT_PATTERNS.outlines.offset, count: 0, violations: [] },
      },
      rings: {
        width: { ...AUDIT_PATTERNS.rings.width, count: 0, violations: [] },
        offset: { ...AUDIT_PATTERNS.rings.offset, count: 0, violations: [] },
        inset: { ...AUDIT_PATTERNS.rings.inset, count: 0, violations: [] },
      },
      divide: {
        width: { ...AUDIT_PATTERNS.divide.width, count: 0, violations: [] },
        color: { ...AUDIT_PATTERNS.divide.color, count: 0, violations: [] },
        style: { ...AUDIT_PATTERNS.divide.style, count: 0, violations: [] },
      },
      dynamicClasses: {
        templateLiterals: {
          ...AUDIT_PATTERNS.dynamicClasses.templateLiterals,
          count: 0,
          violations: [],
        },
        clsxCn: { ...AUDIT_PATTERNS.dynamicClasses.clsxCn, count: 0, violations: [] },
        conditionalClasses: {
          ...AUDIT_PATTERNS.dynamicClasses.conditionalClasses,
          count: 0,
          violations: [],
        },
      },
      jsVariables: {
        colorVars: { ...AUDIT_PATTERNS.jsVariables.colorVars, count: 0, violations: [] },
        spacingVars: { ...AUDIT_PATTERNS.jsVariables.spacingVars, count: 0, violations: [] },
        sizeVars: { ...AUDIT_PATTERNS.jsVariables.sizeVars, count: 0, violations: [] },
        styleObjects: { ...AUDIT_PATTERNS.jsVariables.styleObjects, count: 0, violations: [] },
      },
      themeConfig: {
        tailwindExtend: { ...AUDIT_PATTERNS.themeConfig.tailwindExtend, count: 0, violations: [] },
        cssVariableDeclarations: {
          ...AUDIT_PATTERNS.themeConfig.cssVariableDeclarations,
          count: 0,
          violations: [],
        },
        scssVariables: { ...AUDIT_PATTERNS.themeConfig.scssVariables, count: 0, violations: [] },
      },
    },
    patternSummary: {},
    summary: "",
    inconsistencies: {
      totalInconsistencies: 0,
      critical: 0,
      warning: 0,
      info: 0,
      inconsistencies: [],
    },
  };
}

export function runDesignSystemAudit(
  files: Array<{ path: string; content: string }>
): DesignSystemAuditReport {
  const report: DesignSystemAuditReport = {
    generatedAt: new Date().toISOString(),
    totalFiles: files.length,
    totalPatterns: 0,
    categories: {
      colors: {
        bgColors: { ...AUDIT_PATTERNS.colors.bgColors, count: 0, violations: [] },
        textColors: { ...AUDIT_PATTERNS.colors.textColors, count: 0, violations: [] },
        borderColors: { ...AUDIT_PATTERNS.colors.borderColors, count: 0, violations: [] },
        ringColors: { ...AUDIT_PATTERNS.colors.ringColors, count: 0, violations: [] },
        hexColors: { ...AUDIT_PATTERNS.colors.hexColors, count: 0, violations: [] },
        rgbColors: { ...AUDIT_PATTERNS.colors.rgbColors, count: 0, violations: [] },
        hslColors: { ...AUDIT_PATTERNS.colors.hslColors, count: 0, violations: [] },
        oklchColors: { ...AUDIT_PATTERNS.colors.oklchColors, count: 0, violations: [] },
        cssVarColors: { ...AUDIT_PATTERNS.colors.cssVarColors, count: 0, violations: [] },
      },
      spacing: {
        padding: { ...AUDIT_PATTERNS.spacing.padding, count: 0, violations: [] },
        margin: { ...AUDIT_PATTERNS.spacing.margin, count: 0, violations: [] },
        gap: { ...AUDIT_PATTERNS.spacing.gap, count: 0, violations: [] },
        space: { ...AUDIT_PATTERNS.spacing.space, count: 0, violations: [] },
      },
      sizing: {
        width: { ...AUDIT_PATTERNS.sizing.width, count: 0, violations: [] },
        height: { ...AUDIT_PATTERNS.sizing.height, count: 0, violations: [] },
        maxWidth: { ...AUDIT_PATTERNS.sizing.maxWidth, count: 0, violations: [] },
        maxHeight: { ...AUDIT_PATTERNS.sizing.maxHeight, count: 0, violations: [] },
        minWidth: { ...AUDIT_PATTERNS.sizing.minWidth, count: 0, violations: [] },
        minHeight: { ...AUDIT_PATTERNS.sizing.minHeight, count: 0, violations: [] },
      },
      borderRadius: {
        all: { ...AUDIT_PATTERNS.borderRadius.all, count: 0, violations: [] },
      },
      borders: {
        borderWidth: { ...AUDIT_PATTERNS.borders.borderWidth, count: 0, violations: [] },
        borderStyle: { ...AUDIT_PATTERNS.borders.borderStyle, count: 0, violations: [] },
      },
      shadows: {
        all: { ...AUDIT_PATTERNS.shadows.all, count: 0, violations: [] },
      },
      typography: {
        fontSize: { ...AUDIT_PATTERNS.typography.fontSize, count: 0, violations: [] },
        fontWeight: { ...AUDIT_PATTERNS.typography.fontWeight, count: 0, violations: [] },
        fontFamily: { ...AUDIT_PATTERNS.typography.fontFamily, count: 0, violations: [] },
        lineHeight: { ...AUDIT_PATTERNS.typography.lineHeight, count: 0, violations: [] },
        letterSpacing: { ...AUDIT_PATTERNS.typography.letterSpacing, count: 0, violations: [] },
        textAlign: { ...AUDIT_PATTERNS.typography.textAlign, count: 0, violations: [] },
      },
      layout: {
        display: { ...AUDIT_PATTERNS.layout.display, count: 0, violations: [] },
        flex: { ...AUDIT_PATTERNS.layout.flex, count: 0, violations: [] },
        grid: { ...AUDIT_PATTERNS.layout.grid, count: 0, violations: [] },
        position: { ...AUDIT_PATTERNS.layout.position, count: 0, violations: [] },
        zIndex: { ...AUDIT_PATTERNS.layout.zIndex, count: 0, violations: [] },
      },
      effects: {
        opacity: { ...AUDIT_PATTERNS.effects.opacity, count: 0, violations: [] },
        blur: { ...AUDIT_PATTERNS.effects.blur, count: 0, violations: [] },
        transition: { ...AUDIT_PATTERNS.effects.transition, count: 0, violations: [] },
        animation: { ...AUDIT_PATTERNS.effects.animation, count: 0, violations: [] },
      },
      cssVariables: {
        spacing: { ...AUDIT_PATTERNS.cssVariables.spacing, count: 0, violations: [] },
        sizing: { ...AUDIT_PATTERNS.cssVariables.sizing, count: 0, violations: [] },
        radius: { ...AUDIT_PATTERNS.cssVariables.radius, count: 0, violations: [] },
        shadow: { ...AUDIT_PATTERNS.cssVariables.shadow, count: 0, violations: [] },
        font: { ...AUDIT_PATTERNS.cssVariables.font, count: 0, violations: [] },
      },
      inlineStyles: {
        colors: { ...AUDIT_PATTERNS.inlineStyles.colors, count: 0, violations: [] },
        spacing: { ...AUDIT_PATTERNS.inlineStyles.spacing, count: 0, violations: [] },
        sizing: { ...AUDIT_PATTERNS.inlineStyles.sizing, count: 0, violations: [] },
        fonts: { ...AUDIT_PATTERNS.inlineStyles.fonts, count: 0, violations: [] },
      },
      interactivity: {
        cursor: { ...AUDIT_PATTERNS.interactivity.cursor, count: 0, violations: [] },
        pointerEvents: { ...AUDIT_PATTERNS.interactivity.pointerEvents, count: 0, violations: [] },
        userSelect: { ...AUDIT_PATTERNS.interactivity.userSelect, count: 0, violations: [] },
        scroll: { ...AUDIT_PATTERNS.interactivity.scroll, count: 0, violations: [] },
      },
      visibility: {
        overflow: { ...AUDIT_PATTERNS.visibility.overflow, count: 0, violations: [] },
        visibility: { ...AUDIT_PATTERNS.visibility.visibility, count: 0, violations: [] },
        truncate: { ...AUDIT_PATTERNS.visibility.truncate, count: 0, violations: [] },
      },
      transforms: {
        scale: { ...AUDIT_PATTERNS.transforms.scale, count: 0, violations: [] },
        rotate: { ...AUDIT_PATTERNS.transforms.rotate, count: 0, violations: [] },
        translate: { ...AUDIT_PATTERNS.transforms.translate, count: 0, violations: [] },
        skew: { ...AUDIT_PATTERNS.transforms.skew, count: 0, violations: [] },
        origin: { ...AUDIT_PATTERNS.transforms.origin, count: 0, violations: [] },
      },
      filters: {
        blur: { ...AUDIT_PATTERNS.filters.blur, count: 0, violations: [] },
        brightness: { ...AUDIT_PATTERNS.filters.brightness, count: 0, violations: [] },
        contrast: { ...AUDIT_PATTERNS.filters.contrast, count: 0, violations: [] },
        grayscale: { ...AUDIT_PATTERNS.filters.grayscale, count: 0, violations: [] },
        saturate: { ...AUDIT_PATTERNS.filters.saturate, count: 0, violations: [] },
        invert: { ...AUDIT_PATTERNS.filters.invert, count: 0, violations: [] },
        sepia: { ...AUDIT_PATTERNS.filters.sepia, count: 0, violations: [] },
        dropShadow: { ...AUDIT_PATTERNS.filters.dropShadow, count: 0, violations: [] },
      },
      gradients: {
        direction: { ...AUDIT_PATTERNS.gradients.direction, count: 0, violations: [] },
        stops: { ...AUDIT_PATTERNS.gradients.stops, count: 0, violations: [] },
      },
      textStyles: {
        decoration: { ...AUDIT_PATTERNS.textStyles.decoration, count: 0, violations: [] },
        transform: { ...AUDIT_PATTERNS.textStyles.transform, count: 0, violations: [] },
        indent: { ...AUDIT_PATTERNS.textStyles.indent, count: 0, violations: [] },
        verticalAlign: { ...AUDIT_PATTERNS.textStyles.verticalAlign, count: 0, violations: [] },
      },
      objectFit: {
        fit: { ...AUDIT_PATTERNS.objectFit.fit, count: 0, violations: [] },
        position: { ...AUDIT_PATTERNS.objectFit.position, count: 0, violations: [] },
      },
      aspectRatio: {
        all: { ...AUDIT_PATTERNS.aspectRatio.all, count: 0, violations: [] },
      },
      outlines: {
        width: { ...AUDIT_PATTERNS.outlines.width, count: 0, violations: [] },
        style: { ...AUDIT_PATTERNS.outlines.style, count: 0, violations: [] },
        color: { ...AUDIT_PATTERNS.outlines.color, count: 0, violations: [] },
        offset: { ...AUDIT_PATTERNS.outlines.offset, count: 0, violations: [] },
      },
      rings: {
        width: { ...AUDIT_PATTERNS.rings.width, count: 0, violations: [] },
        offset: { ...AUDIT_PATTERNS.rings.offset, count: 0, violations: [] },
        inset: { ...AUDIT_PATTERNS.rings.inset, count: 0, violations: [] },
      },
      divide: {
        width: { ...AUDIT_PATTERNS.divide.width, count: 0, violations: [] },
        color: { ...AUDIT_PATTERNS.divide.color, count: 0, violations: [] },
        style: { ...AUDIT_PATTERNS.divide.style, count: 0, violations: [] },
      },
      dynamicClasses: {
        templateLiterals: {
          ...AUDIT_PATTERNS.dynamicClasses.templateLiterals,
          count: 0,
          violations: [],
        },
        clsxCn: { ...AUDIT_PATTERNS.dynamicClasses.clsxCn, count: 0, violations: [] },
        conditionalClasses: {
          ...AUDIT_PATTERNS.dynamicClasses.conditionalClasses,
          count: 0,
          violations: [],
        },
      },
      jsVariables: {
        colorVars: { ...AUDIT_PATTERNS.jsVariables.colorVars, count: 0, violations: [] },
        spacingVars: { ...AUDIT_PATTERNS.jsVariables.spacingVars, count: 0, violations: [] },
        sizeVars: { ...AUDIT_PATTERNS.jsVariables.sizeVars, count: 0, violations: [] },
        styleObjects: { ...AUDIT_PATTERNS.jsVariables.styleObjects, count: 0, violations: [] },
      },
      themeConfig: {
        tailwindExtend: { ...AUDIT_PATTERNS.themeConfig.tailwindExtend, count: 0, violations: [] },
        cssVariableDeclarations: {
          ...AUDIT_PATTERNS.themeConfig.cssVariableDeclarations,
          count: 0,
          violations: [],
        },
        scssVariables: { ...AUDIT_PATTERNS.themeConfig.scssVariables, count: 0, violations: [] },
      },
    },
    patternSummary: {},
    summary: "",
    inconsistencies: {
      totalInconsistencies: 0,
      critical: 0,
      warning: 0,
      info: 0,
      inconsistencies: [],
    },
  };

  // Scan all files - iterate through all category groups dynamically
  for (const file of files) {
    for (const [groupName, categoryGroup] of Object.entries(report.categories)) {
      for (const [key, category] of Object.entries(
        categoryGroup as Record<string, AuditCategory>
      )) {
        const patterns = findPatterns(file.content, file.path, category.regex);
        (
          report.categories[groupName as keyof typeof report.categories] as Record<
            string,
            AuditCategory
          >
        )[key].violations.push(...patterns);
        (
          report.categories[groupName as keyof typeof report.categories] as Record<
            string,
            AuditCategory
          >
        )[key].count += patterns.length;
      }
    }
  }

  // Calculate totals and pattern summary
  let totalPatterns = 0;
  const allViolations: AuditViolation[] = [];

  for (const categoryGroup of Object.values(report.categories)) {
    for (const category of Object.values(categoryGroup)) {
      totalPatterns += category.count;
      allViolations.push(...category.violations);
    }
  }

  report.totalPatterns = totalPatterns;
  report.patternSummary = countUniquePatterns(allViolations);

  // Create summary with unique pattern counts per category group
  const getGroupUniqueCount = (group: Record<string, AuditCategory>) => {
    const allCodes = Object.values(group).flatMap((cat) => cat.violations.map((v) => v.code));
    return new Set(allCodes).size;
  };

  const uniqueColors = getGroupUniqueCount(report.categories.colors);
  const uniqueSpacing = getGroupUniqueCount(report.categories.spacing);
  const uniqueSizing = getGroupUniqueCount(report.categories.sizing);
  const uniqueRadius = getGroupUniqueCount(report.categories.borderRadius);
  const uniqueBorders = getGroupUniqueCount(report.categories.borders);
  const uniqueShadows = getGroupUniqueCount(report.categories.shadows);
  const uniqueTypography = getGroupUniqueCount(report.categories.typography);
  const uniqueLayout = getGroupUniqueCount(report.categories.layout);
  const uniqueEffects = getGroupUniqueCount(report.categories.effects);
  const uniqueCssVars = getGroupUniqueCount(report.categories.cssVariables);
  const uniqueInline = getGroupUniqueCount(report.categories.inlineStyles);

  const totalUnique =
    uniqueColors +
    uniqueSpacing +
    uniqueSizing +
    uniqueRadius +
    uniqueBorders +
    uniqueShadows +
    uniqueTypography +
    uniqueLayout +
    uniqueEffects +
    uniqueCssVars +
    uniqueInline;

  // Detect actual inconsistencies
  report.inconsistencies = detectAllInconsistencies(report.categories);

  // Update summary to include inconsistency info
  const inconsistencyInfo =
    report.inconsistencies.totalInconsistencies > 0
      ? ` Found ${report.inconsistencies.totalInconsistencies} inconsistencies (${report.inconsistencies.critical} critical, ${report.inconsistencies.warning} warnings).`
      : " No significant inconsistencies detected.";

  report.summary = `Scanned ${files.length} files. Found ${totalUnique} unique patterns: ${uniqueColors} colors, ${uniqueSpacing} spacing, ${uniqueSizing} sizing, ${uniqueTypography} typography, ${uniqueLayout} layout, ${uniqueEffects} effects, ${uniqueCssVars} CSS vars, ${uniqueInline} inline styles.${inconsistencyInfo}`;

  return report;
}

/**
 * Export audit report to Markdown format
 */
export function exportAuditToMarkdown(report: DesignSystemAuditReport): string {
  const lines: string[] = [];

  lines.push("# Design System Audit Report");
  lines.push("");
  lines.push(`**Generated:** ${new Date(report.generatedAt).toLocaleString()}`);
  lines.push(`**Files Scanned:** ${report.totalFiles}`);
  lines.push(`**Total Patterns Found:** ${report.totalPatterns}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push("");
  lines.push(report.summary);
  lines.push("");

  // Inconsistencies Section - Primary focus
  if (report.inconsistencies && report.inconsistencies.totalInconsistencies > 0) {
    lines.push("## Design System Inconsistencies");
    lines.push("");
    lines.push(`Found **${report.inconsistencies.totalInconsistencies}** inconsistencies:`);
    lines.push(`- ${report.inconsistencies.critical} Critical`);
    lines.push(`- ${report.inconsistencies.warning} Warnings`);
    lines.push(`- ${report.inconsistencies.info} Info`);
    lines.push("");

    // Group by severity
    const severityOrder = ["critical", "warning", "info"] as const;

    for (const severity of severityOrder) {
      const items = report.inconsistencies.inconsistencies.filter((i) => i.severity === severity);
      if (items.length === 0) continue;

      const emoji = severity === "critical" ? "🔴" : severity === "warning" ? "🟡" : "🔵";
      lines.push(
        `### ${emoji} ${severity.charAt(0).toUpperCase() + severity.slice(1)} (${items.length})`
      );
      lines.push("");

      for (const inc of items) {
        lines.push(`#### ${inc.description}`);
        lines.push("");
        lines.push(`**Recommendation:** ${inc.recommendation}`);
        lines.push("");
        lines.push(
          `**Dominant pattern:** \`${inc.dominantPattern}\` (${inc.dominantCount}x, ${inc.dominantPercentage}%)`
        );
        lines.push("");
        lines.push("**Outliers to fix:**");
        lines.push("");
        lines.push("| Pattern | Count | % | Locations |");
        lines.push("|---------|-------|---|-----------|");

        for (const outlier of inc.outliers) {
          const locations = outlier.files
            .slice(0, 3)
            .map((f) => `${f.file}:${f.line}`)
            .join(", ");
          const more = outlier.files.length > 3 ? ` (+${outlier.files.length - 3} more)` : "";
          lines.push(
            `| \`${outlier.pattern}\` | ${outlier.count} | ${outlier.percentage}% | ${locations}${more} |`
          );
        }
        lines.push("");
      }
    }

    lines.push("---");
    lines.push("");
  } else {
    lines.push("## Design System Inconsistencies");
    lines.push("");
    lines.push(
      "✅ **No significant inconsistencies detected.** Your design system patterns are consistent."
    );
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // Pattern frequency table
  lines.push("## Pattern Frequency (Top 50)");
  lines.push("");
  lines.push("| Pattern | Count |");
  lines.push("|---------|-------|");

  const sortedPatterns = Object.entries(report.patternSummary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

  for (const [pattern, count] of sortedPatterns) {
    lines.push(`| \`${pattern}\` | ${count} |`);
  }
  lines.push("");

  // Helper to add category section
  const addCategorySection = (title: string, categories: Record<string, AuditCategory>) => {
    const hasItems = Object.values(categories).some((cat) => cat.count > 0);
    if (!hasItems) return;

    lines.push(`## ${title}`);
    lines.push("");

    for (const [, category] of Object.entries(categories)) {
      if (category.count === 0) continue;

      // Count unique patterns
      const uniquePatterns = countUniquePatterns(category.violations);
      const uniqueCount = Object.keys(uniquePatterns).length;

      lines.push(`### ${category.description} (${uniqueCount} unique, ${category.count} total)`);
      lines.push("");

      // Show unique patterns with counts
      lines.push("**Unique patterns:**");
      const sorted = Object.entries(uniquePatterns).sort((a, b) => b[1] - a[1]);
      for (const [pattern, count] of sorted.slice(0, 20)) {
        lines.push(`- \`${pattern}\`: ${count}x`);
      }
      if (sorted.length > 20) {
        lines.push(`- ... and ${sorted.length - 20} more`);
      }
      lines.push("");

      // Show sample locations
      lines.push("**Sample locations:**");
      lines.push("| File | Line | Code |");
      lines.push("|------|------|------|");

      for (const violation of category.violations.slice(0, 20)) {
        const code = violation.code.replace(/\|/g, "\\|").substring(0, 50);
        lines.push(`| ${violation.file} | ${violation.line} | \`${code}\` |`);
      }

      if (category.violations.length > 20) {
        lines.push(`| ... | ... | *${category.violations.length - 20} more* |`);
      }

      lines.push("");
    }
  };

  // Add all category sections dynamically
  const categoryNames: Record<string, string> = {
    colors: "Colors",
    spacing: "Spacing",
    sizing: "Sizing",
    borderRadius: "Border Radius",
    borders: "Borders",
    shadows: "Shadows",
    typography: "Typography",
    layout: "Layout",
    effects: "Effects",
    cssVariables: "CSS Variables",
    inlineStyles: "Inline Styles",
    interactivity: "Interactivity",
    visibility: "Visibility & Overflow",
    transforms: "Transforms",
    filters: "Filters",
    gradients: "Gradients",
    textStyles: "Text Styles",
    objectFit: "Object Fit",
    aspectRatio: "Aspect Ratio",
    outlines: "Outlines",
    rings: "Rings",
    divide: "Divide",
  };

  for (const [key, name] of Object.entries(categoryNames)) {
    const category = report.categories[key as keyof typeof report.categories];
    if (category) {
      addCategorySection(name, category);
    }
  }

  return lines.join("\n");
}
