import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    
    let whereClause: any = {}
    
    if (status) {
      whereClause.status = status.toUpperCase()
    }
    
    if (userId) {
      whereClause.userId = userId
    }

    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      items, 
      total, 
      name, 
      email, 
      phone, 
      address, 
      notes, 
      userId, 
      voucherId,
      // Pre-order fields
      isPreOrder = false,
      scheduledTime,
      deliveryType = 'DELIVERY',
      deliveryAddress,
      deliveryFee = 0,
      paymentMethod = 'qris'
    } = body

    if (!items || !items.length || !total || !name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate pre-order
    if (isPreOrder && !scheduledTime) {
      return NextResponse.json(
        { error: 'Scheduled time is required for pre-orders' },
        { status: 400 }
      )
    }

    // Validate delivery address for delivery orders
    if (deliveryType === 'DELIVERY' && !deliveryAddress && !address) {
      return NextResponse.json(
        { error: 'Delivery address is required for delivery orders' },
        { status: 400 }
      )
    }

    // Validate scheduled time is in the future for pre-orders
    if (isPreOrder && scheduledTime) {
      const scheduledDate = new Date(scheduledTime)
      const now = new Date()
      if (scheduledDate <= now) {
        return NextResponse.json(
          { error: 'Scheduled time must be in the future' },
          { status: 400 }
        )
      }
    }

    let discountAmount = 0
    let voucher = null

    // If voucher is provided, validate and calculate discount
    if (voucherId) {
      voucher = await db.voucher.findUnique({
        where: { id: voucherId }
      })

      if (voucher && voucher.isActive) {
        const now = new Date()
        if (now >= voucher.validFrom && now <= voucher.validTo) {
          const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
          
          if (voucher.type === 'PERCENTAGE') {
            discountAmount = Math.round((subtotal * voucher.value) / 100)
            if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
              discountAmount = voucher.maxDiscountAmount
            }
          } else {
            discountAmount = voucher.value
          }

          // Update voucher usage count
          await db.voucher.update({
            where: { id: voucherId },
            data: { usageCount: { increment: 1 } }
          })
        }
      }
    }

    // Generate tracking number for delivery orders
    const trackingNumber = deliveryType === 'DELIVERY' ? `TRK${Date.now().toString().slice(-8)}` : null

    // Calculate estimated delivery time
    let estimatedDelivery = null
    if (isPreOrder && scheduledTime) {
      estimatedDelivery = new Date(scheduledTime)
    } else if (deliveryType === 'DELIVERY') {
      estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000) // 45 minutes from now
    }

    // Create order with enhanced features
    const order = await db.order.create({
      data: {
        total: parseInt(total),
        name,
        email,
        phone,
        address: deliveryAddress || address,
        notes,
        userId: userId || null,
        status: isPreOrder ? 'PENDING' : 'PENDING',
        // Pre-order fields
        isPreOrder,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
        deliveryType: deliveryType.toUpperCase(),
        // Delivery fields
        deliveryFee: parseInt(deliveryFee),
        deliveryAddress: deliveryAddress || address,
        estimatedDelivery,
        trackingNumber,
        // Payment
        paymentMethod,
        paymentStatus: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        },
        ...(voucherId && discountAmount > 0 && {
          orderVouchers: {
            create: {
              voucherId,
              discountAmount
            }
          }
        })
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
        driver: true,
        orderVouchers: {
          include: {
            voucher: true
          }
        }
      }
    })

    // Update product analytics
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          totalOrders: { increment: item.quantity },
          totalRevenue: { increment: item.price * item.quantity }
        }
      })
    }

    // Update user analytics if user exists
    if (userId) {
      const user = await db.user.findUnique({ where: { id: userId } })
      if (user) {
        await db.user.update({
          where: { id: userId },
          data: {
            totalOrders: { increment: 1 },
            totalSpent: { increment: parseInt(total) }
          }
        })
      }
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}