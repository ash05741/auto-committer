import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("CRITICAL: API Key missing.");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function findModels() {
    console.log("🔍 Asking Google for available fast models...");
    try {
        const response = await ai.models.list();

        console.log("\n✅ You have access to these Flash models:");
        for await (const model of response) {
            // TypeScript safe check:
            if (model.name && model.name.includes('flash')) {
                console.log(`- ${model.name.replace('models/', '')}`);
            }
        }
        console.log("\nPick the newest one from this list!");
    } catch (error: any) {
        console.error("❌ Failed to list models:", error.message);
    }
}

findModels();