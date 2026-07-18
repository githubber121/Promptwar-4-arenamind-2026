/**
 * Unit tests for stadiumData utilities
 */

import {
  FIFA_STADIUMS,
  getCrowdDensity,
  getCrowdStatus,
  getCrowdColor,
  getStadiumById,
  getCriticalZones,
  type StadiumZone,
} from '@/lib/stadiumData';

describe('getCrowdDensity', () => {
  it('calculates density correctly', () => {
    const zone: StadiumZone = {
      id: 'test',
      name: 'Test Zone',
      capacity: 1000,
      currentOccupancy: 750,
      alertThreshold: 90,
      amenities: [],
    };
    expect(getCrowdDensity(zone)).toBe(75);
  });

  it('returns 100 when full', () => {
    const zone: StadiumZone = {
      id: 'test',
      name: 'Test Zone',
      capacity: 500,
      currentOccupancy: 500,
      alertThreshold: 90,
      amenities: [],
    };
    expect(getCrowdDensity(zone)).toBe(100);
  });

  it('returns 0 when empty', () => {
    const zone: StadiumZone = {
      id: 'test',
      name: 'Test Zone',
      capacity: 1000,
      currentOccupancy: 0,
      alertThreshold: 90,
      amenities: [],
    };
    expect(getCrowdDensity(zone)).toBe(0);
  });
});

describe('getCrowdStatus', () => {
  it('returns "low" for density below 50', () => {
    expect(getCrowdStatus(30)).toBe('low');
    expect(getCrowdStatus(0)).toBe('low');
    expect(getCrowdStatus(49)).toBe('low');
  });

  it('returns "moderate" for density 50-74', () => {
    expect(getCrowdStatus(50)).toBe('moderate');
    expect(getCrowdStatus(74)).toBe('moderate');
  });

  it('returns "high" for density 75-89', () => {
    expect(getCrowdStatus(75)).toBe('high');
    expect(getCrowdStatus(89)).toBe('high');
  });

  it('returns "critical" for density 90+', () => {
    expect(getCrowdStatus(90)).toBe('critical');
    expect(getCrowdStatus(100)).toBe('critical');
  });
});

describe('getCrowdColor', () => {
  it('returns green for low density', () => {
    expect(getCrowdColor('low')).toBe('#22c55e');
  });

  it('returns amber for moderate density', () => {
    expect(getCrowdColor('moderate')).toBe('#f59e0b');
  });

  it('returns orange for high density', () => {
    expect(getCrowdColor('high')).toBe('#f97316');
  });

  it('returns red for critical density', () => {
    expect(getCrowdColor('critical')).toBe('#ef4444');
  });
});

describe('getStadiumById', () => {
  it('returns correct stadium for valid id', () => {
    const stadium = getStadiumById('metlife');
    expect(stadium).toBeDefined();
    expect(stadium?.name).toBe('MetLife Stadium');
  });

  it('returns undefined for invalid id', () => {
    const stadium = getStadiumById('nonexistent');
    expect(stadium).toBeUndefined();
  });
});

describe('getCriticalZones', () => {
  it('returns zones above their alert threshold', () => {
    const stadium = getStadiumById('metlife');
    expect(stadium).toBeDefined();
    if (!stadium) return;

    // South Stand: 18900/20000 = 94.5% — above threshold of 90
    const criticalZones = getCriticalZones(stadium);
    const hasSouthStand = criticalZones.some((z) => z.name === 'South Stand');
    expect(hasSouthStand).toBe(true);
  });

  it('returns empty array when no zones are critical', () => {
    const mockStadium = {
      ...FIFA_STADIUMS[0],
      zones: FIFA_STADIUMS[0].zones.map((z) => ({ ...z, currentOccupancy: 0 })),
    };
    expect(getCriticalZones(mockStadium)).toHaveLength(0);
  });
});

describe('FIFA_STADIUMS data integrity', () => {
  it('has at least 3 stadiums', () => {
    expect(FIFA_STADIUMS.length).toBeGreaterThanOrEqual(3);
  });

  it('each stadium has required fields', () => {
    FIFA_STADIUMS.forEach((stadium) => {
      expect(stadium.id).toBeTruthy();
      expect(stadium.name).toBeTruthy();
      expect(stadium.city).toBeTruthy();
      expect(stadium.capacity).toBeGreaterThan(0);
      expect(stadium.zones.length).toBeGreaterThan(0);
    });
  });

  it('zone occupancy never exceeds capacity', () => {
    FIFA_STADIUMS.forEach((stadium) => {
      stadium.zones.forEach((zone) => {
        expect(zone.currentOccupancy).toBeLessThanOrEqual(zone.capacity);
      });
    });
  });
});
