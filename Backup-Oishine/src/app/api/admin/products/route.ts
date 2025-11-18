import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

// GET all products
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await authMiddleware(request);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const isAvailable = searchParams.get('isAvailable');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category) {
      where.category = {
        name: { contains: category, mode: 'insensitive' }
      };
    }
    
    if (isAvailable !== null && isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.product.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await authMiddleware(request);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      image,
      ingredients,
      categoryId,
      isAvailable = true
    } = body;

    // Validation
    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Nama, deskripsi, harga, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await db.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Create product
    const product = await db.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image: image || '',
        ingredients: ingredients || '',
        categoryId,
        isAvailable: Boolean(isAvailable)
      },
      include: {
        category: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: product
    });

  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan produk' },
      { status: 500 }
    );
  }
}