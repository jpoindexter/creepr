const fs = require("fs");
const path = require("path");

// Configuration
const API_URL = "http://localhost:3500/api/audit/ai";
const MODEL = process.argv[2] || "codestral:22b"; // Allow passing model as arg

// Read a sample file to audit (using the button component as a test case)
const sampleFilePath = path.join(__dirname, "../src/components/ui/button.tsx");

if (!fs.existsSync(sampleFilePath)) {
  console.error(`Error: Could not find sample file at ${sampleFilePath}`);
  process.exit(1);
}

const content = fs.readFileSync(sampleFilePath, "utf8");

const payload = {
  files: [
    {
      path: "src/components/ui/button.tsx",
      content: content,
    },
  ],
  model: MODEL,
};

console.log(`\n🧪 Starting "Manhole Test" (API Probe)`);
console.log(`========================================`);
console.log(`Target: ${API_URL}`);
console.log(`Model:  ${MODEL}`);
console.log(`File:   src/components/ui/button.tsx (${content.length} bytes)`);
console.log(`\nSending request... (this may take 30-60s)\n`);

async function runTest() {
  try {
    const startTime = Date.now();
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Time:   ${duration}s`);

    const text = await response.text();

    console.log(`\nResponse Body:`);
    console.log(`----------------------------------------`);
    console.log(text.substring(0, 2000) + (text.length > 2000 ? "... [truncated]" : ""));
    console.log(`----------------------------------------`);

    try {
      const json = JSON.parse(text);
      console.log(`\n✅ Valid JSON parsed!`);
      console.log(`Inconsistencies found: ${json.inconsistencies?.length || 0}`);
      if (json.inconsistencies?.length > 0) {
        console.log("\nSample Inconsistency:", JSON.stringify(json.inconsistencies[0], null, 2));
      }
    } catch (e) {
      console.log(`\n❌ Invalid JSON: ${e.message}`);
    }
  } catch (error) {
    console.error(`\n💥 Request Failed:`, error.message);
  }
}

runTest();
