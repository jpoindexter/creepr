import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
