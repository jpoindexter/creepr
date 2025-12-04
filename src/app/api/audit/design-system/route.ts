import { NextRequest, NextResponse } from "next/server";
import { runDesignSystemAudit, exportAuditToMarkdown } from "@/lib/design-system-auditor";

interface AuditRequest {
  files: Array<{ path: string; content: string }>;
  format?: "json" | "markdown";
}

export async function POST(request: NextRequest) {
  try {
    const body: AuditRequest = await request.json();

    if (!body.files || body.files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Run the comprehensive design system audit
    const report = runDesignSystemAudit(body.files);

    // Return in requested format
    if (body.format === "markdown") {
      const markdown = exportAuditToMarkdown(report);
      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown",
          "Content-Disposition": `attachment; filename="design-system-audit-${Date.now()}.md"`,
        },
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Design system audit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Audit failed" },
      { status: 500 }
    );
  }
}
