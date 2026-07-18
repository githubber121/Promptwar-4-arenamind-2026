/**
 * Gemini AI client configuration and helper functions
 * Uses @google/generative-ai SDK with security best practices
 */

import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Safety settings — block harmful content categories
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Generation config for consistent, concise responses
const GENERATION_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

let genAI: GoogleGenerativeAI | null = null;

/**
 * Get or initialise the Gemini client (singleton pattern)
 * Throws if GEMINI_API_KEY is not configured
 */
function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Get a configured Gemini generative model instance
 */
export function getGeminiModel(): GenerativeModel {
  return getGenAI().getGenerativeModel({
    model: 'gemini-3.5-flash',
    safetySettings: SAFETY_SETTINGS,
    generationConfig: GENERATION_CONFIG,
  });
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface GeminiResponse {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Send a single message with a system prompt and get a response
 * @param systemPrompt - The persona/context system prompt
 * @param userMessage - The user's sanitised message
 * @param history - Previous conversation turns for context
 */
export async function sendMessage(
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [],
): Promise<GeminiResponse> {
  try {
    const model = getGeminiModel();

    // Start a chat session with history and inject system prompt into first message
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: `[SYSTEM INSTRUCTIONS]\n${systemPrompt}\n\n[END SYSTEM INSTRUCTIONS]\n\nAcknowledge you are ready.` }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I am ArenaMind, ready to assist with real-time stadium data and context provided.' }],
        },
        ...history,
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.text();

    return { success: true, text };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    console.error('[Gemini Error]', message);
    return { success: false, error: message };
  }
}
