import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const auth = await authMiddleware(request);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const product = await db.product.findUnique({
      where: { id: params.id },
      include: {
        category: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isAvailable
    } = body;

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: params.id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if category exists (if provided)
    if (categoryId) {
      const category = await db.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Kategori tidak ditemukan' },
          { status: 404 }
        );
      }
    }

    // Update product
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (image !== undefined) updateData.image = image;
    if (ingredients !== undefined) updateData.ingredients = ingredients;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);

    const product = await db.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diperbarui',
      data: product
    });

  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui produk' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const auth = await authMiddleware(request);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Get query parameters for force delete
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            cartItems: true,
            orderItems: true
          }
        }
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if product has related records
    if (existingProduct._count.cartItems > 0 || existingProduct._count.orderItems > 0) {
      if (!forceDelete) {
        return NextResponse.json(
          { 
            error: 'Produk tidak dapat dihapus karena sudah ada dalam pesanan atau keranjang belanja',
            code: 'HAS_RELATIONS',
            hasRelations: {
              cartItems: existingProduct._count.cartItems,
              orderItems: existingProduct._count.orderItems
            },
            suggestion: 'Gunakan ?force=true untuk menghapus paksa (hanya untuk admin)'
          },
          { status: 400 }
        );
      }

      // Force delete: remove related records first
      if (existingProduct._count.cartItems > 0) {
        await db.cartItem.deleteMany({
          where: { productId: params.id }
        });
      }

      if (existingProduct._count.orderItems > 0) {
        await db.orderItem.deleteMany({
          where: { productId: params.id }
        });
      }
    }

    // Delete product
    await db.product.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: forceDelete ? 'Produk berhasil dihapus paksa' : 'Produk berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus produk' },
      { status: 500 }
    );
  }
}