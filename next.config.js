/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Explicitly set project root to avoid lockfile confusion
  outputFileTracingRoot: __dirname,
  // Externalize Playwright and Crawlee packages (native Node.js modules)
  serverExternalPackages: [
    "playwright",
    "playwright-core",
    "@crawlee/playwright",
    "@crawlee/browser-pool",
    "@crawlee/browser",
  ],
  // Empty turbopack config to silence Next.js 16 warning
  // Turbopack works fine without custom config for this project
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Exclude puppeteer and other unnecessary browser automation tools
    config.resolve.alias = {
      ...config.resolve.alias,
      "puppeteer/package.json": false,
      puppeteer: false,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
