import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for creating/updating delivery zones
const deliveryZoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required'),
  description: z.string().optional(),
  area: z.array(z.array(z.number())).min(1, 'Area coordinates are required'),
  deliveryFee: z.number().min(0, 'Delivery fee must be positive'),
  estimatedTime: z.number().min(1, 'Estimated time must be at least 1 minute'),
  isActive: z.boolean().default(true),
});

// GET - Fetch all delivery zones
export async function GET() {
  try {
    const zones = await db.deliveryZone.findMany({
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: zones.map(zone => {
        try {
          return {
            ...zone,
            area: JSON.parse(zone.area) // Always parse the area from string to array
          };
        } catch (error) {
          // If parsing fails, return empty array
          return {
            ...zone,
            area: []
          };
        }
      })
    });
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch delivery zones' },
      { status: 500 }
    );
  }
}

// POST - Create new delivery zone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = deliveryZoneSchema.parse(body);

    // Check if zone name already exists
    const existingZone = await db.deliveryZone.findFirst({
      where: { name: validatedData.name }
    });

    if (existingZone) {
      return NextResponse.json(
        { success: false, error: 'Zone with this name already exists' },
        { status: 400 }
      );
    }

    const zone = await db.deliveryZone.create({
      data: {
        ...validatedData,
        area: JSON.stringify(validatedData.area)
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...zone,
        area: validatedData.area // Return the parsed area, not the string
      }
    });
  } catch (error) {
    console.error('Error creating delivery zone:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create delivery zone' },
      { status: 500 }
    );
  }
}