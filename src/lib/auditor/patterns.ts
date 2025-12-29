/**
 * Design System Audit Patterns
 * Regex patterns for detecting design patterns in source files
 */

export const AUDIT_PATTERNS = {
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
