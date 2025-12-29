import { KeywordDensity } from "./types";
import { Page } from "playwright";

// Common stop words to filter out
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "she",
  "that",
  "the",
  "to",
  "was",
  "were",
  "will",
  "with",
  "you",
  "your",
  "this",
  "they",
  "their",
  "there",
  "been",
  "being",
  "had",
  "has",
  "have",
  "having",
  "do",
  "does",
  "did",
  "done",
  "doing",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "cannot",
  "not",
  "but",
  "if",
  "than",
  "then",
  "so",
  "just",
  "about",
  "also",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "all",
  "any",
  "no",
  "nor",
  "only",
  "own",
  "same",
  "too",
  "very",
  "what",
  "which",
  "who",
  "whom",
  "why",
  "how",
  "when",
  "where",
  "here",
  "am",
  "get",
  "got",
  "our",
  "us",
  "we",
  "me",
  "my",
  "i",
  "him",
  "her",
  "them",
]);

/**
 * Extract visible text content from a page
 */
export async function extractPageText(page: Page): Promise<string> {
  try {
    return await page.evaluate(() => {
      // Get all text content from body, excluding scripts and styles
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tagName = parent.tagName.toLowerCase();
          // Skip script, style, and hidden elements
          if (tagName === "script" || tagName === "style" || tagName === "noscript") {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip hidden elements
          const style = window.getComputedStyle(parent);
          if (style.display === "none" || style.visibility === "hidden") {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        },
      });

      const textParts: string[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const text = node.textContent?.trim();
        if (text && text.length > 0) {
          textParts.push(text);
        }
      }

      return textParts.join(" ");
    });
  } catch {
    return "";
  }
}

/**
 * Analyze keyword density from text content
 */
export function analyzeKeywordDensity(text: string, topN: number = 15): KeywordDensity {
  // Normalize text: lowercase, remove punctuation, split into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Remove punctuation
    .split(/\s+/)
    .filter((word) => {
      // Filter out:
      // - Empty strings
      // - Single characters
      // - Numbers only
      // - Stop words
      // - Very short words (less than 3 chars)
      return word.length >= 3 && !STOP_WORDS.has(word) && !/^\d+$/.test(word);
    });

  if (words.length === 0) {
    return {
      topKeywords: [],
      totalWords: 0,
      uniqueWords: 0,
      averageWordLength: 0,
    };
  }

  // Count word frequencies
  const wordCounts = new Map<string, number>();
  let totalLength = 0;

  for (const word of words) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    totalLength += word.length;
  }

  // Sort by frequency and get top N
  const sortedWords = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  const totalWords = words.length;

  return {
    topKeywords: sortedWords.map(([word, count]) => ({
      word,
      count,
      density: Number(((count / totalWords) * 100).toFixed(2)),
    })),
    totalWords,
    uniqueWords: wordCounts.size,
    averageWordLength: Number((totalLength / totalWords).toFixed(1)),
  };
}

/**
 * Analyze keyword density for a page
 */
export async function analyzePageKeywords(page: Page): Promise<KeywordDensity> {
  const text = await extractPageText(page);
  return analyzeKeywordDensity(text);
}
