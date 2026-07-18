/**
 * GET /api/stadiums
 * Returns list of FIFA 2026 stadiums with simulated live crowd data.
 * Each request applies a small random fluctuation to zone occupancy
 * to demonstrate real-time monitoring capabilities.
 */

import { NextResponse } from 'next/server';
import {
  FIFA_STADIUMS,
  getCrowdDensity,
  getCrowdStatus,
  simulateOccupancyFluctuation,
} from '@/lib/stadiumData';

export async function GET() {
  try {
    const liveData = FIFA_STADIUMS.map((stadium) => ({
      id: stadium.id,
      name: stadium.name,
      city: stadium.city,
      country: stadium.country,
      capacity: stadium.capacity,
      coordinates: stadium.coordinates,
      zones: stadium.zones.map((zone) => {
        const liveOccupancy = simulateOccupancyFluctuation(zone);
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
