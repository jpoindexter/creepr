"use client";

import { useCallback, RefObject } from "react";
import { toPng, toSvg } from "html-to-image";
import { jsPDF } from "jspdf";
import type { CustomNode, CustomEdge } from "@/types/flow";

interface UseExportHandlersParams {
  flowRef: RefObject<HTMLDivElement | null>;
  nodes: CustomNode[];
  edges: CustomEdge[];
  toast: (options: { title: string; description: string; variant?: "destructive" }) => void;
}

export function useExportHandlers({ flowRef, nodes, edges, toast }: UseExportHandlersParams) {
  const handleDownload = useCallback(() => {
    const data = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sitemap-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Sitemap JSON downloaded",
    });
  }, [nodes, edges, toast]);

  const handleExportPng = useCallback(async () => {
    if (!flowRef.current) return;

    try {
      const viewport = flowRef.current.querySelector(".react-flow__viewport") as HTMLElement;
      if (!viewport) return;

      const dataUrl = await toPng(viewport, {
        backgroundColor: "#FAFAFA",
        pixelRatio: 2,
        filter: (node) => {
          const className = node.className?.toString() || "";
          return (
            !className.includes("react-flow__controls") &&
            !className.includes("react-flow__minimap") &&
            !className.includes("react-flow__panel")
          );
        },
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `sitemap-${Date.now()}.png`;
      a.click();

      toast({
        title: "Export successful",
        description: "Sitemap PNG downloaded",
      });
    } catch (error) {
      console.error("Failed to export PNG:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not export PNG image",
      });
    }
  }, [flowRef, toast]);

  const handleExportSvg = useCallback(async () => {
    if (!flowRef.current) return;

    try {
      const viewport = flowRef.current.querySelector(".react-flow__viewport") as HTMLElement;
      if (!viewport) return;

      const dataUrl = await toSvg(viewport, {
        backgroundColor: "#FAFAFA",
        filter: (node) => {
          const className = node.className?.toString() || "";
          return (
            !className.includes("react-flow__controls") &&
            !className.includes("react-flow__minimap") &&
            !className.includes("react-flow__panel")
          );
        },
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `sitemap-${Date.now()}.svg`;
      a.click();

      toast({
        title: "Export successful",
        description: "Sitemap SVG downloaded",
      });
    } catch (error) {
      console.error("Failed to export SVG:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not export SVG image",
      });
    }
  }, [flowRef, toast]);

  const handleExportPdf = useCallback(async () => {
    if (!flowRef.current) return;

    try {
      const viewport = flowRef.current.querySelector(".react-flow__viewport") as HTMLElement;
      if (!viewport) return;

      const dataUrl = await toPng(viewport, {
        backgroundColor: "#FAFAFA",
        pixelRatio: 2,
        filter: (node) => {
          const className = node.className?.toString() || "";
          return (
            !className.includes("react-flow__controls") &&
            !className.includes("react-flow__minimap") &&
            !className.includes("react-flow__panel")
          );
        },
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.setFontSize(16);
      pdf.text("Sitemap Report", 14, 15);
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
      pdf.text(`Total nodes: ${nodes.length}`, 14, 28);

      const imgWidth = pdfWidth - 28;
      const imgHeight = pdfHeight - 50;

      pdf.addImage(dataUrl, "PNG", 14, 35, imgWidth, imgHeight);
      pdf.save(`sitemap-${Date.now()}.pdf`);

      toast({
        title: "Export successful",
        description: "Sitemap PDF downloaded",
      });
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not export PDF document",
      });
    }
  }, [flowRef, nodes.length, toast]);

  return {
    handleDownload,
    handleExportPng,
    handleExportSvg,
    handleExportPdf,
  };
}
