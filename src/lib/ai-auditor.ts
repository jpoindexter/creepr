/**
 * AI-powered design system auditor using Ollama
 * Analyzes code files for design inconsistencies using LLM understanding
 */

export interface AIAuditRequest {
  files: Array<{ path: string; content: string }>;
  model?: string;
}

export interface DesignInconsistency {
  category: string;
  description: string;
  locations: Array<{
    file: string;
    line?: number;
    code: string;
  }>;
  recommendation: string;
  severity: "high" | "medium" | "low";
}

export interface AIAuditReport {
  generatedAt: string;
  model: string;
  filesAnalyzed: number;
  inconsistencies: DesignInconsistency[];
  designTokensFound: {
    colors: string[];
    spacing: string[];
    borderRadius: string[];
    shadows: string[];
    fonts: string[];
  };
  summary: string;
}

const SYSTEM_PROMPT = `You are a design system auditor. Analyze the code and find ALL design inconsistencies.

CRITICAL: Respond with ONLY valid JSON. No text before or after.

Find these inconsistencies:
1. **Colors**: Different colors for same elements (buttons, links, backgrounds). List ALL unique colors found.
2. **Spacing**: Inconsistent padding/margin values across similar components.
3. **Border radius**: Mixed rounded corner values (rounded-sm vs rounded-lg vs rounded-xl).
4. **Shadows**: Different shadow values on similar elements.
5. **Typography**: Different font sizes/weights for similar text.
6. **Component patterns**: Same component type styled differently in different files.

For each inconsistency, include the exact file path and line number.

JSON format:
{"inconsistencies":[{"category":"color","description":"Buttons use 3 different background colors","locations":[{"file":"Button.tsx","line":10,"code":"bg-blue-500"},{"file":"Header.tsx","line":25,"code":"bg-indigo-600"}],"recommendation":"Standardize to one primary color","severity":"high"}],"designTokensFound":{"colors":["bg-blue-500","bg-indigo-600","text-gray-900"],"spacing":["p-4","p-6","m-2"],"borderRadius":["rounded-md","rounded-lg"],"shadows":["shadow-sm","shadow-lg"],"fonts":["text-sm","text-base","font-bold"]},"summary":"Found X issues across Y files"}`;

export async function runAIAudit(
  files: Array<{ path: string; content: string }>,
  model: string = "qwen2.5:32b",
  baseUrl: string = "http://localhost:11434"
): Promise<AIAuditReport> {
  console.log(`[AI Auditor] Starting audit with ${files.length} files, model: ${model}`);

  // Determine context limit based on model size
  // Larger models need smaller contexts to avoid OOM
  const isLargeModel = model.includes("70b") || model.includes("32b");
  const MAX_CONTENT_LENGTH = isLargeModel ? 20000 : 50000; // 20KB for large models, 50KB for smaller
  console.log(`[AI Auditor] Using ${isLargeModel ? "reduced" : "standard"} context: ${MAX_CONTENT_LENGTH / 1000}KB`);

  let totalLength = 0;
  const filesToAnalyze: Array<{ path: string; content: string }> = [];

  // Prioritize UI files over test/utility files
  const prioritizedFiles = [...files].sort((a, b) => {
    const aIsUI = /\/(components|ui|views|pages|app)\//i.test(a.path);
    const bIsUI = /\/(components|ui|views|pages|app)\//i.test(b.path);
    const aIsTest = /\.(test|spec|stories)\./i.test(a.path);
    const bIsTest = /\.(test|spec|stories)\./i.test(b.path);

    if (aIsUI && !bIsUI) return -1;
    if (!aIsUI && bIsUI) return 1;
    if (aIsTest && !bIsTest) return 1;
    if (!aIsTest && bIsTest) return -1;
    return 0;
  });

  for (const file of prioritizedFiles) {
    // Skip test files entirely
    if (/\.(test|spec|stories)\./i.test(file.path)) continue;
    // Skip non-UI files
    if (/\/(lib|utils|hooks|services|api)\//i.test(file.path) && !/\.css$/i.test(file.path)) continue;

    if (totalLength + file.content.length > MAX_CONTENT_LENGTH) {
      break;
    }
    filesToAnalyze.push(file);
    totalLength += file.content.length;
  }

  console.log(`[AI Auditor] Will analyze ${filesToAnalyze.length} files (${(totalLength / 1024).toFixed(1)}KB)`);

  const filesContent = filesToAnalyze
    .map((f) => `=== ${f.path} ===\n${f.content}`)
    .join("\n\n");

  const userPrompt = `Analyze these ${filesToAnalyze.length} React/TypeScript files for design system inconsistencies:\n\n${filesContent}`;

  console.log(`[AI Auditor] Prompt length: ${(userPrompt.length / 1024).toFixed(1)}KB`);
  console.log(`[AI Auditor] Sending request to Ollama at ${baseUrl}...`);

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: userPrompt,
        system: SYSTEM_PROMPT,
        stream: false,
        options: {
          temperature: 0.1, // Low temp for consistent analysis
          num_predict: 4000, // Allow long response
        },
      }),
    });

    console.log(`[AI Auditor] Ollama response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI Auditor] Ollama error response: ${errorText}`);
      throw new Error(`Ollama request failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`[AI Auditor] Response received, length: ${data.response?.length || 0} chars`);

    const responseText = data.response;

    // Extract JSON from response - try multiple methods
    let jsonStr = responseText;
    let parsed = null;

    // Method 1: Try markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      console.log("[AI Auditor] Trying: JSON from markdown code block");
      jsonStr = jsonMatch[1].trim();
    }

    // Method 2: Find JSON object in text
    if (!parsed) {
      const jsonStart = responseText.indexOf("{");
      const jsonEnd = responseText.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        console.log("[AI Auditor] Trying: Raw JSON extraction");
        jsonStr = responseText.slice(jsonStart, jsonEnd + 1);
      }
    }

    // Try to parse
    try {
      parsed = JSON.parse(jsonStr);
      console.log(`[AI Auditor] Parsed successfully, found ${parsed.inconsistencies?.length || 0} inconsistencies`);
    } catch (parseError) {
      console.error("[AI Auditor] JSON parse failed:", parseError);
      console.error("[AI Auditor] Attempted to parse:", jsonStr.substring(0, 300));

      // Return empty report if parsing fails - don't throw
      console.log("[AI Auditor] Returning empty report due to parse failure");
      return {
        generatedAt: new Date().toISOString(),
        model,
        filesAnalyzed: filesToAnalyze.length,
        inconsistencies: [],
        designTokensFound: {
          colors: [],
          spacing: [],
          borderRadius: [],
          shadows: [],
          fonts: [],
        },
        summary: `AI analysis failed to return valid JSON. Raw response: ${responseText.substring(0, 200)}...`,
      };
    }

    return {
      generatedAt: new Date().toISOString(),
      model,
      filesAnalyzed: filesToAnalyze.length,
      inconsistencies: parsed.inconsistencies || [],
      designTokensFound: parsed.designTokensFound || {
        colors: [],
        spacing: [],
        borderRadius: [],
        shadows: [],
        fonts: [],
      },
      summary: parsed.summary || "Analysis complete",
    };
  } catch (error) {
    console.error("[AI Auditor] ERROR:", error);
    console.error("[AI Auditor] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    throw error;
  }
}

// Get available Ollama models
export async function getAvailableModels(
  baseUrl: string = "http://localhost:11434"
): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  } catch {
    return [];
  }
}
