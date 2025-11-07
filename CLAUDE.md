# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**creepr** is a Next.js 15 application that crawls localhost applications and generates interactive hierarchical visual sitemaps using React Flow. It's designed specifically for developers to understand and visualize their application structure.

**Tech Stack**:
- Next.js 15 (App Router) with React 19
- @xyflow/react v12 (React Flow) for visualization
- @crawlee/playwright v3 for web crawling
- TypeScript 5.6 (strict mode)
- Tailwind CSS v3 with shadcn/ui components
- Zustand v5 for state management

**Core Workflow**:
1. User enters localhost URL
2. Crawlee (with Playwright) crawls the site, discovering all pages and links
3. Crawler builds flat list of pages with parent-child relationships
4. Tree builder converts flat data to hierarchical tree structure
5. Layout builder applies Dagre algorithm for positioning
6. React Flow renders interactive, zoomable sitemap with broken links highlighted in red

## Development Commands

```bash
# Development
npm install              # Install dependencies
npx playwright install   # Install Playwright browsers (REQUIRED first time)
npm run dev             # Start dev server on localhost:3000
npm run build           # Build for production
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint (ESLint 9 with flat config)
```

**IMPORTANT**:
- You must run `npx playwright install` after `npm install` on first setup. Playwright browsers are required for the crawler to function.
- This project uses **ESLint 9** with flat config format (`eslint.config.mjs`). Do not use `.eslintrc.json`.

## Architecture

### Three-Stage Pipeline

The application follows a clear three-stage data transformation pipeline:

**Stage 1: Crawling** (`lib/crawler/`)
- `SitemapCrawler` uses Crawlee's PlaywrightCrawler to navigate pages
- Extracts links from HTML content using `extractLinks()`
- Tracks visited URLs to prevent infinite loops
- Respects `maxDepth` and `maxPages` limits
- Returns flat array of `PageInfo` objects with parent-child relationships

**Stage 2: Tree Building** (`lib/flow/tree-builder.ts`)
- `buildSitemapTree()` converts flat page list to hierarchical `SitemapNode` tree
- Uses parent-child URL relationships to build tree structure
- Orphaned nodes (no parent) are automatically attached to root
- `getTreeStats()` calculates statistics (total pages, broken links, max depth)

**Stage 3: React Flow Visualization** (`lib/flow/layout-builder.ts`)
- `buildFlowFromTree()` converts tree to React Flow nodes and edges
- Applies Dagre layout algorithm for hierarchical positioning
- `nodeFactory` and `edgeFactory` create styled React Flow elements
- Custom node component (`components/flow/CustomNode.tsx`) handles rendering

### Key Data Flow

```
URL Input → API Route (/api/crawl) → SitemapCrawler → PageInfo[] →
buildSitemapTree() → SitemapNode → buildFlowFromTree() →
{ nodes, edges } → React Flow Visualization
```

### URL Normalization (CRITICAL)

All URLs are normalized using `normalizeUrl()` in `lib/utils.ts`:
- Removes trailing slashes
- Removes hash fragments
- Converts to lowercase
- Ensures consistency for Set-based duplicate detection

**Why this matters**: Without normalization, `/about` and `/about/` would be treated as different pages, causing duplicate nodes and broken tree relationships.

### Status Code Handling

Links are categorized by HTTP status codes:
- **200-299**: Success (green)
- **300-399**: Redirect (orange)
- **400-599**: Broken (red background)

Status determined by `getLinkStatus()` in `lib/crawler/link-validator.ts`.

## Project Structure

