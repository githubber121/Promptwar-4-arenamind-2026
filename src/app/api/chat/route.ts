/**
 * POST /api/chat
 * Handles fan, staff and volunteer AI chat requests
 * Validates input, applies rate limiting logic, and returns Gemini response
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendMessage } from '@/lib/gemini';
import { getStadiumById } from '@/lib/stadiumData';
import { buildFanPrompt, buildOpsPrompt, buildVolunteerPrompt, sanitizeInput } from '@/lib/prompts';
import type { LanguageCode } from '@/lib/stadiumData';

// Request body schema for validation
const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  persona: z.enum(['fan', 'operations', 'volunteer']),
  stadiumId: z.string(),
  language: z.string().optional().default('en'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        parts: z.array(z.object({ text: z.string() })),
      }),
    )
    .optional()
    .default([]),
});

// Simple in-memory rate limiter (per IP, resets per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = Number(process.env.RATE_LIMIT_RPM ?? 30);

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 },
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format.', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { message, persona, stadiumId, language, history } = parsed.data;

    // Sanitise user input
    const sanitisedMessage = sanitizeInput(message);
    if (!sanitisedMessage) {
      return NextResponse.json({ success: false, error: 'Message cannot be empty.' }, { status: 400 });
    }

    // Get stadium data
    const stadium = getStadiumById(stadiumId);
    if (!stadium) {
      return NextResponse.json({ success: false, error: 'Stadium not found.' }, { status: 404 });
    }

    // Build persona-specific system prompt
    let systemPrompt: string;
    switch (persona) {
      case 'fan':
        systemPrompt = buildFanPrompt(stadium, language as LanguageCode);
        break;
      case 'operations':
        systemPrompt = buildOpsPrompt(stadium);
        break;
      case 'volunteer':
        systemPrompt = buildVolunteerPrompt(stadium);
        break;
      default:
        systemPrompt = buildFanPrompt(stadium, 'en');
    }

    // Call Gemini API
    const response = await sendMessage(systemPrompt, sanitisedMessage, history);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error ?? 'AI service temporarily unavailable.' },
        { status: 503 },
      );
    }

    return NextResponse.json({ success: true, text: response.text }, { status: 200 });
  } catch (error) {
    console.error('[/api/chat] Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
