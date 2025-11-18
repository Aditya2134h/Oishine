import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Check if vouchers already exist
    const existingVouchers = await db.voucher.count();
    if (existingVouchers > 0) {
      return NextResponse.json({
        success: true,
        message: 'Vouchers already exist',
        count: existingVouchers
      });
    }

    // Seed sample vouchers
    const vouchers = [
      {
        code: 'WELCOME10',
        name: 'Diskon Selamat Datang',
        description: 'Diskon 10% untuk pembelian pertama',
        type: 'PERCENTAGE',
        value: 10,
        minOrderAmount: 50000,
        maxDiscountAmount: 25000,
        usageLimit: 100,
        userLimit: 1,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        code: 'FREESHIP',
        name: 'Gratis Ongkir',
        description: 'Gratis ongkos kirim untuk pembelian minimal Rp 100.000',
        type: 'FIXED',
        value: 15000,
        minOrderAmount: 100000,
        usageLimit: 50,
        userLimit: 3,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      },
      {
        code: 'WEEKEND20',
        name: 'Diskon Akhir Pekan',
        description: 'Diskon 20% untuk akhir pekan',
        type: 'PERCENTAGE',
        value: 20,
        minOrderAmount: 75000,
        maxDiscountAmount: 50000,
        usageLimit: 200,
        userLimit: 2,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
      },
      {
        code: 'RAMADAN25',
        name: 'Diskon Ramadhan',
        description: 'Diskon spesial Ramadhan 25%',
        type: 'PERCENTAGE',
        value: 25,
        minOrderAmount: 100000,
        maxDiscountAmount: 75000,
        usageLimit: 150,
        userLimit: 1,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) // 45 days from now
      }
    ];

    const createdVouchers = await db.voucher.createMany({
      data: vouchers
    });

    return NextResponse.json({
      success: true,
      message: 'Sample vouchers seeded successfully',
      count: createdVouchers.count
    });
  } catch (error) {
    console.error('Error seeding vouchers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed vouchers' },
      { status: 500 }
    );
  }
}