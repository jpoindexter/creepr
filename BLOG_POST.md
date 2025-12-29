# Building Creepr: A Visual Sitemap Generator & Design System Auditor for Developers

---
title: Building Creepr: A Visual Sitemap Generator & Design System Auditor for Developers
published: true
description: How I built a tool that crawls your localhost apps, generates interactive visual sitemaps, and audits your design system for inconsistencies - with real code examples and implementation details
tags: nextjs, react, typescript, webdev
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/placeholder.png
---

## The Problem I Was Trying to Solve

Picture this: You join a new team. The codebase has 200+ React components. There's no documentation. The previous developer is gone. You need to understand how the app is structured and why there are 47 different shades of gray in the UI.

Or maybe you've been on a project for two years. The team has grown from 2 to 12 developers. Everyone picks their own Tailwind classes. Your design system is "whatever felt right at the time."

I built **creepr** to solve both problems:

1. **Visualize your app structure** - Crawl any localhost app and generate an interactive, zoomable sitemap showing how pages connect
2. **Audit your design system** - Scan source files to find actual inconsistencies (not just list patterns) and get actionable recommendations

Let me show you exactly how it works.

---

## Part 1: Visual Sitemap Generation

### What You Get

Point creepr at `http://localhost:3000` and click "Crawl." A few seconds later, you have a fully interactive map of your application:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        ┌──────────┐                             │
│                        │    /     │                             │
│                        │  (Home)  │                             │
│                        └────┬─────┘                             │
│               ┌─────────────┼─────────────┐                     │
│               │             │             │                     │
│         ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐               │
│         │  /about   │ │ /products │ │/dashboard │               │
│         └───────────┘ └─────┬─────┘ └─────┬─────┘               │
│                             │             │                     │
│                    ┌────────┴───┐    ┌────┴────────┐            │
│                    │            │    │             │            │
│              ┌─────┴────┐ ┌─────┴────┐ ┌──────────┐ ┌──────────┐│
│              │/products │ │/products │ │/dashboard│ │/dashboard││
│              │  /[id]   │ │  /new    │ │/settings │ │/analytics││
│              └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│                                                                 │
│  [Zoom: 75%] [Fit View] [Auto Arrange] [Export JSON]            │
└─────────────────────────────────────────────────────────────────┘
```

But it's not just a static image. You can:

- **Zoom and pan** - Mouse wheel to zoom, drag to pan
- **Click any node** - See page title, URL, HTTP status, all outbound links
- **See broken links** - 404s and 500s are highlighted in red
- **View page styles** - Colors, fonts, spacing extracted from each page
- **Drag nodes** - Rearrange the layout manually
- **Auto-arrange** - One click to apply the Dagre hierarchical layout
- **Export** - Full JSON with SEO metadata (titles, descriptions, Open Graph tags)

### Real Example: Crawling a Next.js E-commerce App

Let's say you have an e-commerce app running on `localhost:3000`. Here's what creepr discovers:

```
Crawl Results:
─────────────────────────────────────────
Pages Found:        47
Broken Links:       3
Max Depth:          4
Crawl Time:         12.3s

Page Tree:
─────────────────────────────────────────
/ (Home)
├── /products
│   ├── /products/shoes
│   │   ├── /products/shoes/nike-air-max      ✓ 200
│   │   ├── /products/shoes/adidas-ultraboost ✓ 200
│   │   └── /products/shoes/deleted-item      ✗ 404  ← BROKEN
│   ├── /products/clothing
│   └── /products/accessories
├── /cart
├── /checkout
│   ├── /checkout/shipping
│   ├── /checkout/payment
│   └── /checkout/confirmation
├── /account
│   ├── /account/orders
│   ├── /account/settings
│   └── /account/addresses
├── /about
├── /contact                                   ✗ 500  ← BROKEN
└── /old-promo                                 ✗ 404  ← BROKEN
```

Immediately you can see:
- Someone deleted a product but links still point to it
- The `/contact` page is throwing a 500 error
- There's an old promo page that was never cleaned up

### Clicking a Node: The Details Panel

When you click on `/products/shoes/nike-air-max`, you see:

```
┌─────────────────────────────────────────┐
│ Page Details                            │
├─────────────────────────────────────────┤
│ URL:    /products/shoes/nike-air-max    │
│ Title:  Nike Air Max 90 | ShoeStore     │
│ Status: 200 OK                          │
│ Depth:  3                               │
├─────────────────────────────────────────┤
│ Outbound Links (12)                     │
│ ├── /products/shoes (parent)            │
│ ├── /cart                               │
│ ├── /products/shoes/adidas-ultraboost   │
│ ├── /products/shoes/nike-jordan         │
│ └── ... 8 more                          │
├─────────────────────────────────────────┤
│ Page Styles                        [▼]  │
│ ┌─────────────────────────────────────┐ │
│ │ Colors (23 unique)                  │ │
│ │ ■ #ffffff  ■ #000000  ■ #3b82f6     │ │
│ │ ■ #f3f4f6  ■ #1f2937  ■ #10b981     │ │
│ │                                     │ │
│ │ Fonts (3 unique)                    │ │
│ │ • Inter, system-ui, sans-serif      │ │
│ │ • Georgia, serif                    │ │
│ │ • Monaco, monospace                 │ │
│ │                                     │ │
│ │ Border Radii (5 unique)             │ │
│ │ • 0.5rem  • 0.75rem  • 1rem         │ │
│ │ • 9999px  • 0px                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

