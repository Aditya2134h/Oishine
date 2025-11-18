import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Check if location is in delivery zone and calculate fee
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      // Return all active zones if no coordinates provided
      const zones = await db.deliveryZone.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });

      return NextResponse.json({
        success: true,
        data: zones.map(zone => ({
          id: zone.id,
          name: zone.name,
          description: zone.description,
          deliveryFee: zone.deliveryFee,
          estimatedTime: zone.estimatedTime,
          area: JSON.parse(zone.area)
        }))
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Get all active zones
    const zones = await db.deliveryZone.findMany({
      where: { isActive: true }
    });

    // Check if point is in any zone
    let matchingZone = null;
    
    for (const zone of zones) {
      const area = JSON.parse(zone.area);
      
      if (isPointInPolygon(latitude, longitude, area)) {
        matchingZone = zone;
        break;
      }
    }

    if (matchingZone) {
      return NextResponse.json({
        success: true,
        data: {
          inDeliveryZone: true,
          zone: {
            id: matchingZone.id,
            name: matchingZone.name,
            description: matchingZone.description,
            deliveryFee: matchingZone.deliveryFee,
            estimatedTime: matchingZone.estimatedTime
          }
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        data: {
          inDeliveryZone: false,
          message: 'Location is outside our delivery area'
        }
      });
    }
  } catch (error) {
    console.error('Error checking delivery zone:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check delivery zone' },
      { status: 500 }
    );
  }
}

// Helper function to check if point is in polygon
function isPointInPolygon(lat: number, lng: number, polygon: Array<[number, number]>): boolean {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1], yi = polygon[i][0];
    const xj = polygon[j][1], yj = polygon[j][0];
    
    const intersect = ((yi > lat) !== (yj > lat))
        && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}