import { NextRequest, NextResponse } from "next/server";
import { runAIAudit, getAvailableModels } from "@/lib/ai-auditor";

interface AIAuditRequest {
  files: Array<{ path: string; content: string }>;
  model?: string;
}

export async function POST(request: NextRequest) {
  console.log("[AI Audit] POST request received");

  try {
    console.log("[AI Audit] Parsing request body...");
    const body: AIAuditRequest = await request.json();
    console.log(`[AI Audit] Received ${body.files?.length || 0} files`);

    if (!body.files || body.files.length === 0) {
      console.log("[AI Audit] ERROR: No files provided");
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Calculate total content size
    const totalSize = body.files.reduce((sum, f) => sum + f.content.length, 0);
    console.log(`[AI Audit] Total content size: ${(totalSize / 1024).toFixed(1)}KB`);

    // Default to a capable model
    const model = body.model || "qwen2.5:32b";
    console.log(`[AI Audit] Using model: ${model}`);

    console.log("[AI Audit] Starting AI analysis...");
    const startTime = Date.now();
    const report = await runAIAudit(body.files, model);
    console.log(`[AI Audit] Analysis complete in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
    console.log(`[AI Audit] Found ${report.inconsistencies?.length || 0} inconsistencies`);

    return NextResponse.json(report);
  } catch (error) {
    console.error("[AI Audit] ERROR:", error);
    console.error("[AI Audit] Error stack:", error instanceof Error ? error.stack : "No stack");
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI audit failed" },
      { status: 500 }
    );
  }
}

// GET endpoint to list available models
export async function GET() {
  try {
    const models = await getAvailableModels();
    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ error: "Failed to fetch models", models: [] }, { status: 500 });
  }
}
