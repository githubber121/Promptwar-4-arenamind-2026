/**
 * GET /api/stadiums
 * Returns list of FIFA 2026 stadiums with live crowd data
 */

import { NextResponse } from 'next/server';
import { FIFA_STADIUMS, getCrowdDensity, getCrowdStatus } from '@/lib/stadiumData';

export async function GET() {
  try {
    // Simulate slight real-time fluctuation in occupancy (±2%)
    const liveData = FIFA_STADIUMS.map((stadium) => ({
      id: stadium.id,
      name: stadium.name,
      city: stadium.city,
      country: stadium.country,
      capacity: stadium.capacity,
      coordinates: stadium.coordinates,
      zones: stadium.zones.map((zone) => {
        const fluctuation = Math.floor(Math.random() * (zone.capacity * 0.02)) * (Math.random() > 0.5 ? 1 : -1);
        const liveOccupancy = Math.max(0, Math.min(zone.capacity, zone.currentOccupancy + fluctuation));
        const density = getCrowdDensity({ ...zone, currentOccupancy: liveOccupancy });
        return {
          ...zone,
          currentOccupancy: liveOccupancy,
          density,
          status: getCrowdStatus(density),
        };
      }),
      transportOptions: stadium.transportOptions,
      accessibleRoutes: stadium.accessibleRoutes,
    }));

    return NextResponse.json({ success: true, data: liveData }, { status: 200 });
  } catch (error) {
    console.error('[/api/stadiums] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stadium data.' }, { status: 500 });
  }
}
