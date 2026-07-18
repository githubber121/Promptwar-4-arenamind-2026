/**
 * @module gemini
 * Google Gemini AI client configuration and messaging.
 * Implements a singleton pattern for the GenAI client, configures
 * safety settings to block harmful content, and provides a single
 * entry point for all AI chat interactions across ArenaMind.
 */

import {
  GoogleGenerativeAI,
  type GenerativeModel,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

// ─── Safety Configuration ────────────────────────────────────────────────────

/**
 * Safety settings block medium-and-above content across all harm categories.
 * This ensures the AI never generates harassment, hate speech, explicit,
 * or dangerous content in any stadium operations context.
 */
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
] as const;

/**
 * Generation parameters tuned for stadium assistance:
 * - temperature 0.7: balanced creativity for natural responses
 * - topK/topP: diversified but coherent token selection
 * - maxOutputTokens 1024: concise, actionable answers
 */
const GENERATION_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
} as const;

// ─── Client Singleton ────────────────────────────────────────────────────────

let genAI: GoogleGenerativeAI | null = null;

/**
 * Get or initialise the GoogleGenerativeAI client.
 * Uses a singleton to avoid creating multiple SDK instances.
 * @throws {Error} If GEMINI_API_KEY environment variable is not set.
 */
function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set. See .env.example for setup instructions.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Get a configured Gemini generative model instance.
 * @returns A GenerativeModel ready for chat sessions.
 */
export function getGeminiModel(): GenerativeModel {
  return getGenAI().getGenerativeModel({
    model: 'gemini-3.5-flash',
    safetySettings: [...SAFETY_SETTINGS],
    generationConfig: GENERATION_CONFIG,
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────

/** Standardised response shape from all Gemini interactions. */
export interface GeminiResponse {
  readonly success: boolean;
  readonly text?: string;
  readonly error?: string;
}

/** A single turn in the conversation history sent to Gemini. */
export interface HistoryEntry {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

// ─── Messaging ───────────────────────────────────────────────────────────────

/**
 * Send a message to Gemini with a persona system prompt and conversation history.
 * The system prompt is injected as a synthetic first turn so Gemini adopts
 * the correct persona and has access to real-time stadium data.
 *
 * @param systemPrompt - The persona/context system prompt (fan/ops/volunteer).
 * @param userMessage - The user's sanitised message.
 * @param history - Previous conversation turns for multi-turn context.
 * @returns A GeminiResponse with either the AI text or an error message.
 */
export async function sendMessage(
  systemPrompt: string,
  userMessage: string,
  history: HistoryEntry[] = [],
): Promise<GeminiResponse> {
  try {
    const model = getGeminiModel();

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
