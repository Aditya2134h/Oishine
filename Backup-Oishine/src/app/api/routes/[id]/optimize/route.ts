import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const route = await db.deliveryRoute.findUnique({
      where: { id: params.id },
      include: {
        routeOrders: {
          include: { order: true }
        }
      }
    })

    if (!route) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      )
    }

    // Get real-time traffic data (mock implementation)
    const trafficData = await getTrafficData()
    
    // Get weather data (mock implementation)
    const weatherData = await getWeatherData()

    // Optimize route with advanced algorithm
    const optimizedRoute = await advancedRouteOptimization(route, trafficData, weatherData)

    return NextResponse.json(optimizedRoute)
  } catch (error) {
    console.error('Error optimizing route:', error)
    return NextResponse.json(
      { error: 'Failed to optimize route' },
      { status: 500 }
    )
  }
}

// Advanced route optimization algorithm
async function advancedRouteOptimization(route: any, trafficData: any, weatherData: any) {
  const { routeOrders } = route
  
  // Calculate optimal order using Traveling Salesman Problem (TSP) approximation
  const optimizedOrders = await calculateOptimalSequence(routeOrders, trafficData)
  
  // Calculate detailed metrics
  const totalDistance = calculateTotalDistance(optimizedOrders)
  const estimatedTime = calculateEstimatedTime(optimizedOrders, trafficData, weatherData)
  const fuelCost = calculateFuelCost(totalDistance, route.driver?.vehicleType || 'Motorcycle')
  const optimizationScore = calculateOptimizationScore(optimizedOrders, totalDistance, estimatedTime)

  // Update route with optimized data
  const updatedRoute = await db.deliveryRoute.update({
    where: { id: route.id },
    data: {
      totalDistance,
      estimatedTime,
      fuelCost,
      optimizationScore,
      optimizedPath: JSON.stringify({
        waypoints: optimizedOrders.map((o: any) => ({
          orderId: o.orderId,
          address: o.order.address,
          sequence: o.sequence,
          estimatedArrival: o.estimatedArrival,
          coordinates: getCoordinates(o.order.address)
        })),
        totalDistance,
        estimatedTime,
        trafficConditions: trafficData,
        weatherConditions: weatherData
      }),
      trafficData: JSON.stringify(trafficData),
      weatherData: JSON.stringify(weatherData)
    },
    include: {
      driver: true,
      routeOrders: {
        include: { order: true },
        orderBy: { sequence: 'asc' }
      }
    }
  })

  // Update order sequences
  await Promise.all(optimizedOrders.map((order: any, index: number) =>
    db.deliveryRouteOrder.update({
      where: { id: order.id },
      data: { 
        sequence: index + 1,
        estimatedArrival: calculateArrivalTime(index, estimatedTime)
      }
    })
  ))

  return updatedRoute
}

// Calculate optimal sequence using nearest neighbor algorithm
async function calculateOptimalSequence(orders: any[], trafficData: any) {
  if (orders.length <= 1) return orders

  const unvisited = [...orders]
  const optimized = []
  let currentLocation = { lat: -6.2088, lng: 106.8456 } // Jakarta coordinates as starting point
  
  while (unvisited.length > 0) {
    let nearestIndex = 0
    let minDistance = Infinity
    
    for (let i = 0; i < unvisited.length; i++) {
      const orderLocation = getCoordinates(unvisited[i].order.address)
      const distance = calculateDistance(currentLocation, orderLocation)
      const trafficFactor = getTrafficFactor(currentLocation, orderLocation, trafficData)
      const adjustedDistance = distance * trafficFactor
      
      if (adjustedDistance < minDistance) {
        minDistance = adjustedDistance
        nearestIndex = i
      }
    }
    
    const nextOrder = unvisited.splice(nearestIndex, 1)[0]
    optimized.push(nextOrder)
    currentLocation = getCoordinates(nextOrder.order.address)
  }
  
  return optimized
}

// Helper functions
function getCoordinates(address: string) {
  // Mock coordinates - in production, use geocoding API
  const hash = address.length % 100
  return {
    lat: -6.2088 + (hash * 0.01),
    lng: 106.8456 + (hash * 0.01)
  }
}

function calculateDistance(point1: any, point2: any): number {
  // Haversine formula for calculating distance between two points
  const R = 6371 // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180
  const dLon = (point2.lng - point1.lng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function getTrafficFactor(from: any, to: any, trafficData: any): number {
  // Mock traffic factor - in production, use real traffic API
  const hour = new Date().getHours()
  if (hour >= 7 && hour <= 9) return 1.5 // Rush hour morning
  if (hour >= 17 && hour <= 19) return 1.8 // Rush hour evening
  return 1.0 // Normal traffic
}

function calculateTotalDistance(orders: any[]): number {
  let totalDistance = 0
  let currentLocation = { lat: -6.2088, lng: 106.8456 }
  
  for (const order of orders) {
    const orderLocation = getCoordinates(order.order.address)
    totalDistance += calculateDistance(currentLocation, orderLocation)
    currentLocation = orderLocation
  }
  
  // Add distance back to restaurant
  totalDistance += calculateDistance(currentLocation, { lat: -6.2088, lng: 106.8456 })
  
  return Math.round(totalDistance * 100) / 100
}

function calculateEstimatedTime(orders: any[], trafficData: any, weatherData: any): number {
  const baseTime = orders.length * 15 // 15 minutes per delivery
  const travelTime = calculateTotalDistance(orders) * 3 // 3 minutes per km
  const weatherFactor = weatherData.condition === 'rain' ? 1.3 : 1.0
  
  return Math.round((baseTime + travelTime) * weatherFactor)
}

function calculateFuelCost(distance: number, vehicleType: string): number {
  const fuelConsumption = {
    'Motorcycle': 0.025, // 25km/liter
    'Car': 0.08,        // 12.5km/liter
    'Van': 0.12,        // 8.3km/liter
    'Bicycle': 0        // No fuel
  }
  
  const fuelPrice = 10000 // IDR per liter
  const consumption = fuelConsumption[vehicleType as keyof typeof fuelConsumption] || 0.025
  
  return Math.round(distance * consumption * fuelPrice)
}

function calculateOptimizationScore(orders: any[], distance: number, time: number): number {
  const baseScore = 100
  const distancePenalty = Math.min(20, distance * 2)
  const timePenalty = Math.min(15, time * 0.1)
  
  return Math.max(60, Math.round(baseScore - distancePenalty - timePenalty))
}

function calculateArrivalTime(sequence: number, totalTime: number): Date {
  const now = new Date()
  const averageTimePerStop = totalTime / (sequence + 1)
  now.setMinutes(now.getMinutes() + (sequence * averageTimePerStop))
  return now
}

// Mock API calls (in production, use real APIs)
async function getTrafficData() {
  return {
    condition: 'moderate',
    congestion: 0.3,
    incidents: []
  }
}

async function getWeatherData() {
  return {
    condition: 'clear',
    temperature: 28,
    humidity: 70
  }
}