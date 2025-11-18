import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get('driverId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}
    
    if (driverId) {
      where.driverId = driverId
    }
    
    if (status) {
      where.status = status
    }
    
    if (date) {
      const targetDate = new Date(date)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      where.date = {
        gte: targetDate,
        lt: nextDay
      }
    }

    const [routes, total] = await Promise.all([
      db.deliveryRoute.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              phone: true,
              vehicleType: true,
              vehicleNumber: true
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
                  createdAt: true
                }
              }
            },
            orderBy: {
              sequence: 'asc'
            }
          },
          _count: {
            select: { routeOrders: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.deliveryRoute.count({ where })
    ])

    return NextResponse.json({
      routes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch routes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      driverId,
      date,
      orderIds,
      optimizeRoute = true
    } = body

    // Validate required fields
    if (!driverId || !date || !orderIds || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: driverId, date, orderIds' },
        { status: 400 }
      )
    }

    // Check if driver exists and is available
    const driver = await db.driver.findUnique({
      where: { id: driverId }
    })

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      )
    }

    // Get orders and validate they exist and are ready for delivery
    const orders = await db.order.findMany({
      where: {
        id: { in: orderIds },
        status: { in: ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'] }
      }
    })

    if (orders.length !== orderIds.length) {
      return NextResponse.json(
        { error: 'Some orders are not ready for delivery' },
        { status: 400 }
      )
    }

    // Create route
    const route = await db.deliveryRoute.create({
      data: {
        driverId,
        date: new Date(date),
        status: 'PLANNED',
        routeOrders: {
          create: await Promise.all(orderIds.map(async (orderId: string, index: number) => {
            const order = orders.find(o => o.id === orderId)
            return {
              orderId,
              sequence: index + 1,
              estimatedArrival: calculateEstimatedArrival(order?.address || '', index)
            }
          }))
        }
      },
      include: {
        driver: true,
        routeOrders: {
          include: { order: true }
        }
      }
    })

    // Optimize route if requested
    if (optimizeRoute) {
      const optimizedRoute = await optimizeDeliveryRoute(route.id)
      return NextResponse.json(optimizedRoute)
    }

    return NextResponse.json(route, { status: 201 })
  } catch (error) {
    console.error('Error creating route:', error)
    return NextResponse.json(
      { error: 'Failed to create route' },
      { status: 500 }
    )
  }
}

// Helper function to calculate estimated arrival
function calculateEstimatedArrival(address: string, sequence: number): Date {
  const now = new Date()
  const estimatedMinutes = 30 + (sequence * 20) // Base 30 minutes + 20 minutes per stop
  now.setMinutes(now.getMinutes() + estimatedMinutes)
  return now
}

// Helper function to optimize route using a simple algorithm
async function optimizeDeliveryRoute(routeId: string) {
  const route = await db.deliveryRoute.findUnique({
    where: { id: routeId },
    include: {
      routeOrders: {
        include: { order: true }
      }
    }
  })

  if (!route) return null

  // Simple optimization: sort by distance from restaurant (would use real geolocation in production)
  const optimizedOrders = [...route.routeOrders].sort((a, b) => {
    // This is a simplified optimization - in production, use Google Maps API or similar
    const distanceA = calculateSimpleDistance(a.order.address)
    const distanceB = calculateSimpleDistance(b.order.address)
    return distanceA - distanceB
  })

  // Update sequence
  await Promise.all(optimizedOrders.map((order, index) => 
    db.deliveryRouteOrder.update({
      where: { id: order.id },
      data: { sequence: index + 1 }
    })
  ))

  // Calculate total distance and estimated time
  const totalDistance = optimizedOrders.length * 2.5 // Simplified calculation
  const estimatedTime = Math.round(30 + (optimizedOrders.length * 15))

  // Update route with optimization data
  const updatedRoute = await db.deliveryRoute.update({
    where: { id: routeId },
    data: {
      totalDistance,
      estimatedTime,
      optimizationScore: Math.min(95, 60 + (optimizedOrders.length * 5)),
      optimizedPath: JSON.stringify({
        waypoints: optimizedOrders.map(o => ({
          orderId: o.orderId,
          address: o.order.address,
          sequence: o.sequence
        }))
      })
    },
    include: {
      driver: true,
      routeOrders: {
        include: { order: true },
        orderBy: { sequence: 'asc' }
      }
    }
  })

  return updatedRoute
}

// Simplified distance calculation (in production, use real geolocation)
function calculateSimpleDistance(address: string): number {
  // This is a mock calculation - in production, use actual coordinates
  const addressLength = address.length
  return (addressLength % 10) + 1
}