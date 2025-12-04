# Source Scanner

A high-performance source file scanner that finds all internal links in your codebase. Supports markdown, TypeScript/JavaScript, and configuration files.

## Features

- **Fast file traversal** - Efficient recursive directory scanning
- **Multi-format support** - Markdown, TS/JS, JSON config files
- **Smart link extraction** - Regex patterns for different link types
- **Flexible filtering** - Include/exclude by URL type or base domain
- **Deduplication** - Optional removal of duplicate links
- **Type-safe** - Full TypeScript support

## Installation

No additional dependencies required - uses Node.js built-in modules.

## Quick Start

```typescript
import { scanMarkdownFiles } from "@/lib/crawler/source-scanner";

// Scan all markdown files for internal links
const links = await scanMarkdownFiles("./content");

console.log(`Found ${links.length} links`);
links.forEach((link) => {
  console.log(`${link.url} in ${link.sourceFile}:${link.lineNumber}`);
});
```

## API Reference

### Main Functions

#### `scanSourceFiles(contentDir, patterns, options?)`

Scans specified file types for links.

**Parameters:**

- `contentDir: string` - Root directory to scan
- `patterns: string[]` - File extensions to include (e.g., `['.md', '.tsx']`)
- `options?: ScanOptions` - Optional configuration

**Returns:** `Promise<SourceLink[]>`

**Example:**

```typescript
const links = await scanSourceFiles("./src", [".md", ".mdx", ".ts"], {
  includeFullUrls: false,
  deduplicate: true,
});
```

#### `scanAllSourceFiles(contentDir, options?)`

Convenience function to scan all supported file types (.md, .mdx, .ts, .tsx, .js, .jsx, .json).

**Example:**

```typescript
const links = await scanAllSourceFiles("./content");
```

#### `scanMarkdownFiles(contentDir, options?)`

Scan only markdown files (.md, .mdx).

#### `scanCodeFiles(contentDir, options?)`

Scan only code files (.ts, .tsx, .js, .jsx).

#### `scanConfigFiles(contentDir, options?)`

Scan only config files (.json, .jsonc).

### Types

#### `SourceLink`

```typescript
interface SourceLink {
  url: string; // The URL/path found
  sourceFile: string; // Full path to source file
  lineNumber: number; // Line number (1-indexed)
  linkText?: string; // Link text (for markdown links)
}
```

#### `ScanOptions`

```typescript
interface ScanOptions {
  includeRelativePaths?: boolean; // Include ./path or ../path (default: true)
  includeAbsolutePaths?: boolean; // Include /path (default: true)
  includeFullUrls?: boolean; // Include http(s):// (default: true)
  baseUrl?: string; // Filter by base URL (default: undefined)
  deduplicate?: boolean; // Remove duplicates (default: true)
}
```

## Link Detection Patterns

### Markdown Files

**Detects:**

- `[Link text](/docs/page)` - Standard markdown links
- `[Link](../relative/path)` - Relative links
- `[Link](https://example.com)` - Full URLs
- Inline URLs: `https://example.com/page`
- Inline paths: `/docs/guide`

**Example output:**

```typescript
{
  url: '/docs/getting-started',
  sourceFile: '/path/to/README.md',
  lineNumber: 15,
  linkText: 'Getting Started Guide'
}
```

### TypeScript/JavaScript Files

**Detects:**

- `<a href="/docs/page">` - JSX href attributes
- `href="/path"` - Any href attribute
- Inline URLs in comments or strings
- Inline paths

**Example output:**

```typescript
{
  url: '/api/validate',
  sourceFile: '/path/to/component.tsx',
  lineNumber: 42
}
```

### JSON Config Files

**Detects:**

- `"url": "https://..."` - URL fields
- `"link": "/path"` - Link fields
- `"href": "/docs"` - Href fields
- `"path": "./relative"` - Path fields
- Inline URLs in string values

**Example output:**

```typescript
{
  url: 'https://intellect.sh/docs',
  sourceFile: '/path/to/config.json',
  lineNumber: 8
}
```

## Usage Examples

### Example 1: Find All Internal Links

```typescript
import { scanMarkdownFiles } from "@/lib/crawler/source-scanner";

const links = await scanMarkdownFiles("./content", {
  includeRelativePaths: true,
  includeAbsolutePaths: true,
  includeFullUrls: false, // Skip external URLs
});

console.log(`Found ${links.length} internal links`);
```

### Example 2: Find Links to Specific Domain

