import { MobileResponsiveness } from "./types";
import { Page } from "playwright";

/**
 * Analyze mobile responsiveness of a page
 */
export async function analyzeMobileResponsiveness(page: Page): Promise<MobileResponsiveness> {
  const issues: string[] = [];
  const passed: string[] = [];
  let score = 0;

  try {
    const analysis = await page.evaluate(() => {
      // Check viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const hasViewportMeta = !!viewportMeta;
      const viewportContent = viewportMeta?.getAttribute("content") || undefined;

      // Check for responsive CSS features
      let hasMobileMediaQueries = false;
      let hasFlexboxOrGrid = false;
      let hasResponsiveImages = false;

      // Check stylesheets for media queries and responsive patterns
      const styleSheets = Array.from(document.styleSheets);
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            // Check for media queries
            if (rule instanceof CSSMediaRule) {
              const mediaText = rule.conditionText || rule.media?.mediaText || "";
              if (mediaText.includes("max-width") || mediaText.includes("min-width")) {
                hasMobileMediaQueries = true;
              }
            }
            // Check for flexbox/grid
            if (rule instanceof CSSStyleRule) {
              const style = rule.style;
              if (
                style.display === "flex" ||
                style.display === "grid" ||
                style.display === "inline-flex" ||
                style.display === "inline-grid"
              ) {
                hasFlexboxOrGrid = true;
              }
            }
          }
        } catch {
          // Cross-origin stylesheet, skip
        }
      }

      // Check for responsive images
      const images = document.querySelectorAll("img");
      hasResponsiveImages = Array.from(images).some((img) => {
        return (
          img.hasAttribute("srcset") ||
          img.hasAttribute("sizes") ||
          img.style.maxWidth === "100%" ||
          getComputedStyle(img).maxWidth === "100%"
        );
      });

      // Count small touch targets (< 44px in either dimension)
      const interactiveElements = document.querySelectorAll(
        "a, button, input, select, textarea, [role='button'], [tabindex]:not([tabindex='-1'])"
      );
      let smallTouchTargets = 0;
      const MIN_TOUCH_TARGET = 44;

      for (const el of interactiveElements) {
        const rect = el.getBoundingClientRect();
        // Only count visible elements
        if (rect.width > 0 && rect.height > 0) {
          if (rect.width < MIN_TOUCH_TARGET || rect.height < MIN_TOUCH_TARGET) {
            smallTouchTargets++;
          }
        }
      }

      return {
        hasViewportMeta,
        viewportContent,
        hasMobileMediaQueries,
        hasFlexboxOrGrid,
        hasResponsiveImages,
        smallTouchTargets,
      };
    });

    // Calculate score and build issues/passed lists

    // Viewport meta (30 points)
    if (analysis.hasViewportMeta) {
      passed.push("Has viewport meta tag");
      score += 30;

      // Check viewport content for proper configuration
      const content = analysis.viewportContent || "";
      if (content.includes("width=device-width")) {
        passed.push("Viewport uses device-width");
        score += 10;
      } else {
        issues.push("Viewport should use width=device-width");
      }
    } else {
      issues.push("Missing viewport meta tag");
    }

    // Responsive CSS features (20 points each)
    if (analysis.hasMobileMediaQueries) {
      passed.push("Uses responsive media queries");
      score += 20;
    } else {
      issues.push("No responsive media queries detected");
    }

    if (analysis.hasFlexboxOrGrid) {
      passed.push("Uses flexbox or CSS grid");
      score += 10;
    }

    if (analysis.hasResponsiveImages) {
      passed.push("Has responsive images");
      score += 10;
    } else {
      issues.push("Images may not be responsive");
    }

    // Touch targets (20 points, deduct for issues)
    if (analysis.smallTouchTargets === 0) {
      passed.push("All touch targets meet 44px minimum");
      score += 20;
    } else if (analysis.smallTouchTargets <= 5) {
      issues.push(`${analysis.smallTouchTargets} touch targets below 44px`);
      score += 10;
    } else {
      issues.push(`${analysis.smallTouchTargets} touch targets below 44px (WCAG fail)`);
    }

    return {
      ...analysis,
      score: Math.min(100, score),
      issues,
      passed,
    };
  } catch {
    return {
      hasViewportMeta: false,
      hasMobileMediaQueries: false,
      hasFlexboxOrGrid: false,
      hasResponsiveImages: false,
      smallTouchTargets: 0,
      score: 0,
      issues: ["Failed to analyze mobile responsiveness"],
      passed: [],
    };
  }
}

/**
 * Get a mobile-friendliness grade based on score
 */
export function getMobileGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}
