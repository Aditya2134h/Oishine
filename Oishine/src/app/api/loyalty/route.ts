import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get user's loyalty points and history
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

    // Get user with points
    const user = await db.user.findUnique({
      where: { id: userId || sessionId || '' },
      select: {
        loyaltyPoints: true,
        membershipTier: true,
        totalSpent: true,
        totalOrders: true
      }
    })

    // Get points history
    const history = await db.loyaltyPointHistory.findMany({
      where: { userId: userId || sessionId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Calculate tier benefits
    const currentTier = user?.membershipTier || 'BRONZE'
    const tierBenefits = {
      BRONZE: { pointsMultiplier: 1, discountPercentage: 0, freeDeliveryMin: 100000 },
      SILVER: { pointsMultiplier: 1.2, discountPercentage: 5, freeDeliveryMin: 75000 },
      GOLD: { pointsMultiplier: 1.5, discountPercentage: 10, freeDeliveryMin: 50000 },
      PLATINUM: { pointsMultiplier: 2, discountPercentage: 15, freeDeliveryMin: 0 }
    }

    // Calculate next tier requirements
    const tierRequirements = {
      BRONZE: { minSpent: 0, minOrders: 0 },
      SILVER: { minSpent: 500000, minOrders: 5 },
      GOLD: { minSpent: 2000000, minOrders: 20 },
      PLATINUM: { minSpent: 5000000, minOrders: 50 }
    }

    return NextResponse.json({
      success: true,
      data: {
        points: user?.loyaltyPoints || 0,
        tier: currentTier,
        benefits: tierBenefits[currentTier],
        progress: {
          totalSpent: user?.totalSpent || 0,
          totalOrders: user?.totalOrders || 0,
          nextTier: currentTier === 'PLATINUM' ? null : 
            currentTier === 'GOLD' ? 'PLATINUM' :
            currentTier === 'SILVER' ? 'GOLD' : 'SILVER',
          nextTierRequirements: currentTier === 'PLATINUM' ? null :
            currentTier === 'GOLD' ? tierRequirements.PLATINUM :
            currentTier === 'SILVER' ? tierRequirements.GOLD :
            tierRequirements.SILVER
        },
        history
      }
    })
  } catch (error) {
    console.error('Error fetching loyalty points:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch loyalty points'
    }, { status: 500 })
  }
}

// POST - Award points or redeem points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, sessionId, points, type, description, orderId } = body

    if (!userId && !sessionId) {
      return NextResponse.json({
        success: false,
        error: 'User ID or Session ID required'
      }, { status: 400 })
    }

    if (!points || !type) {
      return NextResponse.json({
        success: false,
        error: 'Points and type are required'
      }, { status: 400 })
    }

    const userIdentifier = userId || sessionId || ''

    // Get or create user
    let user = await db.user.findUnique({
      where: { id: userIdentifier }
    })

    if (!user) {
      // Create user if doesn't exist
      user = await db.user.create({
        data: {
          id: userIdentifier,
          email: `${userIdentifier}@temp.com`,
          loyaltyPoints: 0,
          membershipTier: 'BRONZE'
        }
      })
    }

    // Update user points
    const newPoints = user.loyaltyPoints + points

    if (newPoints < 0) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient points'
      }, { status: 400 })
    }

    // Update user and create history entry in transaction
    const result = await db.$transaction([
      db.user.update({
        where: { id: userIdentifier },
        data: { loyaltyPoints: newPoints }
      }),
      db.loyaltyPointHistory.create({
        data: {
          userId: userIdentifier,
          points,
          type,
          description,
          orderId
        }
      })
    ])

    // Check if tier should be upgraded
    const updatedUser = result[0]
    const tierRequirements = {
      BRONZE: { minSpent: 0, minOrders: 0 },
      SILVER: { minSpent: 500000, minOrders: 5 },
      GOLD: { minSpent: 2000000, minOrders: 20 },
      PLATINUM: { minSpent: 5000000, minOrders: 50 }
    }

    let newTier = updatedUser.membershipTier
    if (updatedUser.totalSpent >= tierRequirements.PLATINUM.minSpent && 
        updatedUser.totalOrders >= tierRequirements.PLATINUM.minOrders) {
      newTier = 'PLATINUM'
    } else if (updatedUser.totalSpent >= tierRequirements.GOLD.minSpent && 
               updatedUser.totalOrders >= tierRequirements.GOLD.minOrders) {
      newTier = 'GOLD'
    } else if (updatedUser.totalSpent >= tierRequirements.SILVER.minSpent && 
               updatedUser.totalOrders >= tierRequirements.SILVER.minOrders) {
      newTier = 'SILVER'
    }

    // Update tier if changed
    if (newTier !== updatedUser.membershipTier) {
      await db.user.update({
        where: { id: userIdentifier },
        data: { membershipTier: newTier }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        points: newPoints,
        tier: newTier,
        tierUpgraded: newTier !== updatedUser.membershipTier
      },
      message: points > 0 ? `Earned ${points} points!` : `Redeemed ${Math.abs(points)} points`
    })
  } catch (error) {
    console.error('Error updating loyalty points:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update loyalty points'
    }, { status: 500 })
  }
}