The styles are extracted in real-time from the actual rendered page using Playwright's browser context.

---

## Part 2: Design System Auditor

This is where creepr gets really useful. The sitemap crawler shows you your app's structure. The auditor shows you your app's **design debt**.

### The Problem with Other Tools

Most CSS audit tools just count things:

```
Your codebase has:
- 247 unique color values
- 148 spacing values
- 34 font sizes
- 89 border radius values
```

Cool. But what do I *do* with that? Is 247 colors too many? Which ones should I keep? Where are the problems?

### What Creepr Does Differently

Creepr doesn't just count. It **analyzes patterns to find actual inconsistencies**.

Here's a real example from scanning a production codebase:

```
┌─────────────────────────────────────────────────────────────────┐
│ Design System Inconsistencies                                   │
│                                                                 │
│ Found 59 inconsistencies:                                       │
│ • 21 Critical    • 16 Warnings    • 22 Info                     │
└─────────────────────────────────────────────────────────────────┘

🔴 CRITICAL: Border Radius - Multiple "rounded" variants detected
───────────────────────────────────────────────────────────────────
Your codebase uses 6 different border-radius patterns with no clear
standard. This creates visual inconsistency across your UI.

Dominant Pattern: rounded-lg (312 occurrences, 34%)
                  ↑ This should probably be your standard

Outliers to Fix:
┌──────────────┬───────┬─────┬───────────────────────────────────┐
│ Pattern      │ Count │  %  │ Example Locations                 │
├──────────────┼───────┼─────┼───────────────────────────────────┤
│ rounded-md   │  245  │ 27% │ components/Card.tsx:23            │
│              │       │     │ components/Button.tsx:15          │
│              │       │     │ components/Input.tsx:8            │
├──────────────┼───────┼─────┼───────────────────────────────────┤
│ rounded-xl   │  156  │ 17% │ components/Modal.tsx:12           │
│              │       │     │ components/Dropdown.tsx:34        │
├──────────────┼───────┼─────┼───────────────────────────────────┤
│ rounded      │   98  │ 11% │ pages/dashboard.tsx:67            │
│              │       │     │ components/Badge.tsx:5            │
├──────────────┼───────┼─────┼───────────────────────────────────┤
│ rounded-sm   │   67  │  7% │ components/Tooltip.tsx:19         │
├──────────────┼───────┼─────┼───────────────────────────────────┤
│ rounded-2xl  │   34  │  4% │ components/Avatar.tsx:11          │
└──────────────┴───────┴─────┴───────────────────────────────────┘

Recommendation: Define a standard border-radius. Consider using
`rounded-lg` as your base and update 600+ inconsistent usages.
```

See the difference? Instead of "you have 6 border radius values," you get:
- Which one is most common (your de facto standard)
- Which ones deviate from that standard
- Exactly where in your code the deviations are
- A clear recommendation for what to do

### Severity Levels Explained

**🔴 Critical** - No clear standard exists. Your team is all over the place.
```
Example: 5 different text colors used roughly equally
- text-gray-600: 23%
- text-gray-500: 21%
- text-gray-700: 20%
- text-slate-600: 19%
- text-neutral-600: 17%

This is chaos. Pick one and standardize.
```

**🟡 Warning** - Clear standard exists, but there are outliers.
```
Example: rounded-lg is dominant but outliers exist
- rounded-lg: 78%  ← Your standard
- rounded-md: 14%  ← Outliers (probably accidental)
- rounded-sm: 8%   ← Outliers

These outliers are likely accidents. Easy wins to fix.
```

