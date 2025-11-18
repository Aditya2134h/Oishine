import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to calculate date ranges
function getDateRange(period: string) {
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }
  
  return { startDate, endDate: now };
}

// Helper function to calculate profit metrics
function calculateProfitMetrics(
  revenue: number,
  costs: {
    ingredientCost: number;
    packagingCost: number;
    deliveryCost: number;
    operationalCost: number;
    marketingCost: number;
  }
) {
  const totalCosts = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
  const grossProfit = revenue - costs.ingredientCost - costs.packagingCost;
  const operatingProfit = grossProfit - costs.deliveryCost - costs.operationalCost;
  const netProfit = operatingProfit - costs.marketingCost;
  
  return {
    revenue,
    totalCosts,
    grossProfit,
    operatingProfit,
    netProfit,
    grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    operatingMargin: revenue > 0 ? (operatingProfit / revenue) * 100 : 0,
    netMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
    costs
  };
}

// GET - Get comprehensive profit analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let dateRange;
    if (startDate && endDate) {
      dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
    } else {
      dateRange = getDateRange(period);
    }

    // Fetch orders within date range
    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        },
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Fetch store settings for cost calculations
    const storeSettings = await db.storeSettings.findFirst();
    
    // Calculate basic metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate costs (using industry averages and configurable rates)
    const baseCosts = {
      ingredientCost: totalRevenue * 0.35, // 35% for ingredients
      packagingCost: totalRevenue * 0.08, // 8% for packaging
      deliveryCost: orders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0),
      operationalCost: totalRevenue * 0.15, // 15% for operations (rent, utilities, etc.)
      marketingCost: totalRevenue * 0.05 // 5% for marketing
    };

    // Calculate profit metrics
    const profitMetrics = calculateProfitMetrics(totalRevenue, baseCosts);

    // Product profitability analysis
    const productProfitability = new Map();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId;
        const product = item.product;
        
        if (!productProfitability.has(productId)) {
          productProfitability.set(productId, {
            id: productId,
            name: product.name,
            price: item.price,
            quantity: 0,
            revenue: 0,
            ingredientCost: 0,
            packagingCost: 0,
            profit: 0,
            margin: 0,
            orders: 0
          });
        }
        
        const productData = productProfitability.get(productId);
        const itemRevenue = item.price * item.quantity;
        const itemIngredientCost = itemRevenue * 0.35;
        const itemPackagingCost = itemRevenue * 0.08;
        const itemProfit = itemRevenue - itemIngredientCost - itemPackagingCost;
        
        productData.quantity += item.quantity;
        productData.revenue += itemRevenue;
        productData.ingredientCost += itemIngredientCost;
        productData.packagingCost += itemPackagingCost;
        productData.profit += itemProfit;
        productData.orders += 1;
      });
    });

    // Calculate margins for products
    productProfitability.forEach(product => {
      product.margin = product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0;
    });

    // Sort products by profit
    const topProducts = Array.from(productProfitability.values())
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    const worstProducts = Array.from(productProfitability.values())
      .sort((a, b) => a.profit - b.profit)
      .slice(0, 10);

    // Daily profit trend
    const dailyTrend = new Map();
    
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      
      if (!dailyTrend.has(date)) {
        dailyTrend.set(date, {
          date,
          revenue: 0,
          orders: 0,
          costs: {
            ingredientCost: 0,
            packagingCost: 0,
            deliveryCost: 0,
            operationalCost: 0,
            marketingCost: 0
          }
        });
      }
      
      const dayData = dailyTrend.get(date);
      dayData.revenue += order.total;
      dayData.orders += 1;
      dayData.costs.deliveryCost += order.deliveryFee || 0;
    });

    // Calculate daily costs and profits
    dailyTrend.forEach(dayData => {
      dayData.costs.ingredientCost = dayData.revenue * 0.35;
      dayData.costs.packagingCost = dayData.revenue * 0.08;
      dayData.costs.operationalCost = dayData.revenue * 0.15;
      dayData.costs.marketingCost = dayData.revenue * 0.05;
      
      const totalCosts = Object.values(dayData.costs).reduce((sum, cost) => sum + cost, 0);
      dayData.profit = dayData.revenue - totalCosts;
      dayData.margin = dayData.revenue > 0 ? (dayData.profit / dayData.revenue) * 100 : 0;
    });

    // Payment method profitability
    const paymentMethodAnalysis = new Map();
    
    orders.forEach(order => {
      const paymentMethod = order.paymentMethod || 'Unknown';
      
      if (!paymentMethodAnalysis.has(paymentMethod)) {
        paymentMethodAnalysis.set(paymentMethod, {
          method: paymentMethod,
          revenue: 0,
          orders: 0,
          costs: 0,
          profit: 0,
          margin: 0
        });
      }
      
      const methodData = paymentMethodAnalysis.get(paymentMethod);
      methodData.revenue += order.total;
      methodData.orders += 1;
    });

    // Calculate payment method costs and profits
    paymentMethodAnalysis.forEach(methodData => {
      methodData.costs = methodData.revenue * 0.63; // Total cost percentage
      methodData.profit = methodData.revenue - methodData.costs;
      methodData.margin = methodData.revenue > 0 ? (methodData.profit / methodData.revenue) * 100 : 0;
    });

    // Hourly profit analysis
    const hourlyAnalysis = new Map();
    
    orders.forEach(order => {
      const hour = order.createdAt.getHours();
      
      if (!hourlyAnalysis.has(hour)) {
        hourlyAnalysis.set(hour, {
          hour,
          revenue: 0,
          orders: 0,
          profit: 0
        });
      }
      
      const hourData = hourlyAnalysis.get(hour);
      hourData.revenue += order.total;
      hourData.orders += 1;
    });

    // Calculate hourly profits
    hourlyAnalysis.forEach(hourData => {
      const costs = hourData.revenue * 0.63;
      hourData.profit = hourData.revenue - costs;
    });

    return NextResponse.json({
      success: true,
      data: {
        period,
        dateRange: {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString()
        },
        summary: {
          totalRevenue: profitMetrics.revenue,
          totalOrders,
          averageOrderValue,
          totalCosts: profitMetrics.totalCosts,
          grossProfit: profitMetrics.grossProfit,
          operatingProfit: profitMetrics.operatingProfit,
          netProfit: profitMetrics.netProfit,
          grossMargin: profitMetrics.grossMargin,
          operatingMargin: profitMetrics.operatingMargin,
          netMargin: profitMetrics.netMargin
        },
        costs: profitMetrics.costs,
        topProducts,
        worstProducts,
        dailyTrend: Array.from(dailyTrend.values()).sort((a, b) => a.date.localeCompare(b.date)),
        paymentMethods: Array.from(paymentMethodAnalysis.values()),
        hourlyAnalysis: Array.from(hourlyAnalysis.values()).sort((a, b) => a.hour - b.hour)
      }
    });
  } catch (error) {
    console.error('Error generating profit analysis:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate profit analysis' },
      { status: 500 }
    );
  }
}