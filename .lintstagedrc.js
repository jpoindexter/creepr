module.exports = {
  // TypeScript/JavaScript files
  "src/**/*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],

  // Configuration files
  "*.{ts,tsx,js,jsx,mjs}": ["eslint --fix", "prettier --write"],

  // JSON files
  "*.json": ["prettier --write"],

  // Markdown files
  "*.md": ["prettier --write"],

  // CSS files
  "*.css": ["prettier --write"],
};
