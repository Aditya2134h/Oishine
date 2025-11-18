import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

// GET all categories
export async function GET(request: NextRequest) {
  try {
    // Skip auth for now - TODO: Add proper admin authentication later
    // const auth = await authMiddleware(request);
    // if (!auth.success) {
    //   return NextResponse.json({ error: auth.error }, { status: auth.status });
    // }

    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    console.log('Found categories:', categories.length);

    return NextResponse.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori' },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    // Skip auth for now - TODO: Add proper admin authentication later
    // const auth = await authMiddleware(request);
    // if (!auth.success) {
    //   return NextResponse.json({ error: auth.error }, { status: auth.status });
    // }

    const body = await request.json();
    const { name, description } = body;

    console.log('Creating category:', { name, description });

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Nama kategori wajib diisi' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await db.category.findFirst({
      where: { name: name }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Kategori dengan nama ini sudah ada' },
        { status: 400 }
      );
    }

    // Create category
    const category = await db.category.create({
      data: {
        name,
        description: description || ''
      }
    });

    console.log('Category created successfully:', category.name);

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      data: category
    });

  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan kategori' },
      { status: 500 }
    );
  }
}

// DELETE category by id (expects JSON body: { id: string })
export async function DELETE(request: NextRequest) {
  try {
    // Skip auth for now - TODO: Add proper admin authentication later
    // const auth = await authMiddleware(request);
    // if (!auth.success) {
    //   return NextResponse.json({ error: auth.error }, { status: auth.status });
    // }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID kategori diperlukan' }, { status: 400 });
    }

    const existing = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    if (existing._count?.products && existing._count.products > 0) {
      return NextResponse.json({ error: 'Tidak dapat menghapus kategori yang masih memiliki produk' }, { status: 400 });
    }

    await db.category.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus', data: { id } });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Gagal menghapus kategori' }, { status: 500 });
  }
}