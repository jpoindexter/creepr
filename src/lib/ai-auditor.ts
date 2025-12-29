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

const SYSTEM_PROMPT = `You are a strict JSON-only API. You audit React code for design inconsistencies.



You must output a SINGLE valid JSON object with this exact structure:

{

  "inconsistencies": [

    {

      "category": "string",

      "description": "string",

      "locations": [{"file": "string", "line": number, "code": "string"}],

      "recommendation": "string",

      "severity": "high" | "medium" | "low"

    }

  ],

  "designTokensFound": {

    "colors": ["string"],

    "spacing": ["string"],

    "borderRadius": ["string"],

    "shadows": ["string"],

    "fonts": ["string"]

  },

  "summary": "string"

}



Analyze the code provided and populate this JSON. Find at least 3-5 issues if possible. Do not include any markdown formatting, explanations, or text outside the JSON object.`;



export async function runAIAudit(



  files: Array<{ path: string; content: string }>,



  model: string = "qwen2.5:32b",



  baseUrl: string = "http://localhost:11434"



): Promise<AIAuditReport> {



  console.log(`[AI Auditor] Starting audit with ${files.length} files, model: ${model}`);







  // Determine context limit based on model size



  // Larger models need smaller contexts to avoid OOM



  const isLargeModel = model.includes("70b") || model.includes("32b");



  // Increase context limits significantly



  const MAX_CONTENT_LENGTH = isLargeModel ? 60000 : 100000; 



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







  const userPrompt = `Analyze these ${filesToAnalyze.length} React/TypeScript files for design system inconsistencies. Return ONLY the JSON object defined in the system prompt.







${filesContent}`;







    console.log(`[AI Auditor] Prompt length: ${(userPrompt.length / 1024).toFixed(1)}KB`);







    console.log(`[AI Auditor] Sending request to Ollama at ${baseUrl}...`);







  







      const controller = new AbortController();







  







      // Declare timeoutId at function scope to ensure it's available in finally block
      let timeoutId: NodeJS.Timeout | undefined = undefined;
      timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes timeout







  







    







  







      // Calculate required context size (approx 1 token = 4 chars)







    // Add 20% buffer for safety







    const estimatedTokens = Math.ceil((userPrompt.length + SYSTEM_PROMPT.length) / 3) + 1000;







    const contextSize = Math.max(8192, Math.min(estimatedTokens, 32768));







    







    console.log(`[AI Auditor] Estimated tokens: ${estimatedTokens}, requesting context: ${contextSize}`);







  







    try {







      // Use /api/chat instead of /api/generate for better instruction following







      const response = await fetch(`${baseUrl}/api/chat`, {







        method: "POST",







        headers: { "Content-Type": "application/json" },







        body: JSON.stringify({







          model,







          messages: [







            { role: "system", content: SYSTEM_PROMPT },







            { role: "user", content: userPrompt }







          ],







          format: "json", // Force JSON output







          stream: false,







          options: {







            temperature: 0.1, // Low temp for consistent analysis







            num_predict: 8192, // Allow larger response







            num_ctx: contextSize, // CRITICAL: Ensure model allocates enough memory for prompt







          },







        }),







        signal: controller.signal,







      });







    console.log(`[AI Auditor] Ollama response status: ${response.status}`);







    if (!response.ok) {



      const errorText = await response.text();



      console.error(`[AI Auditor] Ollama error response: ${errorText}`);



      throw new Error(`Ollama request failed: ${response.statusText} - ${errorText}`);



    }







    const data = await response.json();



    // Extract content from message.content for chat API



    const responseText = data.message?.content || "";



    console.log(`[AI Auditor] Response received, length: ${responseText.length} chars`);



    



    // Log raw response to console for debugging



    console.log("[AI Auditor] Raw response preview:", responseText.substring(0, 500));

    // Extract JSON from response - try multiple methods
    let jsonStr = responseText;
    let parsed = null;

    // Method 1: Try markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      console.log("[AI Auditor] Trying: JSON from markdown code block");
      jsonStr = jsonMatch[1].trim();
    }

    // Method 2: Find JSON object in text (improved)
    // Look for the first { that is followed eventually by "inconsistencies"
    if (!parsed) {
      // Simple extraction of outer braces
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
         console.log("[AI Auditor] Trying: Raw JSON extraction");
         jsonStr = responseText.substring(firstBrace, lastBrace + 1);
      }
    }

    // Clean common JSON errors
    // 1. Remove trailing commas
    jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    
    // Try to parse
    try {
      parsed = JSON.parse(jsonStr);
      console.log(`[AI Auditor] Parsed successfully, found ${parsed.inconsistencies?.length || 0} inconsistencies`);
    } catch (parseError) {
      console.error("[AI Auditor] JSON parse failed:", parseError);
      console.error("[AI Auditor] Attempted to parse:", jsonStr.substring(0, 300));
      
      // Try one last desperate cleanup attempt for common LLM mess-ups
      try {
          // sometimes they add comments like // comment
          const noComments = jsonStr.replace(/\/\/.*$/gm, '');
          parsed = JSON.parse(noComments);
          console.log("[AI Auditor] Parsed successfully after removing comments");
      } catch (e) {
          // Fall through to error return
      }
      
      if (!parsed) {
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
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("[AI Auditor] Request timed out after 10 minutes");
      throw new Error("AI analysis timed out. The model took too long to respond. Try a smaller model or fewer files.");
    }
    console.error("[AI Auditor] ERROR:", error);
    console.error("[AI Auditor] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    throw error;
  } finally {
    // Clear timeout if it was set
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
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
