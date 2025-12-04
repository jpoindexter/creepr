import { Page } from "playwright";
import {
  PageStyles,
  InlineStyle,
  ExternalStylesheet,
  CSSVariables,
  ElementStyles,
} from "./types";

// Key selectors for design system elements
const KEY_SELECTORS = [
  // Buttons
  "button",
  'button[type="submit"]',
  ".btn",
  ".button",
  // Headings
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  // Text
  "p",
  "a",
  "span",
  "label",
  // Form elements
  "input",
  "textarea",
  "select",
  // Cards & containers
  ".card",
  ".container",
  ".wrapper",
  ".modal",
  ".dialog",
  // Navigation
  "nav",
  "header",
  "footer",
  ".nav",
  ".navbar",
  // Lists
  "ul",
  "ol",
  "li",
  // Tables
  "table",
  "th",
  "td",
  // Common UI patterns
  ".badge",
  ".tag",
  ".chip",
  ".alert",
  ".toast",
  ".tooltip",
  ".dropdown",
  ".menu",
  ".tabs",
  ".tab",
  ".panel",
  ".accordion",
];

// Extract computed styles for a given element
function getComputedStylesForElement(el: Element): ElementStyles["computedStyles"] {
  const styles = window.getComputedStyle(el);
  return {
    // Typography
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    lineHeight: styles.lineHeight,
    letterSpacing: styles.letterSpacing,
    textTransform: styles.textTransform,
    // Colors
    color: styles.color,
    backgroundColor: styles.backgroundColor,
    borderColor: styles.borderColor,
    // Spacing
    padding: styles.padding,
    margin: styles.margin,
    gap: styles.gap,
    // Border & Shape
    borderRadius: styles.borderRadius,
    borderWidth: styles.borderWidth,
    borderStyle: styles.borderStyle,
    // Shadow
    boxShadow: styles.boxShadow,
    textShadow: styles.textShadow,
    // Layout
    display: styles.display,
    flexDirection: styles.flexDirection,
    justifyContent: styles.justifyContent,
    alignItems: styles.alignItems,
    // Size
    width: styles.width,
    height: styles.height,
    maxWidth: styles.maxWidth,
    minHeight: styles.minHeight,
  };
}

// Extract unique values from styles
function extractUniqueValues(allCSS: string): {
  colors: string[];
  fonts: string[];
  borderRadii: string[];
  spacings: string[];
} {
  const colors = new Set<string>();
  const fonts = new Set<string>();
  const borderRadii = new Set<string>();
  const spacings = new Set<string>();

  // Extract hex colors
  const hexColors = allCSS.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  hexColors.forEach((c) => colors.add(c.toLowerCase()));

  // Extract rgb/rgba colors
  const rgbColors = allCSS.match(/rgba?\([^)]+\)/g) || [];
  rgbColors.forEach((c) => colors.add(c));

  // Extract hsl/hsla colors
  const hslColors = allCSS.match(/hsla?\([^)]+\)/g) || [];
  hslColors.forEach((c) => colors.add(c));

  // Extract oklch colors (modern CSS)
  const oklchColors = allCSS.match(/oklch\([^)]+\)/g) || [];
  oklchColors.forEach((c) => colors.add(c));

  // Extract font families
  const fontMatches = allCSS.match(/font-family:\s*([^;]+)/g) || [];
  fontMatches.forEach((f) => {
    const value = f.replace("font-family:", "").trim();
    fonts.add(value);
  });

  // Extract border-radius values
  const radiusMatches = allCSS.match(/border-radius:\s*([^;]+)/g) || [];
  radiusMatches.forEach((r) => {
    const value = r.replace("border-radius:", "").trim();
    borderRadii.add(value);
  });

  // Extract common spacing values (padding, margin, gap)
  const spacingMatches = allCSS.match(/(padding|margin|gap):\s*([^;]+)/g) || [];
  spacingMatches.forEach((s) => {
    const value = s.split(":")[1]?.trim();
    if (value) spacings.add(value);
  });

  return {
    colors: Array.from(colors).sort(),
    fonts: Array.from(fonts).sort(),
    borderRadii: Array.from(borderRadii).sort(),
    spacings: Array.from(spacings).sort(),
  };
}

// Count CSS rules in a stylesheet
function countCSSRules(css: string): number {
  const ruleMatches = css.match(/\{[^}]*\}/g);
  return ruleMatches?.length || 0;
}

