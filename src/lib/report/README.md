# Markdown Report Generator

Comprehensive 404 audit report generator for creepr that transforms crawl results into actionable markdown reports.

## Features

- **Executive Summary**: Health score, total pages, error breakdown
- **Category Grouping**: Broken URLs grouped by path patterns
- **Error Type Analysis**: Breakdown by HTTP status codes
- **Pattern Detection**: Identifies common issues (old structure, trailing slashes, etc.)
- **Fix Recommendations**: Prioritized action items with effort estimates
- **Source References**: Shows where broken URLs are linked from
- **Full Appendix**: Complete list of all broken URLs

## Installation

No installation needed - this is a pure TypeScript module with no external dependencies beyond the project's existing stack.

## Usage

### Basic Usage

```typescript
import { generateMarkdownReport, ReportData } from '@/lib/report/markdown-generator';
import { PageInfo } from '@/lib/crawler/types';

// Prepare your crawl data
const reportData: ReportData = {
  crawlResults: pages,      // Array of PageInfo from crawler
  sourceLinks: sources,     // Array of SourceLink references
  baseUrl: 'https://example.com',
  timestamp: new Date(),
  crawlDuration: 45000,     // Optional: duration in milliseconds
};

// Generate markdown
const markdown = generateMarkdownReport(reportData);

// Use the markdown (save to file, display, etc.)
console.log(markdown);
```

### API Route Integration

Create a new API route to generate reports:

```typescript
// app/api/crawl/[sessionId]/report/route.ts
import { NextResponse } from 'next/server';
import { generateMarkdownReport } from '@/lib/report/markdown-generator';
import { getCrawlResult } from '@/lib/store';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const crawlResult = getCrawlResult(params.sessionId);

  if (!crawlResult) {
    return NextResponse.json(
      { error: 'Crawl result not found' },
      { status: 404 }
    );
  }

  const reportData = {
    crawlResults: crawlResult.pages,
    sourceLinks: buildSourceLinks(crawlResult.pages),
    baseUrl: crawlResult.rootUrl,
    timestamp: new Date(),
    crawlDuration: crawlResult.crawlTime,
  };

  const markdown = generateMarkdownReport(reportData);

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown',
      'Content-Disposition': `attachment; filename="404-audit-${params.sessionId}.md"`,
    },
  });
}
```

### Building Source Links

Helper function to build source references from crawl data:

```typescript
function buildSourceLinks(pages: PageInfo[]): SourceLink[] {
  const sourceLinks: SourceLink[] = [];

  pages.forEach((page) => {
    if (page.statusCode >= 200 && page.statusCode < 400) {
      page.links.forEach((link) => {
        const linkedPage = pages.find((p) => p.url === link);
        if (linkedPage && linkedPage.statusCode >= 400) {
          sourceLinks.push({
            brokenUrl: link,
            referrerUrl: page.url,
            referrerTitle: page.title || 'Untitled',
          });
        }
      });
    }
  });

  return sourceLinks;
}
```

## Report Structure

### 1. Executive Summary
- Health score (0-100) with emoji indicator
- Total pages crawled
- Broken URLs count and error rate
- Breakdown by error type (4xx, 5xx, timeouts)
- Quick stats table

### 2. Broken URLs by Category
- Groups URLs by path patterns (e.g., `/docs/*`, `/api/users/*`)
- Severity rating (critical/high/medium/low)
- Shows up to 10 URLs per category
- Automatically detects common path structures

### 3. Broken URLs by Error Type
- Groups by HTTP status code (404, 500, etc.)
- Lists up to 15 URLs per error type
- Includes status code descriptions

### 4. Pattern Analysis
Detects common issues:
- Old/archive category structures
- Missing file extensions
- Query parameter issues
- Trailing slash inconsistencies
- Case sensitivity problems

### 5. Fix Recommendations
Prioritized action items:
- 301 redirect setup
- Internal link updates
- Server error fixes
- Sitemap cleanup
- Custom 404 page enhancement

Each recommendation includes:
- Priority level (critical/high/medium/low)
- Specific action description
- Affected URLs count
- Estimated effort

### 6. Source References
Shows where each broken URL is referenced from:
- Groups by broken URL
- Lists referrer pages with titles
- Shows up to 10 referrers per URL

### 7. Appendix
Complete list of all broken URLs in table format:
- URL
- HTTP status code
- Error message

## Data Structures

### ReportData

```typescript
interface ReportData {
  crawlResults: PageInfo[];      // Crawl results from sitemap crawler
  sourceLinks: SourceLink[];     // Where broken URLs are referenced
  baseUrl: string;               // Base URL of crawled site
  timestamp: Date;               // When report was generated
  crawlDuration?: number;        // Optional: crawl time in ms
}
```

### SourceLink

```typescript
interface SourceLink {
  brokenUrl: string;             // The broken URL
  referrerUrl: string;           // Page that links to it
  referrerTitle: string;         // Title of referrer page
}
```

### PageInfo

```typescript
interface PageInfo {
  url: string;
  title: string;
  statusCode: number;
  links: string[];
  depth: number;
  parentUrl?: string;
  error?: string;
}
```

## Pattern Detection

The report automatically detects these patterns:

1. **Old Category Structure**: URLs with `/old/` or `/archive/`
2. **Missing Extensions**: URLs without file extensions or trailing slash
3. **Query Parameters**: Dynamic URLs with query params causing 404s
4. **Trailing Slash Issues**: Inconsistent trailing slash handling
5. **Case Sensitivity**: URLs with uppercase letters failing

## Health Score Calculation

```
Health Score = 100 - (Error Rate × 2)
```

- 80-100: Healthy (green)
- 60-79: Warning (yellow)
- 40-59: Poor (orange)
- 0-39: Critical (red)

## Severity Levels

### URL Pattern Severity
- **Critical**: 10+ URLs matching pattern
- **High**: 5-9 URLs matching pattern
- **Medium**: 3-4 URLs matching pattern
- **Low**: 1-2 URLs matching pattern

### Fix Priority
- **Critical**: Server errors, 20+ 404s
- **High**: 15+ internal broken links
- **Medium**: 10-19 404s, sitemap updates
- **Low**: Custom 404 page enhancements

## Example Output

See `example-usage.ts` for a complete working example with sample data and expected output.

## Tips

1. **Source Links**: Always build source links to understand referrer context
2. **Crawl Duration**: Include crawl duration for performance tracking
3. **File Download**: Return as `text/markdown` with `Content-Disposition` header
4. **Incremental Reports**: Generate reports after each crawl for comparison
5. **Pattern Analysis**: Review pattern analysis for systematic issues
6. **Priority**: Start with Critical/High priority recommendations

## Future Enhancements

Potential additions:
- Historical comparison (trend analysis)
- SEO impact scoring
- Redirect rule generation (automated)
- Integration with analytics data
- Custom pattern detection rules
- Multi-language support

## License

MIT