**🔵 Info** - Minor variations, good to know about.
```
Example: Intentional variations that might be fine
- shadow-md: 65%
- shadow-lg: 25%
- shadow-sm: 10%

Might be intentional (different shadow sizes for different
components). Worth reviewing but not urgent.
```

### What Gets Scanned (25 Categories)

The auditor looks for patterns across these categories:

**Colors**
- Tailwind: `bg-*`, `text-*`, `border-*`, `ring-*`
- Raw values: `#hex`, `rgb()`, `rgba()`, `hsl()`, `oklch()`
- CSS Variables: `var(--color-*)`, `var(--bg-*)`

**Spacing**
- Padding: `p-*`, `px-*`, `py-*`, `pt-*`, `pr-*`, `pb-*`, `pl-*`
- Margin: `m-*`, `mx-*`, `my-*`, `mt-*`, etc.
- Gap: `gap-*`, `gap-x-*`, `gap-y-*`
- Space: `space-x-*`, `space-y-*`

**Sizing**
- Width: `w-*`, `min-w-*`, `max-w-*`
- Height: `h-*`, `min-h-*`, `max-h-*`

**Typography**
- Font size: `text-xs` through `text-9xl`
- Font weight: `font-thin` through `font-black`
- Font family: `font-sans`, `font-serif`, `font-mono`
- Line height: `leading-*`
- Letter spacing: `tracking-*`

**Visual**
- Border radius: `rounded-*`
- Shadows: `shadow-*`
- Opacity: `opacity-*`
- Blur: `blur-*`, `backdrop-blur-*`

**Layout**
- Display: `flex`, `grid`, `block`, `hidden`
- Flex utilities: `flex-*`, `items-*`, `justify-*`
- Grid utilities: `grid-cols-*`, `col-span-*`
- Position: `absolute`, `relative`, `fixed`, `sticky`
- Z-index: `z-*`

**And more...**
- Transforms, filters, gradients, text styles
- Inline styles in JSX
- CSS variable declarations
- Dynamic classes (template literals, `clsx()`, `cn()`)

### Real-World Example: Before and After

**Before running the audit:**
```tsx
// Card.tsx
<div className="rounded-md shadow-md p-4 bg-white">

// Button.tsx
<button className="rounded-lg shadow-sm px-6 py-2 bg-blue-500">

// Modal.tsx
<div className="rounded-xl shadow-lg p-6 bg-white">

// Input.tsx
<input className="rounded border p-2 bg-gray-50">

// Badge.tsx
<span className="rounded-full px-2 py-1 bg-green-100">
```

5 components, 5 different border radius values. Visual inconsistency.

**After fixing based on audit recommendations:**
```tsx
// Card.tsx
<div className="rounded-lg shadow-md p-4 bg-white">

// Button.tsx
<button className="rounded-lg shadow-sm px-6 py-2 bg-blue-500">

// Modal.tsx
<div className="rounded-lg shadow-lg p-6 bg-white">

// Input.tsx
<input className="rounded-lg border p-2 bg-gray-50">

// Badge.tsx (intentionally different - pill shape)
<span className="rounded-full px-2 py-1 bg-green-100">
```

Now you have a consistent `rounded-lg` standard with an intentional exception for pill-shaped badges.

---

## Part 3: How It's Built

### The Tech Stack

```
Frontend:
├── Next.js 15 (App Router)
├── React 19
├── TypeScript 5.6 (strict mode)
├── @xyflow/react v12 (React Flow)
├── Tailwind CSS v3
├── shadcn/ui components
└── Zustand v5 (state management)

Backend/Tooling:
├── @crawlee/playwright v3 (web crawling)
├── Playwright (headless browser)
├── Dagre (graph layout algorithm)
└── Next.js API Routes
```

### Architecture Deep Dive

#### The Crawler Pipeline

The crawler follows a three-stage transformation:

```
Stage 1: Crawling          Stage 2: Tree Building       Stage 3: Visualization
─────────────────          ────────────────────         ─────────────────────

URL Input                  PageInfo[]                   SitemapNode Tree
    │                          │                             │
    ▼                          ▼                             ▼
┌─────────┐               ┌─────────┐                  ┌─────────┐
│Playwright│──────────────│  Build  │──────────────────│  Dagre  │
│ Crawler │   PageInfo[]  │  Tree   │   SitemapNode    │ Layout  │
└─────────┘               └─────────┘                  └─────────┘
    │                          │                             │
    ▼                          ▼                             ▼
Flat list of              Hierarchical                React Flow
pages with                tree with                   nodes & edges
parent refs               children                    with positions
```

