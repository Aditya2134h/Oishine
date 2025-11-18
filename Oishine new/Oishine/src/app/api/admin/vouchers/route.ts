import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const vouchers = await db.voucher.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: vouchers
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vouchers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      code, 
      name, 
      description, 
      type, 
      value, 
      minOrderAmount, 
      maxDiscountAmount, 
      usageLimit, 
      userLimit, 
      validFrom, 
      validTo 
    } = body;

    if (!code || !name || !type || !value || !validFrom || !validTo) {
      return NextResponse.json(
        { success: false, error: 'Code, name, type, value, validFrom, and validTo are required' },
        { status: 400 }
      );
    }

    // Check if voucher code already exists
    const existingVoucher = await db.voucher.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingVoucher) {
      return NextResponse.json(
        { success: false, error: 'Voucher code already exists' },
        { status: 400 }
      );
    }

    const voucher = await db.voucher.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        type,
        value,
        minOrderAmount: minOrderAmount || null,
        maxDiscountAmount: maxDiscountAmount || null,
        usageLimit: usageLimit || null,
        userLimit: userLimit || null,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo)
      }
    });

    return NextResponse.json({
      success: true,
      data: voucher
    });
  } catch (error) {
    console.error('Error creating voucher:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create voucher' },
      { status: 500 }
    );
  }
}