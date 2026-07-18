/**
 * @module stadiumData
 * Core domain data and utility functions for FIFA World Cup 2026 stadium operations.
 * Provides typed interfaces, venue configurations, crowd analytics helpers,
 * and multilingual support constants used across all ArenaMind modules.
 */

// ─── Interfaces ──────────────────────────────────────────────────────────────

/** Represents a FIFA World Cup 2026 host venue with zones, routes, and transport. */
export interface Stadium {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly country: string;
  readonly capacity: number;
  readonly coordinates: Readonly<{ lat: number; lng: number }>;
  readonly zones: readonly StadiumZone[];
  readonly accessibleRoutes: readonly AccessibleRoute[];
  readonly transportOptions: readonly TransportOption[];
}

/** A discrete zone within a stadium with live occupancy tracking. */
export interface StadiumZone {
  readonly id: string;
  readonly name: string;
  readonly capacity: number;
  readonly currentOccupancy: number;
  /** Alert threshold as a percentage (0-100). Operations are notified when density >= this value. */
  readonly alertThreshold: number;
  readonly amenities: readonly string[];
}

/** A pre-mapped accessible route for fans with disabilities. */
export interface AccessibleRoute {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly entranceGate: string;
  /** Feature tags for filtering, e.g. 'wheelchair', 'elevator', 'audio_guide'. */
  readonly features: readonly string[];
}

/** A transport option serving a venue with real-time status. */
export interface TransportOption {
  readonly type: 'metro' | 'bus' | 'shuttle' | 'taxi' | 'walk';
  readonly name: string;
  /** Estimated travel time in minutes from the nearest hub. */
  readonly estimatedTime: number;
  /** Service frequency in minutes. 0 indicates on-demand. */
  readonly frequency: number;
  readonly currentStatus: 'normal' | 'delayed' | 'disrupted';
}

/** Crowd status classification used for colour-coding and alerts. */
export type CrowdStatus = 'low' | 'moderate' | 'high' | 'critical';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Density thresholds (percentage) for crowd status classification. */
const CROWD_THRESHOLDS = {
  MODERATE: 50,
  HIGH: 75,
  CRITICAL: 90,
} as const;

/** Colour palette for crowd status visualisation. */
const CROWD_COLORS: Readonly<Record<CrowdStatus, string>> = {
  low: '#22c55e',
  moderate: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
} as const;

/** Maximum occupancy fluctuation percentage used in live data simulation. */
export const SIMULATION_FLUCTUATION_PERCENT = 0.02;

// ─── Venue Data ──────────────────────────────────────────────────────────────

/**
 * FIFA World Cup 2026 host venues.
 * Three representative stadiums across USA and Mexico.
 * Production deployment would include all 16 official venues.
 */
export const FIFA_STADIUMS: readonly Stadium[] = [
  {
    id: 'metlife',
    name: 'MetLife Stadium',
    city: 'New York / New Jersey',
    country: 'USA',
    capacity: 82500,
    coordinates: { lat: 40.8135, lng: -74.0745 },
    zones: [
      { id: 'z1', name: 'North Stand', capacity: 20000, currentOccupancy: 15200, alertThreshold: 90, amenities: ['Restrooms', 'Food Court', 'First Aid'] },
      { id: 'z2', name: 'South Stand', capacity: 20000, currentOccupancy: 18900, alertThreshold: 90, amenities: ['Restrooms', 'Bar', 'Fan Store'] },
      { id: 'z3', name: 'East Stand', capacity: 22000, currentOccupancy: 14000, alertThreshold: 85, amenities: ['Restrooms', 'Premium Lounge', 'Viewing Deck'] },
      { id: 'z4', name: 'West Stand', capacity: 20500, currentOccupancy: 19800, alertThreshold: 85, amenities: ['Restrooms', 'Family Zone', 'Kids Area'] },
    ],
    accessibleRoutes: [
      { id: 'ar1', name: 'Gate A - Accessible Entry', description: 'Main accessible entrance with dedicated parking, ramps, and elevator access to all levels.', entranceGate: 'Gate A', features: ['wheelchair', 'elevator', 'reserved_parking', 'audio_guide'] },
      { id: 'ar2', name: 'Gate D - Sensory Route', description: 'Quiet route designed for fans with sensory sensitivities. Reduced noise and crowd density.', entranceGate: 'Gate D', features: ['sensory_friendly', 'low_crowd', 'staff_assisted'] },
    ],
    transportOptions: [
      { type: 'shuttle', name: 'FIFA Official Shuttle', estimatedTime: 20, frequency: 10, currentStatus: 'normal' },
      { type: 'bus', name: 'NJ Transit Express', estimatedTime: 35, frequency: 15, currentStatus: 'normal' },
      { type: 'taxi', name: 'Rideshare Zone', estimatedTime: 25, frequency: 0, currentStatus: 'normal' },
    ],
  },
  {
    id: 'sofi',
    name: 'SoFi Stadium',
    city: 'Los Angeles',
    country: 'USA',
    capacity: 70000,
    coordinates: { lat: 33.9535, lng: -118.3392 },
    zones: [
      { id: 'z1', name: 'Champions Plaza', capacity: 18000, currentOccupancy: 12000, alertThreshold: 90, amenities: ['Premium Dining', 'VIP Lounge', 'Viewing Terrace'] },
      { id: 'z2', name: 'Endzone North', capacity: 17000, currentOccupancy: 16500, alertThreshold: 88, amenities: ['Food Trucks', 'Fan Zone', 'Photo Spots'] },
      { id: 'z3', name: 'Main Bowl East', capacity: 18000, currentOccupancy: 9000, alertThreshold: 85, amenities: ['Restrooms', 'Concessions', 'First Aid'] },
      { id: 'z4', name: 'Main Bowl West', capacity: 17000, currentOccupancy: 11000, alertThreshold: 85, amenities: ['Restrooms', 'Bar', 'ATM'] },
    ],
    accessibleRoutes: [
      { id: 'ar1', name: 'Accessible Main Gate', description: 'Level entry from Parking Lot 1 with continuous accessible pathway.', entranceGate: 'Gate 1', features: ['wheelchair', 'elevator', 'reserved_parking'] },
    ],
    transportOptions: [
      { type: 'metro', name: 'LA Metro C Line', estimatedTime: 15, frequency: 8, currentStatus: 'normal' },
      { type: 'shuttle', name: 'FIFA Shuttle Hub', estimatedTime: 25, frequency: 12, currentStatus: 'delayed' },
    ],
  },
  {
    id: 'estadio',
    name: 'Estadio Azteca',
    city: 'Mexico City',
    country: 'Mexico',
    capacity: 87000,
    coordinates: { lat: 19.3029, lng: -99.1505 },
    zones: [
      { id: 'z1', name: 'Inferior Norte', capacity: 22000, currentOccupancy: 20000, alertThreshold: 92, amenities: ['Comida', 'Baños', 'Primeros Auxilios'] },
      { id: 'z2', name: 'Inferior Sur', capacity: 22000, currentOccupancy: 18000, alertThreshold: 90, amenities: ['Comida', 'Baños', 'Tienda'] },
      { id: 'z3', name: 'Superior', capacity: 43000, currentOccupancy: 35000, alertThreshold: 88, amenities: ['Zona Familiar', 'Comida', 'Baños'] },
    ],
    accessibleRoutes: [
      { id: 'ar1', name: 'Acceso Especial', description: 'Entrada dedicada con rampas y elevadores para personas con discapacidad.', entranceGate: 'Puerta Especial', features: ['wheelchair', 'elevator', 'staff_assisted', 'audio_guide'] },
    ],
    transportOptions: [
      { type: 'metro', name: 'Metro Línea 2', estimatedTime: 20, frequency: 5, currentStatus: 'normal' },
      { type: 'bus', name: 'Metrobús FIFA', estimatedTime: 30, frequency: 10, currentStatus: 'normal' },
    ],
  },
] as const;

