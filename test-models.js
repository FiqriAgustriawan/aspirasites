import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Read API Key from .env.local
let apiKey;
try {
  const envConfig = fs.readFileSync('.env.local', 'utf8');
  const match = envConfig.match(/VITE_GEMINI_API_KEY=(.*)/);
  apiKey = match ? match[1].trim() : null;
} catch (e) {
  console.error("Error reading .env.local:", e.message);
}

if (!apiKey) {
  console.error("Could not find VITE_GEMINI_API_KEY in .env.local");
  process.exit(1);
}

console.log(`Testing with API Key: ${apiKey.substring(0, 8)}...`);

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-001",
  "gemini-1.5-flash-002",
  "gemini-1.5-pro",
  "gemini-1.0-pro",
  "gemini-2.0-flash-exp"
];

async function testModels() {
  console.log("\nChecking available models...");

  for (const modelName of modelsToTest) {
    process.stdout.write(`Testing ${modelName}... `);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello");
      await result.response;
      console.log("✅ WORKING");
    } catch (error) {
      let status = "FAILED";
      if (error.message.includes("404")) status = "404 NOT FOUND";
      else if (error.message.includes("429")) status = "429 RATE LIMIT (Exists but busy)";
      else status = error.message.split('\n')[0]; // First line of error

      console.log(`❌ ${status}`);
    }
  }
}

testModels();
