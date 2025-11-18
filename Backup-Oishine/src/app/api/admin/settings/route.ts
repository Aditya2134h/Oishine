import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  storeName: z.string().optional(),
  storeEmail: z.string().email().optional(),
  storePhone: z.string().optional(),
  storeAddress: z.string().optional(),
  storeDescription: z.string().optional(),
  currency: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  weekdayHours: z.string().optional(),
  weekendHours: z.string().optional(),
  holidayHours: z.string().optional(),
});

// PUT - Update store settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateSettingsSchema.parse(body);

    // Get existing settings
    let settings = await db.storeSettings.findFirst();

    if (!settings) {
      // Create new settings if none exist
      settings = await db.storeSettings.create({
        data: {
          storeName: validatedData.storeName || 'Oishine!',
          storeEmail: validatedData.storeEmail || 'admin@oishine.com',
          storePhone: validatedData.storePhone || '+62 812-3456-7890',
          storeAddress: validatedData.storeAddress || 'Purwokerto, Indonesia',
          storeDescription: validatedData.storeDescription || 'Delicious Japanese Food Delivery - Purwokerto',
          currency: validatedData.currency || 'IDR',
          taxRate: validatedData.taxRate || 11,
          contactEmail: validatedData.contactEmail || 'info@oishine.com',
          contactPhone: validatedData.contactPhone || '+62 281 123456',
          contactAddress: validatedData.contactAddress || 'Jl. Jend. Gatot Subroto No. 30, Purwokerto',
          weekdayHours: validatedData.weekdayHours || '10:00 - 22:00',
          weekendHours: validatedData.weekendHours || '10:00 - 23:00',
          holidayHours: validatedData.holidayHours || '10:00 - 23:00',
        }
      });
    } else {
      // Update existing settings
      const updateData: any = {};
      
      Object.keys(validatedData).forEach(key => {
        if (validatedData[key as keyof typeof validatedData] !== undefined) {
          updateData[key] = validatedData[key as keyof typeof validatedData];
        }
      });

      settings = await db.storeSettings.update({
        where: { id: settings.id },
        data: updateData
      });
    }

    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error updating store settings:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update store settings' },
      { status: 500 }
    );
  }
}