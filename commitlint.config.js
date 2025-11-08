module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation changes
        "style", // Code style changes (formatting, semicolons, etc.)
        "refactor", // Code refactoring
        "perf", // Performance improvements
        "test", // Adding or updating tests
        "build", // Build system or dependency changes
        "ci", // CI/CD changes
        "chore", // Other changes (maintenance, config, etc.)
        "revert", // Revert a previous commit
      ],
    ],
    "subject-case": [0], // Allow any case for subject
    "subject-max-length": [2, "always", 100], // Max 100 chars for subject
  },
};
