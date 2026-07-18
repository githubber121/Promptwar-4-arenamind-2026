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
    expect(prompt).toContain('🔴 ALERT');
  });

  it('handles all transport status and density branches', () => {
    const mockStadium = getStadiumById('sofi')!;
    // Create a mock stadium with varied zone densities and transport statuses to hit all branches
    const variedStadium = {
      ...mockStadium,
      zones: [
        { ...mockStadium.zones[0], currentOccupancy: 0 }, // < 50% (NORMAL)
        { ...mockStadium.zones[1], currentOccupancy: mockStadium.zones[1].capacity * 0.6 }, // 60% (MODERATE)
        { ...mockStadium.zones[2], currentOccupancy: mockStadium.zones[2].capacity * 0.8 }, // 80% (HIGH)
        { ...mockStadium.zones[3], currentOccupancy: mockStadium.zones[3].capacity * 0.95, alertThreshold: 90 }, // >90% (ALERT)
      ],
      transportOptions: [
        { ...mockStadium.transportOptions[0], currentStatus: 'normal' as const },
        { ...mockStadium.transportOptions[1], currentStatus: 'delayed' as const },
        { ...mockStadium.transportOptions[0], currentStatus: 'disrupted' as const, name: 'Disrupted Line' },
      ],
    };
    
    const prompt = buildOpsPrompt(variedStadium);
    expect(prompt).toContain('🟢 NORMAL');
    expect(prompt).toContain('🟡 MODERATE');
    expect(prompt).toContain('🟠 HIGH');
    expect(prompt).toContain('🔴 ALERT');
    expect(prompt).toContain('✅ Normal');
    expect(prompt).toContain('⚠️ Delayed');
    expect(prompt).toContain('🚫 Disrupted');
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
