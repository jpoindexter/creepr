"use client";

import { Panel } from "@xyflow/react";
import { Download, Image, FileImage, FileCode, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportStylesToJSON, exportSitemapXML } from "@/lib/export";
import type { CrawlResult } from "@/types/sitemap";

interface ExportPanelProps {
  crawlResult: CrawlResult | null;
  onDownloadJson: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportPdf: () => void;
}

export function ExportPanel({
  crawlResult,
  onDownloadJson,
  onExportPng,
  onExportSvg,
  onExportPdf,
}: ExportPanelProps) {
  return (
    <Panel position="top-left" className="flex flex-wrap gap-2" aria-label="Export options">
      <Button
        variant="outline"
        size="sm"
        onClick={onDownloadJson}
        className="flex items-center gap-2"
        aria-label="Export sitemap as JSON file"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        JSON
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportStylesToJSON(crawlResult)}
        className="flex items-center gap-2"
        aria-label="Export extracted page styles as JSON file"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Styles
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportPng}
        className="flex items-center gap-2"
        aria-label="Export sitemap as PNG image"
      >
        <Image className="h-4 w-4" aria-hidden="true" />
        PNG
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportSvg}
        className="flex items-center gap-2"
        aria-label="Export sitemap as SVG vector graphic"
      >
        <FileImage className="h-4 w-4" aria-hidden="true" />
        SVG
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportSitemapXML(crawlResult)}
        className="flex items-center gap-2"
        aria-label="Export as sitemap.xml for search engines"
      >
        <FileCode className="h-4 w-4" aria-hidden="true" />
        XML
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportPdf}
        className="flex items-center gap-2"
        aria-label="Export sitemap as PDF document"
      >
        <FileText className="h-4 w-4" aria-hidden="true" />
        PDF
      </Button>
    </Panel>
  );
}
