import { Page, Locator } from "playwright";

export type InteractiveElementType = "tab" | "modal" | "accordion" | "dropdown" | "button";

export interface InteractiveElement {
  type: InteractiveElementType;
  label: string;
  selector: string;
  element: Locator;
  isClickable: boolean;
}

/**
 * Blacklisted button text patterns (case-insensitive)
 * These buttons should NOT be clicked during crawling
 */
const BLACKLISTED_PATTERNS = [
  "logout",
  "sign out",
  "log out",
  "delete",
  "remove",
  "purchase",
  "buy",
  "pay",
  "checkout",
  "submit payment",
  "confirm delete",
  "cancel account",
  "deactivate",
  "unsubscribe",
  "clear all",
  "reset",
  "submit", // Avoid form submissions
  "send", // Avoid sending emails/messages
];

/**
 * Maximum number of interactive elements to detect per page
 * Prevents performance issues and excessive crawling
 */
export const MAX_INTERACTIVE_ELEMENTS = 100;

/**
 * Timeout for detecting interactive elements (milliseconds)
 */
export const DETECTION_TIMEOUT = 10000; // 10 seconds

/**
 * Check if element text matches blacklist patterns
 */
function isBlacklisted(text: string): boolean {
  const lowerText = text.toLowerCase().trim();
  return BLACKLISTED_PATTERNS.some((pattern) => lowerText.includes(pattern));
}

/**
 * Detect all interactive elements on a page with timeout and limits
 */
export async function detectInteractiveElements(page: Page): Promise<InteractiveElement[]> {
  const elements: InteractiveElement[] = [];

  try {
    // Set a timeout for the entire detection process
    const detectionPromise = detectElementsInternal(page, elements);
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error("Detection timeout")), DETECTION_TIMEOUT)
    );

    await Promise.race([detectionPromise, timeoutPromise]);
  } catch (error) {
    if (error instanceof Error && error.message === "Detection timeout") {
      console.warn(`Interactive element detection timed out after ${DETECTION_TIMEOUT}ms`);
    } else {
      console.error("Error detecting interactive elements:", error);
    }
  }

  // Enforce maximum element limit
  if (elements.length > MAX_INTERACTIVE_ELEMENTS) {
    console.warn(
      `Found ${elements.length} interactive elements, limiting to ${MAX_INTERACTIVE_ELEMENTS}`
    );
    return elements.slice(0, MAX_INTERACTIVE_ELEMENTS);
  }

  return elements;
}

/**
 * Internal detection logic (called by detectInteractiveElements with timeout)
 */
async function detectElementsInternal(page: Page, elements: InteractiveElement[]): Promise<void> {
  try {
    // 1. Detect Tabs
    const tabSelectors = [
      '[role="tab"]',
      '[data-state="active"]',
      '[data-state="inactive"]',
      "button[aria-selected]",
      ".tab:not(.tab-content)",
      '[data-radix-collection-item][role="tab"]', // Radix UI tabs
    ];

    for (const selector of tabSelectors) {
      const tabs = await page.locator(selector).all();
      for (const tab of tabs) {
        try {
          if (!(await tab.isVisible())) continue;

          const text = await tab.textContent();
          const label = text?.trim() || "Unnamed Tab";

          if (label && !isBlacklisted(label)) {
            elements.push({
              type: "tab",
              label,
              selector,
              element: tab,
              isClickable: await tab.isEnabled(),
            });
          }
        } catch {
          // Skip element if it became detached
          continue;
        }
      }
    }

    // 2. Detect Modals/Dialogs
    const modalTriggerSelectors = [
      "button[data-modal]",
      "button[data-dialog]",
      '[data-testid*="modal"]',
      '[data-testid*="dialog"]',
      'button:has-text("Login")',
      'button:has-text("Sign Up")',
      'button:has-text("Sign In")',
      'button:has-text("Add")',
      'button:has-text("Create")',
      'button:has-text("New")',
    ];

    for (const selector of modalTriggerSelectors) {
      try {
        const triggers = await page.locator(selector).all();
        for (const trigger of triggers) {
          try {
            if (!(await trigger.isVisible())) continue;

            const text = await trigger.textContent();
            const label = text?.trim() || "Modal Trigger";

            if (label && !isBlacklisted(label)) {
              elements.push({
                type: "modal",
                label,
                selector,
                element: trigger,
                isClickable: await trigger.isEnabled(),
              });
            }
          } catch {
            continue;
          }
        }
      } catch {
        // Selector might not match anything
        continue;
      }
    }

    // 3. Detect Accordions
    const accordionSelectors = [
      '[role="button"][aria-expanded]',
      "details summary",
      ".accordion-trigger",
      "[data-radix-collection-item][data-state]", // Radix UI accordion
    ];

    for (const selector of accordionSelectors) {
      const accordions = await page.locator(selector).all();
      for (const accordion of accordions) {
        try {
          if (!(await accordion.isVisible())) continue;

          const text = await accordion.textContent();
          const label = text?.trim() || "Accordion Section";

          if (label && !isBlacklisted(label)) {
            elements.push({
              type: "accordion",
              label,
              selector,
              element: accordion,
              isClickable: await accordion.isEnabled(),
            });
          }
        } catch {
          continue;
        }
      }
    }

    // 4. Detect Dropdowns
    const dropdownSelectors = [
      '[role="menu"]',
      '[role="listbox"]',
      ".dropdown-trigger",
      'button[aria-haspopup="true"]',
      "select",
    ];

    for (const selector of dropdownSelectors) {
      const dropdowns = await page.locator(selector).all();
      for (const dropdown of dropdowns) {
        try {
          if (!(await dropdown.isVisible())) continue;

          const text = await dropdown.textContent();
          const ariaLabel = await dropdown.getAttribute("aria-label");
          const label = text?.trim() || ariaLabel || "Dropdown Menu";

          if (label && !isBlacklisted(label)) {
            elements.push({
              type: "dropdown",
              label,
              selector,
              element: dropdown,
              isClickable: await dropdown.isEnabled(),
            });
          }
        } catch {
          continue;
        }
      }
    }

    // 5. Detect Interactive Buttons (catch-all)
    const buttons = await page.locator('button:visible, [role="button"]:visible').all();

    for (const button of buttons) {
      try {
        // Skip if already categorized (tab, modal trigger, etc.)
        const alreadyCategorized = elements.some((el) => {
          try {
            return el.element === button;
          } catch {
            return false;
          }
        });

        if (alreadyCategorized) continue;
        if (!(await button.isVisible())) continue;

        const text = await button.textContent();
        const label = text?.trim() || "Button";

        // Skip empty buttons or blacklisted
        if (!label || label === "Button" || isBlacklisted(label)) continue;

        // Skip buttons inside forms (to avoid form submission)
        const isInForm = await button.evaluate((el) => {
          return el.closest("form") !== null;
        });
        if (isInForm) continue;

        elements.push({
          type: "button",
          label,
          selector: "button",
          element: button,
          isClickable: await button.isEnabled(),
        });
      } catch {
        continue;
      }
    }
  } catch (error) {
    console.error("Error in detectElementsInternal:", error);
  }
}

/**
 * Group interactive elements by type
 */
export function groupElementsByType(
  elements: InteractiveElement[]
): Record<InteractiveElementType, InteractiveElement[]> {
  return {
    tab: elements.filter((el) => el.type === "tab"),
    modal: elements.filter((el) => el.type === "modal"),
    accordion: elements.filter((el) => el.type === "accordion"),
    dropdown: elements.filter((el) => el.type === "dropdown"),
    button: elements.filter((el) => el.type === "button"),
  };
}
