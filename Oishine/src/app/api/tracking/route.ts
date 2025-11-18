import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const shareCode = searchParams.get('shareCode')
    const driverId = searchParams.get('driverId')

    // If no parameters, return all tracking data
    if (!orderId && !shareCode && !driverId) {
      const trackings = await db.deliveryTracking.findMany({
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
          },
          driver: {
            select: {
              id: true,
              name: true,
              phone: true,
              vehicleType: true,
              vehicleNumber: true,
              rating: true
            }
          },
          locationUpdates: {
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        },
        orderBy: { lastUpdate: 'desc' },
        take: 50
      })

      // Transform data to match frontend interface
      const transformedData = trackings.map(tracking => ({
        id: tracking.id,
        orderId: tracking.orderId,
        order: {
          id: tracking.order.id,
          customerName: tracking.order.name,
          customerPhone: tracking.order.phone,
          customerAddress: tracking.order.address,
          status: tracking.order.status,
          total: tracking.order.total,
          createdAt: tracking.order.createdAt
        },
        driver: tracking.driver,
        currentLat: tracking.currentLat,
        currentLng: tracking.currentLng,
        estimatedArrival: tracking.estimatedArrival?.toISOString(),
        actualArrival: tracking.actualArrival?.toISOString(),
        trackingUrl: tracking.trackingUrl,
        shareCode: tracking.shareCode,
        lastUpdate: tracking.lastUpdate.toISOString(),
        statusHistory: tracking.statusHistory ? JSON.parse(tracking.statusHistory) : [],
        locationUpdates: tracking.locationUpdates
      }))

      return NextResponse.json({
        success: true,
        data: transformedData
      })
    }

    // Find tracking by order ID or share code
    let tracking
    if (orderId) {
      tracking = await db.deliveryTracking.findUnique({
        where: { orderId },
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
                      image: true
                    }
                  }
                }
              }
            }
          },
          driver: {
            select: {
              id: true,
              name: true,
              phone: true,
              vehicleType: true,
              vehicleNumber: true,
              rating: true
            }
          },
          route: {
            select: {
              id: true,
              status: true,
              estimatedTime: true,
              optimizationScore: true
            }
          },
          locationUpdates: {
            orderBy: { timestamp: 'desc' },
            take: 10
          }
        }
      })
    } else if (shareCode) {
      tracking = await db.deliveryTracking.findUnique({
        where: { shareCode },
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
                      image: true
                    }
                  }
                }
              }
            }
          },
          driver: {
            select: {
              id: true,
              name: true,
              phone: true,
              vehicleType: true,
              vehicleNumber: true,
              rating: true
            }
          },
          locationUpdates: {
            orderBy: { timestamp: 'desc' },
            take: 10
          }
        }
      })
    } else if (driverId) {
      // Get all active tracking for a driver
      const trackings = await db.deliveryTracking.findMany({
        where: { driverId },
        include: {
          order: {
            select: {
              id: true,
              total: true,
              status: true,
              name: true,
              address: true
            }
          },
          locationUpdates: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        }
      })
      
      return NextResponse.json({ trackings })
    }

    if (!tracking) {
      return NextResponse.json(
        { error: 'Tracking not found' },
        { status: 404 }
      )
    }

    // Calculate ETA if driver is active
    let eta = null
    if (tracking.driver && tracking.currentLat && tracking.currentLng) {
      eta = calculateETA(tracking.currentLat, tracking.currentLng, tracking.order.address)
    }

    return NextResponse.json({
      ...tracking,
      eta,
      trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${tracking.shareCode}`
    })
  } catch (error) {
    console.error('Error fetching tracking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracking' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, driverId, routeId } = body

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Check if order exists
    const order = await db.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if tracking already exists
    const existingTracking = await db.deliveryTracking.findUnique({
      where: { orderId }
    })

    if (existingTracking) {
      return NextResponse.json(
        { error: 'Tracking already exists for this order' },
        { status: 400 }
      )
    }

    // Generate unique share code
    const shareCode = generateShareCode()

    // Create tracking record
    const tracking = await db.deliveryTracking.create({
      data: {
        orderId,
        driverId,
        routeId,
        shareCode,
        trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${shareCode}`,
        estimatedArrival: calculateEstimatedArrival(order.address),
        statusHistory: JSON.stringify([
          {
            status: 'ORDER_CONFIRMED',
            timestamp: new Date().toISOString(),
            note: 'Tracking initiated'
          }
        ])
      },
      include: {
        order: true,
        driver: true,
        route: true
      }
    })

    return NextResponse.json(tracking, { status: 201 })
  } catch (error) {
    console.error('Error creating tracking:', error)
    return NextResponse.json(
      { error: 'Failed to create tracking' },
      { status: 500 }
    )
  }
}

// Helper functions
function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function calculateEstimatedArrival(address: string): Date {
  const now = new Date()
  const estimatedMinutes = 45 + Math.floor(Math.random() * 30) // 45-75 minutes
  now.setMinutes(now.getMinutes() + estimatedMinutes)
  return now
}

function calculateETA(lat: number, lng: number, address: string): string {
  // Simplified ETA calculation - in production, use real routing API
  const distance = Math.random() * 10 + 2 // 2-12 km
  const speed = 25 // km/h average speed in city
  const etaMinutes = Math.round((distance / speed) * 60)
  
  const eta = new Date()
  eta.setMinutes(eta.getMinutes() + etaMinutes)
  
  return eta.toISOString()
}