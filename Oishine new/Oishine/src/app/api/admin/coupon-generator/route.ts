import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Schema for coupon generation
const couponGeneratorSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().min(1, 'Value must be greater than 0'),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().min(1).optional(),
  usageLimit: z.number().min(1).optional(),
  userLimit: z.number().min(1).optional(),
  validFrom: z.string(),
  validTo: z.string(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  prefix: z.string().min(2, 'Prefix must be at least 2 characters').max(10, 'Prefix too long'),
  length: z.number().min(6).max(12),
  isActive: z.boolean().default(true)
});

// Helper function to generate random code
function generateRandomCode(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to generate unique coupon code
async function generateUniqueCode(prefix: string, length: number): Promise<string> {
  const maxAttempts = 100;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const randomPart = generateRandomCode(length - prefix.length);
    const code = `${prefix}${randomPart}`;
    
    // Check if code already exists
    const existing = await db.voucher.findUnique({
      where: { code }
    });
    
    if (!existing) {
      return code;
    }
    
    attempts++;
  }
  
  throw new Error('Unable to generate unique code after multiple attempts');
}

// POST - Generate bulk coupons
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = couponGeneratorSchema.parse(body);

    const {
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      userLimit,
      validFrom,
      validTo,
      quantity,
      prefix,
      length,
      isActive
    } = validatedData;

    // Validate dates
    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);
    
    if (fromDate >= toDate) {
      return NextResponse.json(
        { success: false, error: 'Valid to date must be after valid from date' },
        { status: 400 }
      );
    }

    if (fromDate < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Valid from date cannot be in the past' },
        { status: 400 }
      );
    }

    // Validate percentage discount
    if (type === 'PERCENTAGE' && value > 100) {
      return NextResponse.json(
        { success: false, error: 'Percentage discount cannot exceed 100%' },
        { status: 400 }
      );
    }

    // Generate coupons
    const generatedCoupons = [];
    const failedCoupons = [];

    for (let i = 0; i < quantity; i++) {
      try {
        const code = await generateUniqueCode(prefix.toUpperCase(), length);
        
        const coupon = await db.voucher.create({
          data: {
            code,
            name: `${name} - ${i + 1}`,
            description,
            type,
            value,
            minOrderAmount,
            maxDiscountAmount,
            usageLimit,
            userLimit,
            isActive,
            validFrom: fromDate,
            validTo: toDate
          }
        });

        generatedCoupons.push({
          id: coupon.id,
          code: coupon.code,
          name: coupon.name
        });
      } catch (error) {
        failedCoupons.push({
          attempt: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        campaign: {
          name,
          description,
          type,
          value,
          totalGenerated: quantity,
          successful: generatedCoupons.length,
          failed: failedCoupons.length
        },
        coupons: generatedCoupons,
        failedCoupons
      }
    });
  } catch (error) {
    console.error('Error generating coupons:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate coupons' },
      { status: 500 }
    );
  }
}

// GET - Get coupon generation templates/history
export async function GET() {
  try {
    // Get recent voucher generations
    const recentVouchers = await db.voucher.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        value: true,
        isActive: true,
        validFrom: true,
        validTo: true,
        usageLimit: true,
        usageCount: true,
        createdAt: true
      }
    });

    // Group by campaign (extract base name from voucher name)
    const campaigns = new Map();
    
    recentVouchers.forEach(voucher => {
      const baseName = voucher.name.replace(/ - \d+$/, '');
      
      if (!campaigns.has(baseName)) {
        campaigns.set(baseName, {
          name: baseName,
          type: voucher.type,
          value: voucher.value,
          totalGenerated: 0,
          totalUsed: 0,
          activeCount: 0,
          createdAt: voucher.createdAt,
          validFrom: voucher.validFrom,
          validTo: voucher.validTo,
          vouchers: []
        });
      }
      
      const campaign = campaigns.get(baseName);
      campaign.totalGenerated++;
      campaign.totalUsed += voucher.usageCount;
      if (voucher.isActive) campaign.activeCount++;
      campaign.vouchers.push({
        id: voucher.id,
        code: voucher.code,
        usageCount: voucher.usageCount,
        usageLimit: voucher.usageLimit,
        isActive: voucher.isActive
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        campaigns: Array.from(campaigns.values()),
        recentVouchers
      }
    });
  } catch (error) {
    console.error('Error fetching coupon generation data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupon generation data' },
      { status: 500 }
    );
  }
}