#!/usr/bin/env node

/**
 * Component Validator
 *
 * Ensures 'use client' directive is present when needed:
 * - React hooks (useState, useEffect, etc.)
 * - Browser APIs (window, document, localStorage, etc.)
 * - Event handlers (onClick, onChange, etc.)
 */

const { execSync } = require("child_process");
const fs = require("fs");

// Get list of staged React component files
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM "*.tsx" "*.jsx"', {
      encoding: "utf-8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch (error) {
    return [];
  }
}

// Client-side patterns that require 'use client'
const CLIENT_PATTERNS = [
  {
    name: "React hooks",
    pattern:
      /\buse(State|Effect|Context|Ref|Memo|Callback|Reducer|LayoutEffect|ImperativeHandle|DebugValue|Id|Transition|DeferredValue|SyncExternalStore|InsertionEffect)\(/,
  },
  {
    name: "Browser APIs (window)",
    pattern: /\bwindow\./,
  },
  {
    name: "Browser APIs (document)",
    pattern: /\bdocument\./,
  },
  {
    name: "Browser APIs (localStorage)",
    pattern: /\blocalStorage\./,
  },
  {
    name: "Browser APIs (sessionStorage)",
    pattern: /\bsessionStorage\./,
  },
  {
    name: "Event handlers",
    pattern:
      /\bon(Click|Change|Submit|Input|KeyDown|KeyUp|KeyPress|MouseEnter|MouseLeave|Focus|Blur|Load|Error|Scroll)\s*=\s*{/,
  },
];

// Check if file has 'use client' directive
function hasUseClient(content) {
  // Must be at the very top, before any imports
  const lines = content.split("\n");
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line === "'use client';" || line === '"use client";') {
      return true;
    }
    // Stop if we hit an import or other code
    if (line && !line.startsWith("//") && !line.startsWith("/*")) {
      break;
    }
  }
  return false;
}

// Validate component
function validateComponent(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const violations = [];

  // Skip if already has 'use client'
  if (hasUseClient(content)) {
    return violations;
  }

  // Skip if it's a server component or utility file (no JSX)
  if (!content.includes("return (") && !content.includes("return<")) {
    return violations;
  }

  // Check for client-side patterns
  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    CLIENT_PATTERNS.forEach(({ name, pattern }) => {
      if (pattern.test(line)) {
        violations.push({
          line: lineNumber,
          code: line.trim(),
          pattern: name,
        });
      }
    });
  });

  return violations;
}

// Main validation
function main() {
  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    process.exit(0);
  }

  let hasViolations = false;
  const allViolations = [];

  for (const file of stagedFiles) {
    if (!fs.existsSync(file)) {
      continue;
    }

    // Skip files in certain directories (e.g., app/api, server-only utils)
    if (file.includes("/api/") || file.includes("/lib/")) {
      continue;
    }

    const violations = validateComponent(file);

    if (violations.length > 0) {
      hasViolations = true;
      allViolations.push({ file, violations });
    }
  }

  if (hasViolations) {
    console.error("\n❌ MISSING 'use client' DIRECTIVE\n");

    allViolations.forEach(({ file, violations }) => {
      console.error(`  ${file}`);
      console.error(`    Issue: Client-side code detected without 'use client' directive\n`);

      // Group violations by pattern
      const patterns = new Set(violations.map((v) => v.pattern));
      patterns.forEach((pattern) => {
        const examples = violations.filter((v) => v.pattern === pattern);
        console.error(`    Pattern: ${pattern}`);
        examples.slice(0, 2).forEach(({ line, code }) => {
          console.error(`      Line ${line}: ${code}`);
        });
        if (examples.length > 2) {
          console.error(`      ... and ${examples.length - 2} more`);
        }
        console.error("");
      });

      console.error(`    Fix: Add 'use client'; as the first line of the file\n`);
    });

    console.error("💡 Next.js App Router: Server Components vs Client Components");
    console.error("    - Server Components: Default, render on server, no client-side JS");
    console.error("    - Client Components: Require 'use client', can use hooks/browser APIs\n");

    console.error("Example:");
    console.error("    'use client';");
    console.error("");
    console.error("    import { useState } from 'react';");
    console.error("");
    console.error("    export default function MyComponent() {");
    console.error("      const [count, setCount] = useState(0);");
    console.error("      return <button onClick={() => setCount(count + 1)}>{count}</button>;");
    console.error("    }\n");

    process.exit(1);
  }

  process.exit(0);
}

main();