**Stage 1: Crawling with Playwright**

```typescript
// lib/crawler/sitemap-crawler.ts (simplified)

export class SitemapCrawler {
  private pageInfos: PageInfo[] = [];
  private visitedUrls = new Set<string>();

  async crawl(startUrl: string, options: CrawlerOptions): Promise<PageInfo[]> {
    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: options.maxPages || 100,
      maxConcurrency: 5,
      requestHandlerTimeoutSecs: 30,

      async requestHandler({ page, request, enqueueLinks }) {
        // IMPORTANT: Wait for client-side JS to finish
        // Next.js apps render links dynamically
        await page.waitForLoadState('networkidle');

        // Get the response to check status codes
        const response = await page.goto(request.url);
        const statusCode = response?.status() || 200;

        // Extract page metadata
        const title = await page.title();
        const description = await page.$eval(
          'meta[name="description"]',
          el => el.getAttribute('content')
        ).catch(() => null);

        // Extract all links on the page
        const links = await this.extractLinks(page, startUrl);

        // Extract computed styles from the rendered page
        const styles = await this.extractPageStyles(page);

        // Store page info
        this.pageInfos.push({
          url: normalizeUrl(request.url),
          parentUrl: request.userData?.parentUrl,
          title,
          description,
          statusCode,
          depth: request.userData?.depth || 0,
          links,
          styles,
        });

        // Queue discovered links for crawling
        const internalLinks = links
          .filter(link => link.isInternal && !this.visitedUrls.has(link.url))
          .map(link => ({
            url: link.url,
            userData: {
              parentUrl: request.url,
              depth: (request.userData?.depth || 0) + 1
            }
          }));

        await enqueueLinks({ urls: internalLinks.map(l => l.url) });
      }
    });

    await crawler.run([startUrl]);
    return this.pageInfos;
  }

  private async extractLinks(page: Page, baseUrl: string): Promise<LinkInfo[]> {
    return page.evaluate((base) => {
      const links: LinkInfo[] = [];
      const anchors = document.querySelectorAll('a[href]');

      anchors.forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (!href) return;

        try {
          const url = new URL(href, base);
          const isInternal = url.origin === new URL(base).origin;

          links.push({
            url: url.href,
            text: anchor.textContent?.trim() || '',
            isInternal,
          });
        } catch {
          // Invalid URL, skip
        }
      });

      return links;
    }, baseUrl);
  }
}
```

**Why `networkidle`?**

This is crucial for modern React/Next.js apps:

```typescript
// Without networkidle - might miss dynamically rendered links
await page.goto(url);
const links = await extractLinks(page); // Missing links!

// With networkidle - waits for all network requests to finish
await page.waitForLoadState('networkidle');
const links = await extractLinks(page); // All links found!
```

Next.js apps often:
- Load route data via fetch
- Render navigation components client-side
- Lazy load below-the-fold content

`networkidle` waits until there are no network connections for 500ms, ensuring everything is rendered.

**Stage 2: Building the Tree**

```typescript
// lib/flow/tree-builder.ts

export function buildSitemapTree(pages: PageInfo[]): SitemapNode {
  // Create a map for O(1) lookups
  const nodeMap = new Map<string, SitemapNode>();

  // First pass: create all nodes
  for (const page of pages) {
    const normalizedUrl = normalizeUrl(page.url);
    nodeMap.set(normalizedUrl, {
      id: normalizedUrl,
      url: page.url,
      title: page.title,
      statusCode: page.statusCode,
      depth: page.depth,
      children: [],
      styles: page.styles,
    });
  }

  // Find or create root node
  const rootUrl = normalizeUrl(pages[0]?.url || '/');
  let root = nodeMap.get(rootUrl);

  if (!root) {
    root = {
      id: rootUrl,
      url: rootUrl,
      title: 'Root',
      statusCode: 200,
      depth: 0,
      children: [],
    };
    nodeMap.set(rootUrl, root);
  }

  // Second pass: build parent-child relationships
  for (const page of pages) {
    const node = nodeMap.get(normalizeUrl(page.url));
    if (!node || node === root) continue;

    const parentUrl = page.parentUrl ? normalizeUrl(page.parentUrl) : null;
    const parent = parentUrl ? nodeMap.get(parentUrl) : null;

    if (parent) {
      // Avoid duplicates
      if (!parent.children.find(child => child.id === node.id)) {
        parent.children.push(node);
      }
    } else {
      // Orphan node - attach to root
      if (!root.children.find(child => child.id === node.id)) {
        root.children.push(node);
      }
    }
  }

  return root;
}
```

