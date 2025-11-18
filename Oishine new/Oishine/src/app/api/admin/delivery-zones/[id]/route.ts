import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for updating delivery zones
const updateDeliveryZoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required').optional(),
  description: z.string().optional(),
  area: z.array(z.array(z.number())).min(1, 'Area coordinates are required').optional(),
  deliveryFee: z.number().min(0, 'Delivery fee must be positive').optional(),
  estimatedTime: z.number().min(1, 'Estimated time must be at least 1 minute').optional(),
  isActive: z.boolean().optional(),
});

// PUT - Update delivery zone
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const validatedData = updateDeliveryZoneSchema.parse(body);

    // Check if zone exists
    const existingZone = await db.deliveryZone.findUnique({
      where: { id }
    });

    if (!existingZone) {
      return NextResponse.json(
        { success: false, error: 'Delivery zone not found' },
        { status: 404 }
      );
    }

    // If updating name, check if new name already exists (excluding current zone)
    if (validatedData.name && validatedData.name !== existingZone.name) {
      const nameExists = await db.deliveryZone.findFirst({
        where: { 
          name: validatedData.name,
          id: { not: id }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: 'Zone with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.area !== undefined) updateData.area = JSON.stringify(validatedData.area);
    if (validatedData.deliveryFee !== undefined) updateData.deliveryFee = validatedData.deliveryFee;
    if (validatedData.estimatedTime !== undefined) updateData.estimatedTime = validatedData.estimatedTime;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    const zone = await db.deliveryZone.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        ...zone,
        area: zone.area ? JSON.parse(zone.area) : []
      }
    });
  } catch (error) {
    console.error('Error updating delivery zone:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update delivery zone' },
      { status: 500 }
    );
  }
}

// DELETE - Delete delivery zone
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check if zone exists
    const existingZone = await db.deliveryZone.findUnique({
      where: { id }
    });

    if (!existingZone) {
      return NextResponse.json(
        { success: false, error: 'Delivery zone not found' },
        { status: 404 }
      );
    }

    await db.deliveryZone.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery zone deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting delivery zone:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete delivery zone' },
      { status: 500 }
    );
  }
}