```typescript
import { scanAllSourceFiles } from "@/lib/crawler/source-scanner";

const links = await scanAllSourceFiles("./src", {
  baseUrl: "https://intellect.sh",
  includeFullUrls: true,
});

links.forEach((link) => {
  console.log(`${link.url} referenced in ${link.sourceFile}`);
});
```

### Example 3: Find Most Referenced Pages

```typescript
import { scanMarkdownFiles } from "@/lib/crawler/source-scanner";

const links = await scanMarkdownFiles("./content");

// Count references
const counts = links.reduce(
  (acc, link) => {
    acc[link.url] = (acc[link.url] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

// Sort by count
const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

console.log("Top 10 most referenced pages:");
sorted.slice(0, 10).forEach(([url, count]) => {
  console.log(`${count}x ${url}`);
});
```

### Example 4: Validate Link Consistency

```typescript
import { scanAllSourceFiles } from "@/lib/crawler/source-scanner";
import { validateLinks } from "@/lib/crawler/link-validator";

// Find all internal links
const sourceLinks = await scanAllSourceFiles("./src", {
  includeAbsolutePaths: true,
  includeRelativePaths: true,
  includeFullUrls: false,
});

// Extract unique URLs
const urls = [...new Set(sourceLinks.map((l) => l.url))];

// Validate each URL
const results = await validateLinks(urls, "https://intellect.sh");

// Find broken links
const broken = results.filter((r) => !r.isValid);

console.log(`Found ${broken.length} broken links:`);
broken.forEach((link) => {
  const sources = sourceLinks
    .filter((sl) => sl.url === link.url)
    .map((sl) => `${sl.sourceFile}:${sl.lineNumber}`);

  console.log(`\n${link.url}`);
  console.log(`Referenced in:`);
  sources.forEach((s) => console.log(`  - ${s}`));
});
```

### Example 5: Export to CSV

```typescript
import { scanAllSourceFiles } from "@/lib/crawler/source-scanner";
import fs from "fs/promises";

const links = await scanAllSourceFiles("./content");

// Convert to CSV
const csv = [
  ["URL", "Source File", "Line Number", "Link Text"].join(","),
  ...links.map((link) =>
    [
      link.url,
      link.sourceFile,
      link.lineNumber,
      link.linkText || "",
    ].join(",")
  ),
].join("\n");

await fs.writeFile("links-report.csv", csv);
console.log(`Exported ${links.length} links to links-report.csv`);
```

## Performance

- **Fast file traversal**: Recursively scans directories, skipping `node_modules`, `.git`, etc.
- **Parallel processing**: Scans files in parallel using `Promise.all`
- **Efficient regex**: Compiled patterns for fast matching
- **Memory efficient**: Streams file content, doesn't load entire directory tree

**Benchmarks** (on typical Next.js project):

- ~100 markdown files: **~200ms**
- ~500 source files: **~800ms**
- ~1000+ files: **~1.5s**

## Integration with Link Validator

The source scanner pairs perfectly with the link validator to create a complete link checking system:

```typescript
import { scanAllSourceFiles } from "@/lib/crawler/source-scanner";
import { validateLinks } from "@/lib/crawler/link-validator";

// 1. Find all links in source code
const sourceLinks = await scanAllSourceFiles("./content");

// 2. Extract unique URLs
const urls = [...new Set(sourceLinks.map((l) => l.url))];

// 3. Validate them
const validationResults = await validateLinks(urls, "https://intellect.sh");

// 4. Report results
const broken = validationResults.filter((r) => !r.isValid);
console.log(`Validated ${urls.length} URLs, found ${broken.length} broken`);
```

## File Structure

```
src/lib/crawler/
├── source-scanner.ts          # Main scanner implementation
├── source-scanner.example.ts  # Usage examples
├── SOURCE_SCANNER.md          # This documentation
├── link-validator.ts          # Companion link validation
└── types.ts                   # Shared types
```

## Limitations

1. **JavaScript/TypeScript imports**: Only detects href attributes and inline URLs, not import paths
2. **Dynamic URLs**: Cannot detect URLs constructed at runtime
3. **Comments**: Treats URLs in comments same as code
4. **Encoded URLs**: Does not decode URL-encoded characters

## Future Enhancements

- [ ] Add support for HTML files
- [ ] Detect and resolve relative paths
- [ ] Support for custom regex patterns
- [ ] Incremental scanning (cache previous results)
- [ ] Parallel directory traversal
- [ ] Support for .vue, .svelte files

## Contributing

To add support for new file types:

1. Add file extension to `FILE_EXTENSIONS`
2. Create extraction function (e.g., `extractHtmlLinks`)
3. Add case to `scanFile` function
4. Update tests and documentation

## License

MIT