```
src/
├── app/
│   ├── api/crawl/route.ts          # Main crawl endpoint (POST)
│   ├── page.tsx                    # Main UI (form + visualization)
│   └── layout.tsx                  # Root layout
├── lib/
│   ├── crawler/
│   │   ├── sitemap-crawler.ts      # Crawlee crawler implementation
│   │   ├── link-validator.ts       # URL validation and link extraction
│   │   └── types.ts                # Crawler types (PageInfo, CrawlerOptions)
│   ├── flow/
│   │   ├── tree-builder.ts         # Flat list → hierarchical tree
│   │   ├── layout-builder.ts       # Tree → React Flow format + Dagre layout
│   │   ├── node-factory.ts         # Create styled nodes
│   │   └── edge-factory.ts         # Create styled edges
│   ├── store.ts                    # Zustand state (crawl status, results, selected node)
│   └── utils.ts                    # URL normalization, status helpers
├── components/
│   ├── flow/
│   │   ├── SitemapFlow.tsx         # Main React Flow component
│   │   └── CustomNode.tsx          # Custom node renderer (shows title, URL, status)
│   ├── CrawlForm.tsx               # URL input form
│   └── StatusPanel.tsx             # Stats display + selected node info
└── types/
    ├── sitemap.ts                  # Sitemap data types (PageInfo, SitemapNode)
    └── flow.ts                     # React Flow type extensions
```

## Critical Implementation Details

### Crawlee Configuration

**Package**: Uses `@crawlee/playwright` (not the general `crawlee` package) to avoid unnecessary Puppeteer dependencies.

`SitemapCrawler` is configured with these defaults:
- `maxRequestsPerCrawl`: 100 pages
- `maxConcurrency`: 5 simultaneous page loads
- `requestHandlerTimeoutSecs`: 30 seconds per page
- `waitForLoadState`: 'networkidle' (waits for all network requests to finish)

**Why 'networkidle'**: Next.js apps use client-side routing and dynamic imports. Waiting for network idle ensures all client-side JavaScript has executed and links are visible in the DOM.

**Context Capture Pattern**: The crawler captures instance variables (`pageInfos`, `visitedUrls`, `baseUrl`, `options`) in local constants before creating the `PlaywrightCrawler`, since callbacks don't have access to `this` context.

### Playwright Page Handling

The crawler calls `page.goto()` TWICE per page:
1. First in the request handler (implicit)
2. Second explicitly to get the response object for status code

This is intentional - Crawlee's implicit navigation doesn't provide response status codes.

### Tree Building Edge Cases

`buildSitemapTree()` handles several edge cases:
1. **Missing root**: If root URL wasn't crawled successfully, creates a default root node
2. **Orphaned nodes**: Nodes without valid parents are attached directly to root
3. **Circular references**: Prevented by checking `!parent.children.find(child => child.id === node.id)` before adding

### React Flow v12 Layout

**Package**: Uses `@xyflow/react` v12 (new package name, replaces `reactflow`)

**Breaking Changes from v11**:
- `ReactFlow` is now a **named export** (not default): `import { ReactFlow } from '@xyflow/react'`
- CSS import path changed: `import '@xyflow/react/dist/style.css'`
- Node/Edge data types must extend `Record<string, unknown>`
- Custom node components receive `{ data, selected }` props, not `NodeProps<T>`

Dagre layout configuration in `buildFlowFromTree()`:
- `rankdir: 'TB'` (top-to-bottom hierarchical layout)
- `ranksep: 100` (vertical spacing between ranks)
- `nodesep: 80` (horizontal spacing between nodes)

**Performance note**: Dagre layout is synchronous and can block the UI for large graphs (100+ nodes). Consider adding a loading state or web worker for very large sites.

**Type Safety**: All custom data interfaces (`CustomNodeData`, `CustomEdgeData`) extend `Record<string, unknown>` to satisfy React Flow v12 constraints.

### State Management Pattern

Zustand store (`lib/store.ts`) manages four pieces of state:
1. `crawlStatus`: 'idle' | 'crawling' | 'completed' | 'error'
2. `crawlResult`: Full crawl data (pages, tree, stats)
3. `flowData`: React Flow nodes and edges (derived from tree)
4. `selectedNode`: Currently selected node for details panel