// ─── Crowd Analytics Functions ───────────────────────────────────────────────

/**
 * Calculate crowd density as a percentage for a given zone.
 * @param zone - The stadium zone with current occupancy data.
 * @returns Integer percentage (0-100) representing how full the zone is.
 */
export function getCrowdDensity(zone: Pick<StadiumZone, 'currentOccupancy' | 'capacity'>): number {
  if (zone.capacity <= 0) return 0;
  return Math.round((zone.currentOccupancy / zone.capacity) * 100);
}

/**
 * Classify crowd density into a status level for operational decisions.
 * Thresholds: <50% low, 50-74% moderate, 75-89% high, ≥90% critical.
 * @param density - Crowd density as a percentage (0-100).
 * @returns CrowdStatus classification string.
 */
export function getCrowdStatus(density: number): CrowdStatus {
  if (density < CROWD_THRESHOLDS.MODERATE) return 'low';
  if (density < CROWD_THRESHOLDS.HIGH) return 'moderate';
  if (density < CROWD_THRESHOLDS.CRITICAL) return 'high';
  return 'critical';
}

/**
 * Get the display colour for a crowd status level.
 * Used by UI components for progress bars, badges, and heatmap cells.
 * @param status - The CrowdStatus to get a colour for.
 * @returns CSS hex colour string.
 */
export function getCrowdColor(status: CrowdStatus): string {
  return CROWD_COLORS[status];
}

/**
 * Look up a stadium by its unique identifier.
 * @param id - The stadium ID to search for.
 * @returns The matching Stadium object, or undefined if not found.
 */
export function getStadiumById(id: string): Stadium | undefined {
  return FIFA_STADIUMS.find((s) => s.id === id);
}

/**
 * Identify all zones that are at or above their configured alert threshold.
 * Used by the Operations Dashboard to auto-generate critical alerts.
 * @param stadium - The stadium to analyse.
 * @returns Array of zones where density >= alertThreshold.
 */
export function getCriticalZones(stadium: Stadium): StadiumZone[] {
  return stadium.zones.filter((zone) => getCrowdDensity(zone) >= zone.alertThreshold);
}

/**
 * Simulate real-time occupancy fluctuation for a zone.
 * Adds a random ±2% variation to current occupancy, clamped to valid bounds.
 * @param zone - The zone to simulate.
 * @returns New occupancy value within [0, zone.capacity].
 */
export function simulateOccupancyFluctuation(zone: StadiumZone): number {
  const maxFluctuation = Math.floor(zone.capacity * SIMULATION_FLUCTUATION_PERCENT);
  const fluctuation = Math.floor(Math.random() * maxFluctuation) * (Math.random() > 0.5 ? 1 : -1);
  return Math.max(0, Math.min(zone.capacity, zone.currentOccupancy + fluctuation));
}

// ─── Multilingual Support ────────────────────────────────────────────────────

/**
 * Languages supported by the ArenaMind AI Fan Assistant.
 * Covers the most-spoken languages among FIFA World Cup 2026 attendees.
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇲🇽' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
] as const;

/** ISO language code type derived from the supported languages list. */
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];
