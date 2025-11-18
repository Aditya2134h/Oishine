import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const route = await db.deliveryRoute.findUnique({
      where: { id: params.id },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
            vehicleNumber: true,
            status: true
          }
        },
        routeOrders: {
          include: {
            order: {
              select: {
                id: true,
                total: true,
                status: true,
                name: true,
                phone: true,
                address: true,
                createdAt: true,
                items: {
                  include: {
                    product: {
                      select: {
                        id: true,
                        name: true,
                        price: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            sequence: 'asc'
          }
        }
      }
    })

    if (!route) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(route)
  } catch (error) {
    console.error('Error fetching route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch route' },
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
      status,
      startTime,
      endTime,
      actualTime,
      fuelCost,
      notes
    } = body

    const updateData: any = {}
    
    if (status) updateData.status = status
    if (startTime) updateData.startTime = new Date(startTime)
    if (endTime) updateData.endTime = new Date(endTime)
    if (actualTime) updateData.actualTime = actualTime
    if (fuelCost) updateData.fuelCost = fuelCost

    const route = await db.deliveryRoute.update({
      where: { id: params.id },
      data: updateData,
      include: {
        driver: true,
        routeOrders: {
          include: { order: true },
          orderBy: { sequence: 'asc' }
        }
      }
    })

    // Update driver status based on route status
    if (status === 'ACTIVE') {
      await db.driver.update({
        where: { id: route.driverId },
        data: { status: 'BUSY' }
      })
    } else if (status === 'COMPLETED') {
      await db.driver.update({
        where: { id: route.driverId },
        data: { status: 'AVAILABLE' }
      })
    }

    return NextResponse.json(route)
  } catch (error) {
    console.error('Error updating route:', error)
    return NextResponse.json(
      { error: 'Failed to update route' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const route = await db.deliveryRoute.findUnique({
      where: { id: params.id },
      select: { status: true }
    })

    if (!route) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      )
    }

    if (route.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot delete active route' },
        { status: 400 }
      )
    }

    await db.deliveryRoute.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Route deleted successfully' })
  } catch (error) {
    console.error('Error deleting route:', error)
    return NextResponse.json(
      { error: 'Failed to delete route' },
      { status: 500 }
    )
  }
}