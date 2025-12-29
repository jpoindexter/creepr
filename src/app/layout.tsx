import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "creepr - Localhost Sitemap Generator",
  description:
    "Generate interactive visual sitemaps for localhost applications. Built with Next.js 16, React 19.2, React Flow, and Crawlee for developers who need to understand their application structure.",
  openGraph: {
    title: "creepr - Localhost Sitemap Generator",
    description: "Generate interactive visual sitemaps for localhost applications.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="bw" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} font-mono`} suppressHydrationWarning>
        {/* Skip to main content link for keyboard accessibility */}
        <a
          href="#main-content"
          className="focus:bg-primary focus:text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:font-medium focus:ring-2 focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
