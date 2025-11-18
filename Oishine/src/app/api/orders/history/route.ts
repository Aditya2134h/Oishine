import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')

    if (!email && !phone) {
      return NextResponse.json({
        success: false,
        error: 'Email or phone is required'
      }, { status: 400 })
    }

    // Build where clause
    const whereClause: any = {}
    if (email) whereClause.email = email
    if (phone) whereClause.phone = phone

    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
        driver: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: orders
    })

  } catch (error) {
    console.error('Error fetching order history:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch order history'
    }, { status: 500 })
  }
}