/**
 * Unit tests for prompt utilities
 */

import { sanitizeInput, buildFanPrompt, buildOpsPrompt, buildVolunteerPrompt } from '@/lib/prompts';
import { getStadiumById } from '@/lib/stadiumData';

describe('sanitizeInput', () => {
  it('removes script tags', () => {
    const input = 'Hello <script>alert("xss")</script>';
    expect(sanitizeInput(input)).not.toContain('<script>');
  });

  it('escapes HTML angle brackets', () => {
    const result = sanitizeInput('<b>Bold</b>');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('truncates to 2000 characters', () => {
    const long = 'a'.repeat(3000);
    expect(sanitizeInput(long).length).toBeLessThanOrEqual(2000);
  });

  it('returns empty string for non-string input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeInput(123 as any)).toBe('');
  });

  it('preserves normal text', () => {
    const input = 'Where is the nearest restroom?';
    expect(sanitizeInput(input)).toBe(input);
  });
});

describe('buildFanPrompt', () => {
  it('includes stadium name and city', () => {
    const stadium = getStadiumById('metlife')!;
    const prompt = buildFanPrompt(stadium, 'en');
    expect(prompt).toContain('MetLife Stadium');
    expect(prompt).toContain('New York / New Jersey');
  });

  it('includes zone occupancy data', () => {
    const stadium = getStadiumById('metlife')!;
    const prompt = buildFanPrompt(stadium, 'en');
    // Should include zone names
    expect(prompt).toContain('North Stand');
  });

  it('includes the selected language', () => {
    const stadium = getStadiumById('metlife')!;
    const prompt = buildFanPrompt(stadium, 'es');
    expect(prompt).toContain('"es"');
  });
});

describe('buildOpsPrompt', () => {
  it('includes operational data', () => {
    const stadium = getStadiumById('sofi')!;
    const prompt = buildOpsPrompt(stadium);
    expect(prompt).toContain('SoFi Stadium');
    expect(prompt).toContain('Total Capacity');
  });

  it('flags critical zones correctly', () => {
    const stadium = getStadiumById('metlife')!;
    const prompt = buildOpsPrompt(stadium);
    // South Stand is 94.5% which exceeds its 90% threshold
    expect(prompt).toContain('South Stand');
  });
});

describe('buildVolunteerPrompt', () => {
  it('includes volunteer-specific guidance', () => {
    const stadium = getStadiumById('estadio')!;
    const prompt = buildVolunteerPrompt(stadium);
    expect(prompt).toContain('Volunteer');
    expect(prompt).toContain('Estadio Azteca');
  });
});
