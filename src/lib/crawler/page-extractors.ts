import { Page } from "playwright";
import { MetaInfo, HeadingInfo, ImageInfo, ContentMetrics, LinkInfo } from "./types";
import { normalizeUrl } from "../utils";

export async function extractMetaInfo(page: Page): Promise<MetaInfo> {
  return page.evaluate(() => {
    const getMeta = (name: string): string | undefined => {
      const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      return el?.getAttribute("content") || undefined;
    };
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || undefined;
    return {
      description: getMeta("description"),
      ogTitle: getMeta("og:title"),
      ogDescription: getMeta("og:description"),
      ogImage: getMeta("og:image"),
      ogUrl: getMeta("og:url"),
      canonical,
      robots: getMeta("robots"),
      keywords: getMeta("keywords"),
    };
  });
}

export async function extractHeadings(page: Page): Promise<HeadingInfo[]> {
  return page.evaluate(() => {
    const headings: { tag: string; text: string }[] = [];
    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
      headings.push({
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim().substring(0, 200) || "",
      });
    });
    return headings;
  });
}

export async function extractImages(page: Page): Promise<ImageInfo[]> {
  return page.evaluate(() => {
    const images: { src: string; alt?: string; hasAlt: boolean; loading?: string }[] = [];
    document.querySelectorAll("img").forEach((img) => {
      images.push({
        src: img.src || img.getAttribute("data-src") || "",
        alt: img.alt || undefined,
        hasAlt: img.hasAttribute("alt") && img.alt.trim().length > 0,
        loading: img.loading || undefined,
      });
    });
    return images;
  });
}

export async function extractContentMetrics(page: Page): Promise<ContentMetrics> {
  return page.evaluate(() => {
    const bodyText = document.body?.innerText || "";
    const words = bodyText.split(/\s+/).filter((w) => w.length > 0);
    return {
      wordCount: words.length,
      scriptCount: document.querySelectorAll("script").length,
      stylesheetCount: document.querySelectorAll('link[rel="stylesheet"], style').length,
      imageCount: document.querySelectorAll("img").length,
      formCount: document.querySelectorAll("form").length,
    };
  });
}

export async function extractLinks(page: Page, baseUrl: string): Promise<{ links: string[]; linksWithText: LinkInfo[] }> {
  const linkElements = await page.locator("a[href]").all();
  const links: string[] = [];
  const linksWithText: LinkInfo[] = [];

  for (const linkElement of linkElements) {
    try {
      const href = await linkElement.getAttribute("href");
      if (href) {
        const absoluteUrl = new URL(href, baseUrl);
        absoluteUrl.hash = "";
        let pathname = absoluteUrl.pathname;
        if (pathname.endsWith("/") && pathname.length > 1) {
          pathname = pathname.slice(0, -1);
        }
        absoluteUrl.pathname = pathname;
        const normalizedUrl = absoluteUrl.toString().toLowerCase();
        links.push(normalizedUrl);

        const anchorText = (await linkElement.textContent())?.trim().substring(0, 200) || "";
        const titleAttr = await linkElement.getAttribute("title");
        linksWithText.push({ url: normalizedUrl, anchorText, title: titleAttr || undefined });
      }
    } catch {
      continue;
    }
  }

  // Check for Next.js Link components and buttons with routing
  const extraNavElements = await page.locator('[data-href], [data-url], [role="link"], button[data-testid*="nav"]').all();

  for (const element of extraNavElements) {
    try {
      const dataHref = (await element.getAttribute("data-href")) || (await element.getAttribute("data-url"));
      if (dataHref) {
        const absoluteUrl = new URL(dataHref, baseUrl);
        absoluteUrl.hash = "";
        let pathname = absoluteUrl.pathname;
        if (pathname.endsWith("/") && pathname.length > 1) {
          pathname = pathname.slice(0, -1);
        }
        absoluteUrl.pathname = pathname;
        const normalizedUrl = absoluteUrl.toString().toLowerCase();
        links.push(normalizedUrl);

        const anchorText = (await element.textContent())?.trim().substring(0, 200) || "";
        linksWithText.push({ url: normalizedUrl, anchorText });
      }
    } catch {
      continue;
    }
  }

  const uniqueLinks = Array.from(new Set(links.map(normalizeUrl)));
  return { links: uniqueLinks, linksWithText };
}

export async function extractAllPageData(page: Page, url: string) {
  const [meta, headings, images, contentMetrics, linkData] = await Promise.all([
    extractMetaInfo(page),
    extractHeadings(page),
    extractImages(page),
    extractContentMetrics(page),
    extractLinks(page, url),
  ]);

  return { meta, headings, images, contentMetrics, ...linkData };
}
