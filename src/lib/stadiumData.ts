/**
 * Stadium data constants for FIFA World Cup 2026
 * Contains venue info, crowd thresholds, and transport data
 */

export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  coordinates: { lat: number; lng: number };
  zones: StadiumZone[];
  accessibleRoutes: AccessibleRoute[];
  transportOptions: TransportOption[];
}

export interface StadiumZone {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  alertThreshold: number; // percentage 0-100
  amenities: string[];
}

export interface AccessibleRoute {
  id: string;
  name: string;
  description: string;
  entranceGate: string;
  features: string[]; // e.g., 'wheelchair', 'elevator', 'audio_guide'
}

export interface TransportOption {
  type: 'metro' | 'bus' | 'shuttle' | 'taxi' | 'walk';
  name: string;
  estimatedTime: number; // minutes
  frequency: number; // minutes between services
  currentStatus: 'normal' | 'delayed' | 'disrupted';
}

export const FIFA_STADIUMS: Stadium[] = [
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
];

/**
 * Get crowd density percentage for a zone
 */
export function getCrowdDensity(zone: StadiumZone): number {
  return Math.round((zone.currentOccupancy / zone.capacity) * 100);
}

/**
 * Get crowd status label based on density
 */
export function getCrowdStatus(density: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (density < 50) return 'low';
  if (density < 75) return 'moderate';
  if (density < 90) return 'high';
  return 'critical';
}

/**
 * Get colour coding for crowd density display
 */
export function getCrowdColor(status: ReturnType<typeof getCrowdStatus>): string {
  const colors = {
    low: '#22c55e',
    moderate: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
  };
  return colors[status];
}

/**
 * Get a stadium by its ID
 */
export function getStadiumById(id: string): Stadium | undefined {
  return FIFA_STADIUMS.find((s) => s.id === id);
}

/**
 * Get all zones that are above their alert threshold
 */
export function getCriticalZones(stadium: Stadium): StadiumZone[] {
  return stadium.zones.filter((zone) => getCrowdDensity(zone) >= zone.alertThreshold);
}

/**
 * Supported languages for the AI assistant
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

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];