**Why `normalizeUrl()` is Critical**

```typescript
// lib/utils.ts

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Remove trailing slash
    let path = parsed.pathname;
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    // Remove hash fragments
    // /about#team and /about should be the same page
    parsed.hash = '';

    // Lowercase for consistency
    return `${parsed.origin}${path}${parsed.search}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}
```

Without normalization:
```
/about     → Node A
/about/    → Node B  (duplicate!)
/About     → Node C  (duplicate!)
/about#team → Node D (duplicate!)
```

With normalization:
```
/about     → Node A
/about/    → Node A  (same)
/About     → Node A  (same)
/about#team → Node A (same)
```

**Stage 3: Layout with Dagre**

```typescript
// lib/flow/layout-builder.ts

import dagre from 'dagre';

export function buildFlowFromTree(root: SitemapNode): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Flatten tree to nodes and edges
  function traverse(node: SitemapNode, parentId?: string) {
    nodes.push({
      id: node.id,
      type: 'custom',
      data: {
        label: node.title || node.url,
        url: node.url,
        statusCode: node.statusCode,
        styles: node.styles,
      },
      position: { x: 0, y: 0 }, // Will be set by Dagre
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
      });
    }

    for (const child of node.children) {
      traverse(child, node.id);
    }
  }

  traverse(root);

  // Apply Dagre layout
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({
    rankdir: 'TB',      // Top to bottom
    ranksep: 100,       // Vertical spacing between ranks
    nodesep: 80,        // Horizontal spacing between nodes
    marginx: 50,
    marginy: 50,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  // Add nodes to graph with dimensions
  const NODE_WIDTH = 280;
  const NODE_HEIGHT = 100;

  nodes.forEach(node => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Add edges to graph
  edges.forEach(edge => {
    graph.setEdge(edge.source, edge.target);
  });

  // Run layout algorithm
  dagre.layout(graph);

  // Extract calculated positions
  nodes.forEach(node => {
    const nodeWithPosition = graph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - NODE_WIDTH / 2,
      y: nodeWithPosition.y - NODE_HEIGHT / 2,
    };
  });

  return { nodes, edges };
}
```

#### The Auditor Pipeline

```
Source Files              Pattern Detection           Inconsistency Analysis
────────────              ─────────────────           ──────────────────────

.tsx, .jsx,               For each file:              Group by base pattern:
.ts, .js,        ────────►  Match regex    ────────►    rounded-* → "rounded"
.css, .scss                 Record location             p-* → "p"
                            Extract code                text-gray-* → "text-gray"
                                                              │
                                                              ▼
                                                        Find dominant
                                                        Flag outliers
                                                        Assign severity
                                                        Generate recommendations
```

**Pattern Detection**

```typescript
// lib/design-system-auditor.ts

const AUDIT_PATTERNS = {
  borderRadius: {
    all: {
      pattern: "rounded-* borders",
      regex: /\brounded(-[a-z0-9]+)*\b/g,
      description: "Border radius classes",
    },
  },
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
    hexColors: {
      pattern: "#hex colors",
      regex: /#[A-Fa-f0-9]{3,8}\b/g,
      description: "Hardcoded hex color values",
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
  },
  // ... 25 categories total
};

function findPatterns(
  content: string,
  filePath: string,
  regex: RegExp
): AuditViolation[] {
  const patterns: AuditViolation[] = [];
  const lines = content.split('\n');

  regex.lastIndex = 0; // Reset for global regex

  let match;
  while ((match = regex.exec(content)) !== null) {
    // Calculate line number
    const textBeforeMatch = content.substring(0, match.index);
    const lineNumber = textBeforeMatch.split('\n').length;

    // Calculate column
    const lastNewlineIndex = textBeforeMatch.lastIndexOf('\n');
    const column = match.index - lastNewlineIndex;

    patterns.push({
      file: filePath,
      line: lineNumber,
      column,
      code: match[0],
      context: lines[lineNumber - 1]?.trim().substring(0, 100),
    });
  }

  return patterns;
}
```

**Grouping Related Patterns**

This is the key insight. `rounded-lg` and `rounded-md` are related - they're both border radius values. We need to group them to detect inconsistencies:

```typescript
function extractPatternBase(code: string): string {
  // Color patterns - group by color name
  // "bg-blue-500" → "bg-blue"
  // "text-gray-600" → "text-gray"
  const colorMatch = code.match(/^(bg|text|border|ring)-([a-z]+)/);
  if (colorMatch) {
    return `${colorMatch[1]}-${colorMatch[2]}`;
  }

  // Spacing patterns - group by direction
  // "p-4" → "p"
  // "px-6" → "px"
  // "mt-8" → "mt"
  const spacingMatch = code.match(/^(-?[pm][xytrbl]?)-/);
  if (spacingMatch) {
    return spacingMatch[1];
  }

  // Rounded patterns - all in one group
  // "rounded-lg", "rounded-md", "rounded" → "rounded"
  if (code.startsWith('rounded')) {
    return 'rounded';
  }

  // Shadow patterns - all in one group
  if (code.startsWith('shadow')) {
    return 'shadow';
  }

  // Font sizes - group together
  // "text-sm", "text-lg", "text-2xl" → "text-size"
  const textSizeMatch = code.match(/^text-(xs|sm|base|lg|xl|[2-9]xl)/);
  if (textSizeMatch) {
    return 'text-size';
  }

  // Default: use first segment
  const dashIndex = code.indexOf('-');
  return dashIndex > 0 ? code.substring(0, dashIndex) : code;
}
```

**Detecting Inconsistencies**

```typescript
function detectCategoryInconsistencies(
  categoryName: string,
  categoryDescription: string,
  violations: AuditViolation[]
): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];

  if (violations.length < 2) return inconsistencies;

  // Count occurrences of each pattern
  const patternCounts: Record<string, number> = {};
  for (const v of violations) {
    patternCounts[v.code] = (patternCounts[v.code] || 0) + 1;
  }

  // Group patterns by their base type
  const baseGroups = new Map<string, string[]>();
  for (const pattern of Object.keys(patternCounts)) {
    const base = extractPatternBase(pattern);
    if (!baseGroups.has(base)) {
      baseGroups.set(base, []);
    }
    baseGroups.get(base)!.push(pattern);
  }

  // Analyze each group for inconsistencies
  for (const [base, patterns] of baseGroups) {
    if (patterns.length < 2) continue; // Only one variant = consistent

    // Calculate totals
    const groupTotal = patterns.reduce((sum, p) => sum + patternCounts[p], 0);

    // Sort by count descending
    const sorted = patterns.sort((a, b) => patternCounts[b] - patternCounts[a]);

    const dominant = sorted[0];
    const dominantCount = patternCounts[dominant];
    const dominantPct = Math.round((dominantCount / groupTotal) * 100);

    // Get outliers (everything except the dominant pattern)
    const outliers = sorted.slice(1).filter(p => patternCounts[p] >= 2);

    if (outliers.length === 0) continue; // No significant outliers

    // Determine severity
    let severity: 'critical' | 'warning' | 'info';

    if (dominantPct < 40 && patterns.length >= 3) {
      // Highly fragmented - no clear standard
      severity = 'critical';
    } else if (dominantPct >= 70) {
      // Clear standard with outliers - likely accidents
      severity = 'warning';
    } else {
      severity = 'info';
    }

    // Generate recommendation
    const outlierCount = outliers.reduce((sum, p) => sum + patternCounts[p], 0);
    const recommendation = dominantPct >= 60
      ? `Standardize on \`${dominant}\` (currently ${dominantPct}% of usage). Update ${outlierCount} outlier occurrences.`
      : `Define a standard for ${base} patterns. Consider using \`${dominant}\` as the base.`;

    inconsistencies.push({
      category: categoryName,
      description: `${categoryDescription}: Multiple "${base}" variants detected`,
      dominantPattern: dominant,
      dominantCount,
      dominantPercentage: dominantPct,
      outliers: outliers.map(pattern => ({
        pattern,
        count: patternCounts[pattern],
        percentage: Math.round((patternCounts[pattern] / groupTotal) * 100),
        files: violations
          .filter(v => v.code === pattern)
          .slice(0, 5)
          .map(v => ({ file: v.file, line: v.line })),
      })),
      severity,
      recommendation,
    });
  }

  return inconsistencies;
}
```

### State Management with Zustand

The entire app state is managed with ~50 lines of Zustand:

```typescript
// lib/store.ts

