import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, email, totalAmount } = body;

    if (!code || !totalAmount) {
      return NextResponse.json(
        { success: false, error: 'Code and totalAmount are required' },
        { status: 400 }
      );
    }

    // Find the voucher
    const voucher = await db.voucher.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!voucher) {
      return NextResponse.json(
        { success: false, error: 'Voucher tidak valid' },
        { status: 404 }
      );
    }

    // Check if voucher is active
    if (!voucher.isActive) {
      return NextResponse.json(
        { success: false, error: 'Voucher tidak aktif' },
        { status: 400 }
      );
    }

    // Check validity dates
    const now = new Date();
    if (now < voucher.validFrom || now > voucher.validTo) {
      return NextResponse.json(
        { success: false, error: 'Voucher sudah kadaluarsa' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
      return NextResponse.json(
        { success: false, error: 'Voucher sudah mencapai batas penggunaan' },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (voucher.minOrderAmount && totalAmount < voucher.minOrderAmount) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Minimum pembelian Rp ${voucher.minOrderAmount.toLocaleString('id-ID')}` 
        },
        { status: 400 }
      );
    }

    // Check user limit (if email provided)
    if (voucher.userLimit && email) {
      const userOrders = await db.orderVoucher.count({
        where: {
          voucher: {
            code: code.toUpperCase()
          },
          order: {
            email: email
          }
        }
      });

      if (userOrders >= voucher.userLimit) {
        return NextResponse.json(
          { success: false, error: `Anda sudah mencapai batas penggunaan voucher ini` },
          { status: 400 }
        );
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.type === 'PERCENTAGE') {
      discountAmount = Math.round((totalAmount * voucher.value) / 100);
      // Apply maximum discount limit if set
      if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
        discountAmount = voucher.maxDiscountAmount;
      }
    } else {
      discountAmount = voucher.value;
    }

    return NextResponse.json({
      success: true,
      data: {
        voucher: {
          id: voucher.id,
          code: voucher.code,
          name: voucher.name,
          type: voucher.type,
          value: voucher.value,
          discountAmount
        },
        discountAmount,
        finalAmount: totalAmount - discountAmount
      }
    });
  } catch (error) {
    console.error('Error validating voucher:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate voucher' },
      { status: 500 }
    );
  }
}