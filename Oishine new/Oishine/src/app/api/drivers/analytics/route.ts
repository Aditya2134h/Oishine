import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    startDate.setDate(now.getDate() - parseInt(period))

    // Get driver analytics
    const [
      totalDrivers,
      activeDrivers,
      availableDrivers,
      busyDrivers,
      offlineDrivers,
      driverStats,
      topPerformers
    ] = await Promise.all([
      // Total drivers
      db.driver.count(),
      
      // Active drivers
      db.driver.count({
        where: { isActive: true }
      }),
      
      // Available drivers
      db.driver.count({
        where: { status: 'AVAILABLE', isActive: true }
      }),
      
      // Busy drivers
      db.driver.count({
        where: { status: 'BUSY', isActive: true }
      }),
      
      // Offline drivers
      db.driver.count({
        where: { status: 'OFFLINE', isActive: true }
      }),
      
      // Driver statistics
      db.driver.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          status: true,
          totalOrders: true,
          rating: true,
          createdAt: true,
          _count: {
            select: {
              orders: {
                where: {
                  createdAt: {
                    gte: startDate
                  }
                }
              }
            }
          }
        }
      }),
      
      // Top performers
      db.driver.findMany({
        where: { 
          isActive: true,
          orders: {
            some: {
              createdAt: {
                gte: startDate
              }
            }
          }
        },
        select: {
          id: true,
          name: true,
          totalOrders: true,
          rating: true,
          _count: {
            select: {
              orders: {
                where: {
                  createdAt: {
                    gte: startDate
                  }
                }
              }
            }
          }
        },
        orderBy: {
          orders: {
            _count: 'desc'
          }
        },
        take: 5
      })
    ])

    // Calculate performance metrics
    const avgOrdersPerDriver = driverStats.length > 0 
      ? driverStats.reduce((sum, driver) => sum + driver._count.orders, 0) / driverStats.length 
      : 0

    const avgRating = driverStats.filter(d => d.rating).length > 0
      ? driverStats.filter(d => d.rating).reduce((sum, driver) => sum + driver.rating!, 0) / driverStats.filter(d => d.rating).length
      : 0

    // Status distribution
    const statusDistribution = [
      { status: 'AVAILABLE', count: availableDrivers, percentage: (availableDrivers / activeDrivers) * 100 },
      { status: 'BUSY', count: busyDrivers, percentage: (busyDrivers / activeDrivers) * 100 },
      { status: 'OFFLINE', count: offlineDrivers, percentage: (offlineDrivers / activeDrivers) * 100 },
      { status: 'ON_BREAK', count: activeDrivers - availableDrivers - busyDrivers - offlineDrivers, percentage: ((activeDrivers - availableDrivers - busyDrivers - offlineDrivers) / activeDrivers) * 100 }
    ]

    return NextResponse.json({
      summary: {
        totalDrivers,
        activeDrivers,
        availableDrivers,
        busyDrivers,
        offlineDrivers,
        avgOrdersPerDriver: Math.round(avgOrdersPerDriver * 100) / 100,
        avgRating: Math.round(avgRating * 100) / 100
      },
      statusDistribution,
      topPerformers: topPerformers.map(driver => ({
        id: driver.id,
        name: driver.name,
        orders: driver._count.orders,
        totalOrders: driver.totalOrders,
        rating: driver.rating || 0
      })),
      driverStats: driverStats.map(driver => ({
        id: driver.id,
        name: driver.name,
        status: driver.status,
        totalOrders: driver.totalOrders,
        recentOrders: driver._count.orders,
        rating: driver.rating || 0,
        joinDate: driver.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching driver analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch driver analytics' },
      { status: 500 }
    )
  }
}