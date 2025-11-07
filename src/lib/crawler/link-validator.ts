import { LinkStatus } from '@/types/sitemap';

export function getLinkStatus(statusCode: number): LinkStatus {
  if (statusCode >= 200 && statusCode < 300) return 'success';
  if (statusCode >= 300 && statusCode < 400) return 'redirect';
  if (statusCode >= 400 && statusCode < 500) return 'client-error';
  if (statusCode >= 500) return 'server-error';
  return 'unknown';
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

export function shouldCrawlUrl(
  url: string,
  baseUrl: string,
  visitedUrls: Set<string>
): boolean {
  // Check if already visited
  if (visitedUrls.has(url)) {
    return false;
  }

  // Check if valid HTTP(S) URL
  if (!isValidHttpUrl(url)) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    const parsedBaseUrl = new URL(baseUrl);

    // Only crawl same origin (host + port)
    return (
      parsedUrl.hostname === parsedBaseUrl.hostname &&
      parsedUrl.port === parsedBaseUrl.port
    );
  } catch {
    return false;
  }
}

export function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];

  // Match href attributes in anchor tags
  const hrefRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  let match;

  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];

    try {
      // Resolve relative URLs
      const absoluteUrl = new URL(href, baseUrl);

      // Remove hash fragments
      absoluteUrl.hash = '';

      // Normalize trailing slashes
      let pathname = absoluteUrl.pathname;
      if (pathname.endsWith('/') && pathname.length > 1) {
        pathname = pathname.slice(0, -1);
      }
      absoluteUrl.pathname = pathname;

      links.push(absoluteUrl.toString());
    } catch {
      // Skip invalid URLs
      continue;
    }
  }

  // Remove duplicates
  return Array.from(new Set(links));
}
