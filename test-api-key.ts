import { GoogleGenAI } from '@google/genai';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: '.env.local' });

// Test if the API key is valid
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("API key not found in environment variables");
    process.exit(1);
}

console.log("Testing API key:", apiKey.substring(0, 10) + "...");

const ai = new GoogleGenAI({ apiKey });

// Simple test request
async function testApiKey() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Say "Hello, World!"',
        });
        
        console.log("API key is valid!");
        console.log("Response:", response.text);
    } catch (error) {
        console.error("API key test failed:", error);
    }
}

testApiKey();