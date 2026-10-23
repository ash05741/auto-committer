import { GoogleGenAI, Type, Schema } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("CRITICAL: GEMINI_API_KEY is not set in the .env file.");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

export interface CommitGroup {
    files: string[];
    commit_message: string;
}

export async function generateCommitGroups(diff: string, maxRetries = 3): Promise<CommitGroup[]> {
    const systemInstruction = `
    You are an expert developer agent analyzing a git diff.
    Your task is to review the uncommitted changes and logically group them into separate, atomic commits.
    
    Rules:
    1. Every file in the diff MUST be included in exactly one group.
    2. Group files by logical feature, bug fix, or architectural change.
    3. Generate a strict Conventional Commit message for each group.
    4. Only output the requested JSON structure. Do not add markdown formatting.
  `;

    const responseSchema: Schema = {
        type: Type.ARRAY,
        description: "An array of logical commit groups",
        items: {
            type: Type.OBJECT,
            properties: {
                files: { type: Type.ARRAY, items: { type: Type.STRING } },
                commit_message: { type: Type.STRING },
            },
            required: ["files", "commit_message"],
        },
    };

    // Implement automatic retry for 503 errors
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: `Here is the current git diff:\n\n${diff}`,
                config: {
                    systemInstruction,
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                    temperature: 0.1,
                }
            });

            const textOutput = response.text;
            if (!textOutput) throw new Error("Gemini returned an empty response.");

            return JSON.parse(textOutput);

        } catch (error: any) {
            // If it's a 503 and we have retries left, wait and try again
            if (error.status === 503 && attempt < maxRetries) {
                const delay = attempt * 2000; // Wait 2s, then 4s, etc.
                console.log(`\nAPI overloaded. Retrying in ${delay / 1000}s... (Attempt ${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            // If it's not a 503, or we ran out of retries, throw the error
            throw error;
        }
    }

    throw new Error("Failed to generate commit groups after maximum retries.");
}