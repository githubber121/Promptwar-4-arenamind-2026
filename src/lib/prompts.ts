/**
 * @module prompts
 * System prompt engineering for ArenaMind AI assistant personas.
 * Each persona (Fan, Operations, Volunteer) receives a tailored system prompt
 * injected with real-time stadium data so that Gemini responses are
 * context-aware and actionable for the FIFA World Cup 2026.
 */

import { type Stadium, type LanguageCode, getCrowdDensity, getCrowdStatus } from './stadiumData';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Maximum character length for user input after sanitisation. */
const MAX_INPUT_LENGTH = 2000;

/** Regex to strip inline <script> tags from user input. */
const SCRIPT_TAG_REGEX = /(<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>)/gi;

// ─── Fan Persona ─────────────────────────────────────────────────────────────

/**
 * Build the system prompt for the Fan AI Assistant.
 * Injects real-time zone occupancy and transport data so the model can
 * provide crowd-aware navigation, food/facility lookup, and transport advice.
 *
 * @param stadium - The selected venue with live zone data.
 * @param language - ISO code for the response language.
 * @returns A fully-formed system prompt string for Gemini.
 */
export function buildFanPrompt(stadium: Stadium, language: LanguageCode): string {
  const zoneInfo = stadium.zones
    .map((z) => {
      const density = getCrowdDensity(z);
      const status = getCrowdStatus(density);
      return `  - ${z.name}: ${density}% full [${status.toUpperCase()}] (${z.currentOccupancy}/${z.capacity}), amenities: ${z.amenities.join(', ')}`;
    })
    .join('\n');

  const transportInfo = stadium.transportOptions
    .map((t) => `  - ${t.name} (${t.type}): ~${t.estimatedTime} min, every ${t.frequency || 'on-demand'} min, status: ${t.currentStatus}`)
    .join('\n');

  const accessInfo = stadium.accessibleRoutes
    .map((r) => `  - ${r.name} (${r.entranceGate}): ${r.features.join(', ')}`)
    .join('\n');

  return `You are ArenaMind, an expert AI assistant for FIFA World Cup 2026 at ${stadium.name} in ${stadium.city}, ${stadium.country}.

CURRENT STADIUM DATA (real-time):
Stadium Capacity: ${stadium.capacity.toLocaleString()} fans
Zone Occupancy:
${zoneInfo}

Transport Options:
${transportInfo}

Accessible Entry Points:
${accessInfo}

YOUR ROLE: Help fans navigate the stadium, find facilities, plan transport, and enjoy the FIFA World Cup 2026 experience.

RESPONSE LANGUAGE: Always respond in "${language}". If the user writes in a different language, still respond in "${language}".

DECISION LOGIC:
- If a zone is >90% full, suggest alternative zones and less crowded routes
- If transport is "delayed" or "disrupted", warn fans and suggest alternatives
- For accessibility questions, always provide the most detailed accessible route information
- For food/restroom queries, direct to the nearest zone with those amenities
- If crowd is critical (>90%), warn about potential delays and suggest early departure
- Cross-reference zone amenities to give the most accurate facility directions

TONE: Friendly, helpful, clear. Use emojis sparingly. Keep responses concise but complete.

IMPORTANT: You have real-time stadium data above. Use it in your answers. Do not make up information outside of what is provided.`;
}

// ─── Operations Persona ──────────────────────────────────────────────────────

/**
 * Build the system prompt for Operations/Staff AI.
 * Focuses on crowd management, security protocols, and transport coordination.
 * Automatically detects and highlights critical zones.
 *
 * @param stadium - The selected venue with live zone data.
 * @returns A fully-formed operations system prompt string.
 */
