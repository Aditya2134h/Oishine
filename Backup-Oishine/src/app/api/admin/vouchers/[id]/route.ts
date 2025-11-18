import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const voucher = await db.voucher.findUnique({
      where: { id: params.id }
    });

    if (!voucher) {
      return NextResponse.json(
        { success: false, error: 'Voucher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: voucher
    });
  } catch (error) {
    console.error('Error fetching voucher:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch voucher' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive, 
      validFrom, 
      validTo 
    } = body;

    // Check if voucher code already exists (excluding current voucher)
    if (code) {
      const existingVoucher = await db.voucher.findFirst({
        where: { 
          code: code.toUpperCase(),
          NOT: { id: params.id }
        }
      });

      if (existingVoucher) {
        return NextResponse.json(
          { success: false, error: 'Voucher code already exists' },
          { status: 400 }
        );
      }
    }

    const voucher = await db.voucher.update({
      where: { id: params.id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(value && { value }),
        ...(minOrderAmount !== undefined && { minOrderAmount: minOrderAmount || null }),
        ...(maxDiscountAmount !== undefined && { maxDiscountAmount: maxDiscountAmount || null }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit || null }),
        ...(userLimit !== undefined && { userLimit: userLimit || null }),
        ...(isActive !== undefined && { isActive }),
        ...(validFrom && { validFrom: new Date(validFrom) }),
        ...(validTo && { validTo: new Date(validTo) })
      }
    });

    return NextResponse.json({
      success: true,
      data: voucher
    });
  } catch (error) {
    console.error('Error updating voucher:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update voucher' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.voucher.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Voucher deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete voucher' },
      { status: 500 }
    );
  }
}