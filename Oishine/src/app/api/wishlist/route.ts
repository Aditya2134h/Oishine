import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')

    if (!userId && !sessionId) {
      return NextResponse.json({
        success: false,
        error: 'User ID or Session ID required'
      }, { status: 400 })
    }

    const wishlist = await db.wishlist.findMany({
      where: {
        userId: userId || sessionId
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: wishlist
    })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch wishlist'
    }, { status: 500 })
  }
}

// POST - Add product to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, sessionId, productId } = body

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 })
    }

    if (!userId && !sessionId) {
      return NextResponse.json({
        success: false,
        error: 'User ID or Session ID required'
      }, { status: 400 })
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 })
    }

    // Check if already in wishlist
    const existing = await db.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: userId || sessionId || '',
          productId
        }
      }
    })

    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'Product already in wishlist'
      }, { status: 400 })
    }

    // Add to wishlist
    const wishlistItem = await db.wishlist.create({
      data: {
        userId: userId || sessionId,
        productId
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: wishlistItem,
      message: 'Added to wishlist'
    })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add to wishlist'
    }, { status: 500 })
  }
}

// DELETE - Remove product from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 })
    }

    if (!userId && !sessionId) {
      return NextResponse.json({
        success: false,
        error: 'User ID or Session ID required'
      }, { status: 400 })
    }

    // Delete from wishlist
    await db.wishlist.delete({
      where: {
        userId_productId: {
          userId: userId || sessionId || '',
          productId
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist'
    })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to remove from wishlist'
    }, { status: 500 })
  }
}