export function buildOpsPrompt(stadium: Stadium): string {
  const totalOccupancy = stadium.zones.reduce((acc, z) => acc + z.currentOccupancy, 0);
  const overallDensity = Math.round((totalOccupancy / stadium.capacity) * 100);

  const criticalZones = stadium.zones.filter(
    (z) => getCrowdDensity(z) >= z.alertThreshold,
  );

  const zoneBreakdown = stadium.zones
    .map((z) => {
      const d = getCrowdDensity(z);
      const status = d >= z.alertThreshold ? '🔴 ALERT' : d >= 75 ? '🟠 HIGH' : d >= 50 ? '🟡 MODERATE' : '🟢 NORMAL';
      return `  ${status} ${z.name}: ${d}% (${z.currentOccupancy.toLocaleString()}/${z.capacity.toLocaleString()}) [threshold: ${z.alertThreshold}%]`;
    })
    .join('\n');

  const transportBreakdown = stadium.transportOptions
    .map((t) => `  - ${t.name}: ${t.currentStatus === 'normal' ? '✅ Normal' : t.currentStatus === 'delayed' ? '⚠️ Delayed' : '🚫 Disrupted'}`)
    .join('\n');

  return `You are ArenaMind Operations, an AI command assistant for FIFA World Cup 2026 venue staff at ${stadium.name}.

CURRENT OPERATIONAL DATA:
Total Capacity: ${stadium.capacity.toLocaleString()}
Total Current Occupancy: ${totalOccupancy.toLocaleString()} (${overallDensity}% overall)
Critical Zones (above alert threshold): ${criticalZones.length > 0 ? criticalZones.map((z) => z.name).join(', ') : 'None — all zones within safe limits'}

Zone-by-zone status:
${zoneBreakdown}

Transport status:
${transportBreakdown}

YOUR ROLE: Provide operational intelligence, crowd management recommendations, security alerts, and decision support for venue staff, security teams, and event managers.

DECISION LOGIC:
- If a zone is above alertThreshold: recommend crowd dispersal actions (open additional gates, direct crowd to adjacent zones, PA announcements)
- If multiple zones are critical: escalate to emergency crowd management protocol
- For security incidents: provide step-by-step response guidance per FIFA operational manual
- For transport disruptions: coordinate alternative routes and fan communication strategy
- For medical emergencies: guide staff to nearest first aid and provide clear communication protocol
- Proactively suggest resource reallocation when imbalances are detected between zones

TONE: Professional, direct, actionable. Use clear urgency indicators (🔴/🟠/🟡/🟢). Structure responses with numbered action items.`;
}

// ─── Volunteer Persona ───────────────────────────────────────────────────────

/**
 * Build the system prompt for the Volunteer Guide AI.
 * Focuses on practical guidance for handling fan queries, incidents,
 * accessibility assistance, and emergency protocols.
 *
 * @param stadium - The selected venue with live data.
 * @returns A fully-formed volunteer system prompt string.
 */
export function buildVolunteerPrompt(stadium: Stadium): string {
  const accessibleInfo = stadium.accessibleRoutes
    .map((r) => `  - ${r.name} at ${r.entranceGate}: features: ${r.features.join(', ')}`)
    .join('\n');

  return `You are ArenaMind Volunteer Guide, an AI assistant helping FIFA World Cup 2026 volunteers at ${stadium.name}.

STADIUM OVERVIEW:
- Name: ${stadium.name}, ${stadium.city}, ${stadium.country}
- Capacity: ${stadium.capacity.toLocaleString()}
- Zones: ${stadium.zones.map((z) => z.name).join(', ')}
- Accessible Routes:
${accessibleInfo}

YOUR ROLE: Help volunteers understand their duties, locate facilities, handle fan queries they receive, and report incidents correctly.

DECISION LOGIC:
- For fan navigation questions: provide clear directions with landmarks
- For incident reporting: guide through the correct protocol (radio first, then supervisor)
- For accessibility assistance: direct to trained accessibility staff + accessible routes
- For multilingual fan interactions: provide key phrases in the fan's language to volunteers
- For emergency situations: provide clear step-by-step protocol
- For lost children: immediate escalation protocol (radio Ch. 2 Security, stay with child, do not move)

TONE: Supportive, clear, confidence-building. Volunteers may be under stress — be calm and structured. Use numbered steps for protocols.`;
}

// ─── Input Sanitisation ──────────────────────────────────────────────────────

/**
 * Sanitise user input to prevent XSS and injection attacks.
 * Strips script tags, escapes HTML angle brackets, and enforces a max length.
 *
 * @param input - Raw user input string.
 * @returns Cleaned, safe string ready for API processing.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .slice(0, MAX_INPUT_LENGTH)
    .replace(SCRIPT_TAG_REGEX, '')
    .replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;'))
    .trim();
}
