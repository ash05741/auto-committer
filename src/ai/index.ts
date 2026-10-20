import { GoogleGenAI, Type, Schema } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("CRITICAL: GEMINI_API_KEY is not set in the .env file.");
    process.exit(1);
}

// Initialize the new Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey });

// Define the precise structure we need back from the model
export interface CommitGroup {
    files: string[];
    commit_message: string;
}

/**
 * Sends the raw git diff to Gemini and requests logically grouped commits.
 * Uses structured outputs (responseSchema) to guarantee a JSON array response.
 */
export async function generateCommitGroups(diff: string): Promise<CommitGroup[]> {
    const systemInstruction = `
    You are an expert developer agent analyzing a git diff.
    Your task is to review the uncommitted changes and logically group them into separate, atomic commits.
    
    Rules:
    1. Every file in the diff MUST be included in exactly one group.
    2. Group files by logical feature, bug fix, or architectural change. (e.g. database schema changes go together, UI updates go together).
    3. Generate a strict Conventional Commit message (e.g., "feat:", "fix:", "chore:") for each group.
    4. Only output the requested JSON structure. Do not add markdown formatting or explanations.
  `;

    // Define the JSON schema to enforce the structure of the output
    const responseSchema: Schema = {
        type: Type.ARRAY,
        description: "An array of logical commit groups",
        items: {
            type: Type.OBJECT,
            properties: {
                files: {
                    type: Type.ARRAY,
                    description: "List of file paths that belong to this commit",
                    items: {
                        type: Type.STRING,
                    },
                },
                commit_message: {
                    type: Type.STRING,
                    description: "A conventional commit message summarizing the changes in these files",
                },
            },
            required: ["files", "commit_message"],
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Here is the current git diff:\n\n${diff}`,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
                temperature: 0.1, // Keep it deterministic for code operations
            }
        });

        const textOutput = response.text;
        if (!textOutput) {
            throw new Error("Gemini returned an empty response.");
        }

        // The response is guaranteed to be a JSON string matching our schema
        const groups: CommitGroup[] = JSON.parse(textOutput);
        return groups;

    } catch (error) {
        console.error("Failed to generate commit groups from AI:", error);
        throw error;
    }
}