import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const orderId = searchParams.get('orderId')

    // Build where clause
    const whereClause: any = {}
    if (productId) whereClause.productId = productId
    if (orderId) whereClause.orderId = orderId

    const reviews = await db.review.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        product: {
          select: {
            name: true,
            image: true
          }
        },
        order: {
          select: {
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: reviews
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch reviews'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, productId, rating, comment, images, userId } = body

    if (!productId || !rating) {
      return NextResponse.json({
        success: false,
        error: 'Product ID and rating are required'
      }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        error: 'Rating must be between 1 and 5'
      }, { status: 400 })
    }

    // Check if order exists and is completed (only if orderId is provided)
    if (orderId) {
      const order = await db.order.findUnique({
        where: { id: orderId }
      })

      if (!order || order.status !== 'COMPLETED') {
        return NextResponse.json({
          success: false,
          error: 'Only completed orders can be reviewed'
        }, { status: 400 })
      }
    }

    // Check if review already exists (for the same user/product combination)
    const existingReview = await db.review.findFirst({
      where: {
        ...(orderId && { orderId }),
        productId,
        ...(userId && { userId })
      }
    })

    if (existingReview) {
      return NextResponse.json({
        success: false,
        error: 'You have already reviewed this product'
      }, { status: 400 })
    }

    // Create review
    const review = await db.review.create({
      data: {
        ...(orderId && { orderId }),
        productId,
        userId,
        rating,
        comment,
        images: images ? JSON.stringify(images) : null
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        product: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    // Update product rating
    const allReviews = await db.review.findMany({
      where: { productId }
    })

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await db.product.update({
      where: { id: productId },
      data: {
        averageRating: avgRating,
        reviewCount: allReviews.length
      }
    })

    // Update user review count
    const userReviews = await db.review.findMany({
      where: { userId }
    })

    const userAvgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length

    if (userId) {
      await db.user.update({
        where: { id: userId },
        data: {
          reviewCount: userReviews.length,
          averageRating: userAvgRating
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: review
    })

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create review'
    }, { status: 500 })
  }
}