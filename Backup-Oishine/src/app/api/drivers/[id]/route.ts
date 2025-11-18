import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const driver = await db.driver.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            customerName: true
          }
        },
        _count: {
          select: { orders: true }
        }
      }
    })

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(driver)
  } catch (error) {
    console.error('Error fetching driver:', error)
    return NextResponse.json(
      { error: 'Failed to fetch driver' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      phone,
      email,
      licenseNumber,
      vehicleType,
      vehicleNumber,
      status,
      isActive
    } = body

    const driver = await db.driver.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email !== undefined && { email }),
        ...(licenseNumber && { licenseNumber }),
        ...(vehicleType && { vehicleType }),
        ...(vehicleNumber && { vehicleNumber }),
        ...(status && { status }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(driver)
  } catch (error) {
    console.error('Error updating driver:', error)
    return NextResponse.json(
      { error: 'Failed to update driver' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if driver has active orders
    const activeOrders = await db.order.count({
      where: {
        driverId: params.id,
        status: {
          in: ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERING']
        }
      }
    })

    if (activeOrders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete driver with active orders' },
        { status: 400 }
      )
    }

    await db.driver.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Driver deleted successfully' })
  } catch (error) {
    console.error('Error deleting driver:', error)
    return NextResponse.json(
      { error: 'Failed to delete driver' },
      { status: 500 }
    )
  }
}