# creepr

A Next.js application that crawls localhost apps and generates interactive hierarchical visual sitemaps using React Flow.

## Features

- **Automated Crawling**: Crawl any localhost application to discover all pages and links
- **Hierarchical Visualization**: Display site structure as an interactive tree diagram
- **Broken Link Detection**: Automatically highlight broken links in red
- **Interactive Controls**: Pan, zoom, and click nodes to explore your site structure
- **Export Functionality**: Export sitemap data as JSON
- **Real-time Statistics**: View crawl stats including total pages, broken links, and crawl time

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Visualization**: React Flow
- **Crawler**: Crawlee with Playwright
- **Layout Engine**: Dagre (hierarchical graph layout)
- **State Management**: Zustand
- **UI Components**: shadcn/ui with Tailwind CSS
- **Icons**: Lucide React

## Project Structure

```
creepr/
├── src/
│   ├── app/
│   │   ├── api/crawl/route.ts    # Crawling API endpoint
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Main application page
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   ├── flow/
│   │   │   ├── CustomNode.tsx     # Custom node component
│   │   │   └── SitemapFlow.tsx    # Main React Flow component
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── CrawlForm.tsx          # URL input form
│   │   └── StatusPanel.tsx        # Stats and selected node info
│   ├── lib/
│   │   ├── crawler/
│   │   │   ├── sitemap-crawler.ts # Main crawler logic
│   │   │   ├── link-validator.ts  # Link validation utilities
│   │   │   └── types.ts           # Crawler types
│   │   ├── flow/
│   │   │   ├── tree-builder.ts    # Build hierarchical tree
│   │   │   ├── layout-builder.ts  # Convert to React Flow format
│   │   │   ├── node-factory.ts    # Create styled nodes
│   │   │   └── edge-factory.ts    # Create styled edges
│   │   ├── store.ts               # Zustand state management
│   │   └── utils.ts               # Utility functions
│   └── types/
│       ├── sitemap.ts             # Sitemap data types
│       └── flow.ts                # React Flow types
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
```

2. Install Playwright browsers (required for crawling):

```bash
npx playwright install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Usage

1. **Start your target application**: Make sure the Next.js app you want to crawl is running on localhost (e.g., `http://localhost:3001`)

2. **Enter the URL**: In creepr, enter the localhost URL in the input field

3. **Start crawling**: Click the "Start Crawl" button to begin crawling

4. **Explore the visualization**:
   - Pan: Click and drag the canvas
   - Zoom: Use mouse wheel or controls
   - Select node: Click on any node to view details
   - Fit view: Click the fit view button to center the diagram

5. **Export data**: Click "Export JSON" to save the sitemap data

## Features Detail

### Crawler Configuration

The crawler is configured with the following defaults:
- **Max Depth**: 10 levels deep
- **Max Pages**: 100 pages
- **Timeout**: 30 seconds per page

These can be adjusted in the API route (`src/app/api/crawl/route.ts`).

### Link Status Colors

- **Green**: Successful (200-299 status codes)
- **Orange**: Redirects (300-399 status codes)
- **Red**: Broken links (400-599 status codes)

### Node Types

- **Root Node**: Blue background, represents the starting URL
- **Regular Node**: White background, standard page
- **Broken Node**: Red background, indicates a broken link

## Development Notes

### TypeScript Strict Mode

This project uses TypeScript strict mode for maximum type safety. All type definitions are located in `src/types/`.

### State Management

Application state is managed with Zustand (`src/lib/store.ts`):
- Crawl status (idle, crawling, completed, error)
- Crawl results and statistics
- React Flow nodes and edges
- Selected node information

### Styling

The project uses Tailwind CSS with shadcn/ui components for consistent styling. Custom React Flow node styles are defined in `src/app/globals.css`.

## Troubleshooting

### Crawler Issues

**Problem**: Crawl fails immediately
- Ensure the target localhost URL is accessible
- Check that the server is running
- Verify CORS settings if applicable

**Problem**: Some pages aren't discovered
- Check if pages are linked in the HTML
- Verify that links are using proper href attributes
- Ensure JavaScript-rendered links are visible in the DOM

### Performance

**Problem**: Large sites are slow
- Reduce `maxPages` in the crawl request
- Decrease `maxDepth` to limit recursion
- Consider implementing pagination

## Future Enhancements

Potential improvements:
- [ ] Export as PNG/SVG
- [ ] Filter by status code
- [ ] Search functionality
- [ ] Different layout algorithms (radial, force-directed)
- [ ] Crawl progress streaming
- [ ] Save/load sitemap sessions
- [ ] Dark mode support
- [ ] Accessibility improvements

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