import { create } from 'zustand';

interface AppState {
  // Crawl state
  crawlStatus: 'idle' | 'crawling' | 'completed' | 'error';
  crawlResult: CrawlResult | null;
  flowData: { nodes: Node[]; edges: Edge[] } | null;
  selectedNode: string | null;

  // Audit state
  auditStatus: 'idle' | 'auditing' | 'completed' | 'error';
  auditProgress: { stage: string; percent: number } | null;
  designSystemReport: DesignSystemAuditReport | null;

  // Actions
  setCrawlStatus: (status: CrawlStatus) => void;
  setCrawlResult: (result: CrawlResult | null) => void;
  setFlowData: (data: FlowData | null) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setAuditStatus: (status: AuditStatus) => void;
  setAuditProgress: (progress: AuditProgress | null) => void;
  setDesignSystemReport: (report: DesignSystemAuditReport | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  crawlStatus: 'idle',
  crawlResult: null,
  flowData: null,
  selectedNode: null,
  auditStatus: 'idle',
  auditProgress: null,
  designSystemReport: null,

  setCrawlStatus: (crawlStatus) => set({ crawlStatus }),
  setCrawlResult: (crawlResult) => set({ crawlResult }),
  setFlowData: (flowData) => set({ flowData }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setAuditStatus: (auditStatus) => set({ auditStatus }),
  setAuditProgress: (auditProgress) => set({ auditProgress }),
  setDesignSystemReport: (designSystemReport) => set({ designSystemReport }),
  reset: () => set({
    crawlStatus: 'idle',
    crawlResult: null,
    flowData: null,
    selectedNode: null,
    auditStatus: 'idle',
    auditProgress: null,
    designSystemReport: null,
  }),
}));
```

No Redux. No context providers. Just a simple store.

---

## Part 4: Export Formats

### JSON Export

Full data dump for programmatic use:

```json
{
  "generatedAt": "2024-01-15T10:30:00.000Z",
  "totalFiles": 863,
  "totalPatterns": 38170,
  "summary": "Scanned 863 files. Found 1064 unique patterns: 247 colors, 148 spacing, 148 sizing, 34 typography, 167 layout, 39 effects, 10 CSS vars, 239 inline styles. Found 59 inconsistencies (21 critical, 16 warnings).",
  "inconsistencies": {
    "totalInconsistencies": 59,
    "critical": 21,
    "warning": 16,
    "info": 22,
    "inconsistencies": [
      {
        "category": "Border Radius",
        "description": "Border radius classes: Multiple \"rounded\" variants detected",
        "dominantPattern": "rounded-lg",
        "dominantCount": 312,
        "dominantPercentage": 34,
        "outliers": [
          {
            "pattern": "rounded-md",
            "count": 245,
            "percentage": 27,
            "files": [
              { "file": "src/components/Card.tsx", "line": 23 },
              { "file": "src/components/Button.tsx", "line": 15 },
              { "file": "src/components/Input.tsx", "line": 8 }
            ]
          },
          {
            "pattern": "rounded-xl",
            "count": 156,
            "percentage": 17,
            "files": [
              { "file": "src/components/Modal.tsx", "line": 12 },
              { "file": "src/components/Dropdown.tsx", "line": 34 }
            ]
          }
        ],
        "severity": "critical",
        "recommendation": "Define a standard for rounded patterns. Consider using `rounded-lg` as the base and update inconsistent usages."
      }
    ]
  },
  "categories": {
    "colors": {
      "bgColors": {
        "pattern": "bg-* colors",
        "description": "Background color classes",
        "count": 1847,
        "violations": [
          {
            "file": "src/components/Button.tsx",
            "line": 15,
            "column": 23,
            "code": "bg-blue-500",
            "context": "<button className=\"bg-blue-500 hover:bg-blue-600\">"
          }
        ]
      }
    }
  },
  "patternSummary": {
    "rounded-lg": 312,
    "rounded-md": 245,
    "bg-white": 234,
    "p-4": 198,
    "flex": 187
  }
}
```

### Markdown Export

Human-readable report for documentation or sharing:

```markdown
# Design System Audit Report