export async function extractPageStyles(page: Page): Promise<PageStyles> {
  // Get inline styles and CSS variables from the page
  const pageData = await page.evaluate(() => {
    // Get all inline <style> tags
    const inlineStyles: InlineStyle[] = Array.from(document.querySelectorAll("style")).map(
      (style) => ({
        content: style.textContent || "",
        mediaQuery: style.getAttribute("media") || undefined,
      })
    );

    // Get all linked stylesheet URLs
    const stylesheetLinks = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]')
    ).map((link) => ({
      href: link.getAttribute("href") || "",
      mediaQuery: link.getAttribute("media") || undefined,
    }));

    // Get CSS custom properties from :root
    const cssVariables: CSSVariables = {};
    const rootStyles = getComputedStyle(document.documentElement);
    for (const prop of Array.from(rootStyles)) {
      if (prop.startsWith("--")) {
        cssVariables[prop] = rootStyles.getPropertyValue(prop).trim();
      }
    }

    // Get computed styles for key UI elements
    const keySelectors = [
      "button", 'button[type="submit"]', ".btn", ".button",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "a", "span", "label",
      "input", "textarea", "select",
      ".card", ".container", ".wrapper", ".modal", ".dialog",
      "nav", "header", "footer", ".nav", ".navbar",
      "ul", "ol", "li",
      "table", "th", "td",
      ".badge", ".tag", ".chip", ".alert", ".toast",
      ".tooltip", ".dropdown", ".menu", ".tabs", ".tab",
      ".panel", ".accordion",
    ];

    const elementStyles: ElementStyles[] = [];
    const seenElements = new Set<Element>();

    for (const selector of keySelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
          // Only capture first 3 of each type to avoid huge outputs
          if (index >= 3 || seenElements.has(el)) return;
          seenElements.add(el);

          const styles = window.getComputedStyle(el);
          elementStyles.push({
            selector: selector + (index > 0 ? `[${index}]` : ""),
            element: el.tagName.toLowerCase(),
            classes: Array.from(el.classList),
            computedStyles: {
              fontFamily: styles.fontFamily,
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight,
              lineHeight: styles.lineHeight,
              letterSpacing: styles.letterSpacing,
              textTransform: styles.textTransform,
              color: styles.color,
              backgroundColor: styles.backgroundColor,
              borderColor: styles.borderColor,
              padding: styles.padding,
              margin: styles.margin,
              gap: styles.gap,
              borderRadius: styles.borderRadius,
              borderWidth: styles.borderWidth,
              borderStyle: styles.borderStyle,
              boxShadow: styles.boxShadow,
              textShadow: styles.textShadow,
              display: styles.display,
              flexDirection: styles.flexDirection,
              justifyContent: styles.justifyContent,
              alignItems: styles.alignItems,
              width: styles.width,
              height: styles.height,
              maxWidth: styles.maxWidth,
              minHeight: styles.minHeight,
            },
          });
        });
      } catch {
        // Invalid selector, skip
      }
    }

    return { inlineStyles, stylesheetLinks, cssVariables, elementStyles };
  });

  // Fetch external stylesheets
  const externalStylesheets: ExternalStylesheet[] = await Promise.all(
    pageData.stylesheetLinks.map(async (link) => {
      if (!link.href) {
        return { href: "", mediaQuery: link.mediaQuery };
      }

      try {
        // Try to get the stylesheet content via page.evaluate using fetch
        const content = await page.evaluate(async (href) => {
          try {
            // Handle relative URLs
            const url = new URL(href, window.location.origin);
            const response = await fetch(url.toString());
            if (response.ok) {
              return await response.text();
            }
            return null;
          } catch {
            return null;
          }
        }, link.href);

        return {
          href: link.href,
          content: content || undefined,
          mediaQuery: link.mediaQuery,
          fetchError: content ? undefined : "Failed to fetch stylesheet",
        };
      } catch (error) {
        return {
          href: link.href,
          mediaQuery: link.mediaQuery,
          fetchError: error instanceof Error ? error.message : "Unknown error",
        };
      }
    })
  );

  // Combine all CSS into raw string
  const allCSS = [
    ...pageData.inlineStyles.map((s) => s.content),
    ...externalStylesheets.map((s) => s.content || ""),
  ].join("\n");

  // Extract unique values for design system analysis
  const uniqueValues = extractUniqueValues(allCSS);

  // Count total rules
  const totalRules = countCSSRules(allCSS);

  return {
    inlineStyles: pageData.inlineStyles,
    externalStylesheets,
    cssVariables: pageData.cssVariables,
    elementStyles: pageData.elementStyles,
    rawCSS: allCSS,
    totalRules,
    uniqueColors: uniqueValues.colors,
    uniqueFonts: uniqueValues.fonts,
    uniqueBorderRadii: uniqueValues.borderRadii,
    uniqueSpacings: uniqueValues.spacings,
  };
}