**Derived state**: `flowData` is derived from `crawlResult.tree` via `buildFlowFromTree()`. Always update `crawlResult` first, then call `buildFlowFromTree()` to update `flowData`.

## Adding New Features

### Adding a New Crawler Option

To add a new option (e.g., `followExternalLinks`):
1. Add to `CrawlerOptions` in `lib/crawler/types.ts`
2. Update `SitemapCrawler` constructor default in `sitemap-crawler.ts`
3. Modify `shouldCrawlUrl()` logic in `link-validator.ts`
4. Add to `CrawlRequest` in `types/sitemap.ts`
5. Add input field in `CrawlForm.tsx`
6. Pass through in API route (`app/api/crawl/route.ts`)

### Adding a New Node Type

To add a new node type (e.g., "API Endpoint"):
1. Add type to `SitemapNode` in `types/sitemap.ts`
2. Detect type in `buildSitemapTree()` (e.g., check if URL contains `/api/`)
3. Add styling case in `createStyledNode()` in `node-factory.ts`
4. Update `CustomNode.tsx` to display type-specific info

### Changing Layout Algorithm

To switch from Dagre to ELK:
1. Replace `dagre` dependency with `elkjs` in `package.json`
2. Replace layout logic in `buildFlowFromTree()` in `layout-builder.ts`
3. Update `ranksep`/`nodesep` config for ELK's API format

## Troubleshooting

### Crawler Hangs or Times Out

**Symptom**: Crawl request never completes or takes >30 seconds per page

**Common causes**:
1. Target site uses infinite scroll or infinite redirects
2. Pages have very large DOM or many network requests
3. Playwright not installed (`npx playwright install`)

**Solution**: Reduce `timeout` in API route or add `maxRequestRetries: 0` to crawler config.

### Broken Links Not Detected

**Symptom**: Links show as green but should be red

**Cause**: Status code check happens AFTER successful navigation. If Playwright successfully loads the page, it returns 200 even if the underlying route returns 404.

**Solution**: Check server-side routing configuration. Next.js catches 404s and renders the 404 page with 200 status.

### Tree Structure Incorrect

**Symptom**: Nodes appear at wrong depth or under wrong parent

**Cause**: URL normalization mismatch. Parent URL in `PageInfo` doesn't match normalized URL in tree map.

**Solution**: Ensure `normalizeUrl()` is called consistently in both crawler and tree builder. Check for edge cases like URLs with query params or ports.

### React Flow Performance Issues

**Symptom**: UI freezes or lags when viewing large sitemaps

**Cause**: Too many nodes (>200) or Dagre layout blocking main thread

**Solution**:
1. Reduce `maxPages` in crawl request
2. Add `nodesDraggable={false}` to reduce re-renders
3. Implement virtualization (only render visible nodes)

## Type Safety

TypeScript strict mode is enabled. Key type invariants:
- All URLs in `PageInfo` and `SitemapNode` must be strings (normalized)
- `statusCode` is always a number (default to 200 if unknown)
- `depth` is always a number >= 0
- `children` array is never null (use empty array)

## Hydration Warning Suppression

The `<body>` tag in `src/app/layout.tsx` includes `suppressHydrationWarning` to prevent false hydration warnings from browser extensions (password managers, form fillers like ClickUp, etc.) that inject attributes before React hydrates.

**Pattern**:
```tsx
<body className={inter.className} suppressHydrationWarning>
```

This is intentional and safe - browser extensions commonly inject attributes into `<body>` tags, causing harmless mismatches that would otherwise flood the console with warnings.

## Performance Considerations

- **Crawling**: ~1-3 seconds per page with Playwright (headless browser overhead)
- **Tree Building**: O(n log n) due to sorting and parent lookup
- **Layout**: O(n²) worst case for Dagre algorithm
- **Rendering**: React Flow handles up to ~500 nodes smoothly

For sites with >100 pages, consider implementing:
1. Incremental crawling (stream results as pages are discovered)
2. Server-side layout calculation
3. Pagination or virtualization in React Flow