**Generated:** 1/15/2024, 10:30:00 AM
**Files Scanned:** 863
**Total Patterns Found:** 38,170

---

## Summary

Scanned 863 files. Found 1064 unique patterns: 247 colors, 148 spacing,
148 sizing, 34 typography, 167 layout, 39 effects, 10 CSS vars, 239
inline styles. Found 59 inconsistencies (21 critical, 16 warnings).

## Design System Inconsistencies

Found **59** inconsistencies:
- 21 Critical
- 16 Warnings
- 22 Info

### 🔴 Critical (21)

#### Border radius classes: Multiple "rounded" variants detected

**Recommendation:** Define a standard for rounded patterns. Consider
using `rounded-lg` as the base and update inconsistent usages.

**Dominant pattern:** `rounded-lg` (312x, 34%)

**Outliers to fix:**

| Pattern | Count | % | Locations |
|---------|-------|---|-----------|
| `rounded-md` | 245 | 27% | src/components/Card.tsx:23, src/components/Button.tsx:15, src/components/Input.tsx:8 (+242 more) |
| `rounded-xl` | 156 | 17% | src/components/Modal.tsx:12, src/components/Dropdown.tsx:34 (+154 more) |
| `rounded` | 98 | 11% | src/pages/dashboard.tsx:67, src/components/Badge.tsx:5 (+96 more) |

