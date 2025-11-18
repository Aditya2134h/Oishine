import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d, 1y
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    let dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else {
      const now = new Date()
      let daysAgo = 7
      if (period === '30d') daysAgo = 30
      else if (period === '90d') daysAgo = 90
      else if (period === '1y') daysAgo = 365
      
      dateFilter = {
        gte: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
        lte: now
      }
    }

    // Get orders in date range
    const orders = await db.order.findMany({
      where: {
        createdAt: dateFilter
      },
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

    // Calculate basic metrics
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalProfit = Math.round(totalRevenue * 0.3) // Assuming 30% profit margin
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get product performance
    const productSales: { [key: string]: any } = {}
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId
        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            name: item.product.name,
            image: item.product.image,
            totalOrders: 0,
            totalRevenue: 0,
            quantity: 0
          }
        }
        productSales[productId].totalOrders += 1
        productSales[productId].totalRevenue += item.price * item.quantity
        productSales[productId].quantity += item.quantity
      })
    })

    // Sort products by revenue
    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    // Get category performance
    const categorySales: { [key: string]: any } = {}
    orders.forEach(order => {
      order.items.forEach(item => {
        const categoryName = item.product.category?.name || 'Unknown'
        if (!categorySales[categoryName]) {
          categorySales[categoryName] = {
            name: categoryName,
            totalOrders: 0,
            totalRevenue: 0,
            quantity: 0
          }
        }
        categorySales[categoryName].totalOrders += 1
        categorySales[categoryName].totalRevenue += item.price * item.quantity
        categorySales[categoryName].quantity += item.quantity
      })
    })

    // Get daily sales data
    const dailySales: { [key: string]: any } = {}
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0]
      if (!dailySales[date]) {
        dailySales[date] = {
          date,
          orders: 0,
          revenue: 0,
          profit: 0
        }
      }
      dailySales[date].orders += 1
      dailySales[date].revenue += order.total
      dailySales[date].profit += Math.round(order.total * 0.3)
    })

    // Get payment method breakdown
    const paymentMethods: { [key: string]: any } = {}
    orders.forEach(order => {
      const method = order.paymentMethod || 'Unknown'
      if (!paymentMethods[method]) {
        paymentMethods[method] = {
          method,
          count: 0,
          revenue: 0
        }
      }
      paymentMethods[method].count += 1
      paymentMethods[method].revenue += order.total
    })

    // Get delivery type breakdown
    const deliveryTypes: { [key: string]: any } = {}
    orders.forEach(order => {
      const type = order.deliveryType || 'Unknown'
      if (!deliveryTypes[type]) {
        deliveryTypes[type] = {
          type,
          count: 0,
          revenue: 0
        }
      }
      deliveryTypes[type].count += 1
      deliveryTypes[type].revenue += order.total
    })

    // Get customer analytics
    const uniqueCustomers = new Set(orders.map(order => order.email)).size
    const returningCustomers = orders.filter(order => 
      orders.filter(o => o.email === order.email).length > 1
    ).length

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalOrders,
          totalRevenue,
          totalProfit,
          avgOrderValue: Math.round(avgOrderValue),
          uniqueCustomers,
          returningCustomers
        },
        topProducts,
        categorySales: Object.values(categorySales),
        dailySales: Object.values(dailySales).sort((a, b) => a.date.localeCompare(b.date)),
        paymentMethods: Object.values(paymentMethods),
        deliveryTypes: Object.values(deliveryTypes),
        period,
        dateRange: dateFilter
      }
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics data'
    }, { status: 500 })
  }
}