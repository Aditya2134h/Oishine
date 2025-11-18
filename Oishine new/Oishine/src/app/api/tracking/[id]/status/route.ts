import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, note, actualArrival } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Check if tracking exists
    const tracking = await db.deliveryTracking.findUnique({
      where: { id: params.id },
      include: { order: true }
    })

    if (!tracking) {
      return NextResponse.json(
        { error: 'Tracking not found' },
        { status: 404 }
      )
    }

    // Validate status transitions
    const validStatuses = [
      'ORDER_CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY',
      'NEAR_DESTINATION',
      'DELIVERED',
      'FAILED'
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update status history
    const statusHistory = JSON.parse(tracking.statusHistory || '[]')
    statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${status}`
    })

    // Update tracking
    const updateData: any = {
      statusHistory: JSON.stringify(statusHistory)
    }

    if (actualArrival) {
      updateData.actualArrival = new Date(actualArrival)
    }

    const updatedTracking = await db.deliveryTracking.update({
      where: { id: params.id },
      data: updateData
    })

    // Update order status based on tracking status
    let orderStatus = tracking.order.status
    switch (status) {
      case 'PREPARING':
        orderStatus = 'PREPARING'
        break
      case 'READY_FOR_PICKUP':
        orderStatus = 'READY_FOR_PICKUP'
        break
      case 'OUT_FOR_DELIVERY':
        orderStatus = 'DELIVERING'
        break
      case 'DELIVERED':
        orderStatus = 'COMPLETED'
        break
      case 'FAILED':
        orderStatus = 'CANCELLED'
        break
    }

    await db.order.update({
      where: { id: tracking.orderId },
      data: { status: orderStatus }
    })

    // If delivered, update driver status to available
    if (status === 'DELIVERED' && tracking.driverId) {
      await db.driver.update({
        where: { id: tracking.driverId },
        data: { status: 'AVAILABLE' }
      })
    }

    // Send notification (mock implementation)
    await sendNotification(tracking.orderId, status, note)

    return NextResponse.json({
      tracking: updatedTracking,
      orderStatus,
      message: `Status updated to ${status}`
    })
  } catch (error) {
    console.error('Error updating tracking status:', error)
    return NextResponse.json(
      { error: 'Failed to update tracking status' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tracking = await db.deliveryTracking.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        statusHistory: true,
        createdAt: true,
        updatedAt: true,
        order: {
          select: {
            id: true,
            status: true,
            name: true,
            phone: true
          }
        }
      }
    })

    if (!tracking) {
      return NextResponse.json(
        { error: 'Tracking not found' },
        { status: 404 }
      )
    }

    const statusHistory = JSON.parse(tracking.statusHistory || '[]')

    return NextResponse.json({
      tracking,
      statusHistory
    })
  } catch (error) {
    console.error('Error fetching tracking status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracking status' },
      { status: 500 }
    )
  }
}

// Helper function for sending notifications
async function sendNotification(orderId: string, status: string, note?: string) {
  try {
    // Mock notification sending - in production, integrate with:
    // - WhatsApp Business API
    // - SMS Gateway
    // - Push Notifications
    // - Email Service
    
    console.log(`Notification sent for order ${orderId}: ${status} - ${note || 'No note'}`)
    
    // Here you would implement actual notification logic
    // Example:
    // await sendWhatsAppNotification(orderId, status)
    // await sendSMSNotification(orderId, status)
    // await sendPushNotification(orderId, status)
    
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}