---

### 🟡 Warning (16)

#### Background color classes: Multiple "bg-gray" variants detected

**Recommendation:** Standardize on `bg-gray-100` (currently 67% of usage).
Update 89 outlier occurrences.

**Dominant pattern:** `bg-gray-100` (267x, 67%)

**Outliers to fix:**

| Pattern | Count | % | Locations |
|---------|-------|---|-----------|
| `bg-gray-50` | 67 | 17% | src/components/Card.tsx:5, src/pages/settings.tsx:23 (+65 more) |
| `bg-gray-200` | 22 | 6% | src/components/Skeleton.tsx:8 (+21 more) |

---

## Pattern Frequency (Top 50)

| Pattern | Count |
|---------|-------|
| `rounded-lg` | 312 |
| `rounded-md` | 245 |
| `bg-white` | 234 |
| `p-4` | 198 |
| `flex` | 187 |
| ... | ... |
```

---

## Part 5: What I Learned Building This

### 1. URL Normalization is Everything

I spent hours debugging why my tree had duplicate nodes. The culprit:

```javascript
visitedUrls.add('/about');    // First visit
visitedUrls.has('/about/');   // false - different string!
```

Always normalize URLs before comparing or storing them.

### 2. Playwright's `networkidle` is Magic

Modern SPAs render content dynamically. Without waiting for network idle, you'll miss:
- Dynamically loaded navigation
- Client-side rendered links
- Lazy-loaded content

### 3. Regex Needs Care with Global Flag

```javascript
const regex = /pattern/g;
regex.exec(string); // Match 1
regex.exec(string); // Match 2 (continues from lastIndex)
regex.exec(string); // null (done)
regex.exec(string); // Match 1 again (reset)

// Always reset before reusing:
regex.lastIndex = 0;
```

### 4. Severity Levels Need Nuance

My first version marked everything as "needs fixing." Users ignored it.

By adding severity levels (critical/warning/info), users know what to prioritize. Critical issues get fixed first.

### 5. File Locations are Essential

"You have 45 inconsistent colors" is useless.

"You have 45 inconsistent colors. Here are the exact files and line numbers" is actionable.

---

## What's Next

Features I'm exploring:

1. **Diff mode** - Compare audits over time to track improvements
2. **Auto-fix** - Generate codemod scripts to standardize patterns
3. **CI integration** - Fail builds if inconsistencies exceed thresholds
4. **VS Code extension** - Run audits directly in your editor
5. **Team sharing** - Export reports for code review discussions

---

## Try It Yourself

```bash
# Clone and install
git clone https://github.com/jpoindexter/creepr
cd creepr
npm install
npx playwright install  # Required for crawler

# Start the app
npm run dev
# Opens at http://localhost:3500
```

Then:
1. **For sitemap**: Enter your localhost URL and click "Crawl"
2. **For audit**: Pick a source folder and click "Run Audit"

---

## Links

- **GitHub**: [github.com/jpoindexter/creepr](https://github.com/jpoindexter/creepr)
- **React Flow**: [reactflow.dev](https://reactflow.dev)
- **Crawlee**: [crawlee.dev](https://crawlee.dev)
- **Dagre**: [github.com/dagrejs/dagre](https://github.com/dagrejs/dagre)

---

*Built with Next.js 15, React Flow, Crawlee, and an unhealthy amount of coffee.*

Have questions? Drop a comment below! I'd love to hear what features would be most useful for your workflow.
