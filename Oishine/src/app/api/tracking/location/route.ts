import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      trackingId,
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      batteryLevel,
      notes
    } = body

    // Validate required fields
    if (!trackingId || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields: trackingId, latitude, longitude' },
        { status: 400 }
      )
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    // Check if tracking exists
    const tracking = await db.deliveryTracking.findUnique({
      where: { id: trackingId }
    })

    if (!tracking) {
      return NextResponse.json(
        { error: 'Tracking not found' },
        { status: 404 }
      )
    }

    // Reverse geocoding to get address (mock implementation)
    const address = await reverseGeocode(latitude, longitude)

    // Create location update
    const locationUpdate = await db.locationUpdate.create({
      data: {
        trackingId,
        latitude,
        longitude,
        accuracy,
        speed,
        heading,
        batteryLevel,
        address,
        notes
      }
    })

    // Update tracking with current location
    await db.deliveryTracking.update({
      where: { id: trackingId },
      data: {
        currentLat: latitude,
        currentLng: longitude,
        lastUpdate: new Date()
      }
    })

    // Update ETA based on new location
    const newETA = calculateUpdatedETA(tracking.orderId, latitude, longitude)
    
    if (newETA) {
      await db.deliveryTracking.update({
        where: { id: trackingId },
        data: {
          estimatedArrival: newETA
        }
      })
    }

    // Check if driver is near destination
    const isNearDestination = await checkProximityToDestination(
      latitude, 
      longitude, 
      tracking.orderId
    )

    // Update order status if near destination
    if (isNearDestination) {
      await db.order.update({
        where: { id: tracking.orderId },
        data: { status: 'DELIVERING' }
      })

      // Add status history
      const statusHistory = JSON.parse(tracking.statusHistory || '[]')
      statusHistory.push({
        status: 'NEAR_DESTINATION',
        timestamp: new Date().toISOString(),
        note: 'Driver is near delivery location'
      })

      await db.deliveryTracking.update({
        where: { id: trackingId },
        data: {
          statusHistory: JSON.stringify(statusHistory)
        }
      })
    }

    return NextResponse.json({
      locationUpdate,
      eta: newETA,
      isNearDestination
    })
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingId = searchParams.get('trackingId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!trackingId) {
      return NextResponse.json(
        { error: 'Tracking ID is required' },
        { status: 400 }
      )
    }

    const locationUpdates = await db.locationUpdate.findMany({
      where: { trackingId },
      orderBy: { timestamp: 'desc' },
      take: limit
    })

    return NextResponse.json({ locationUpdates })
  } catch (error) {
    console.error('Error fetching location updates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch location updates' },
      { status: 500 }
    )
  }
}

// Helper functions
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // Mock implementation - in production, use real geocoding API
  const addresses = [
    `Jl. Sudirman No. ${Math.floor(Math.random() * 100)}, Jakarta Pusat`,
    `Jl. Thamrin No. ${Math.floor(Math.random() * 100)}, Jakarta Pusat`,
    `Jl. Gatot Subroto No. ${Math.floor(Math.random() * 100)}, Jakarta Selatan`,
    `Jl. Rasuna Said No. ${Math.floor(Math.random() * 100)}, Jakarta Selatan`
  ]
  
  return addresses[Math.floor(Math.random() * addresses.length)]
}

async function calculateUpdatedETA(orderId: string, currentLat: number, currentLng: number): Promise<Date | null> {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { address: true }
    })

    if (!order) return null

    // Mock destination coordinates
    const destLat = -6.2088 + (Math.random() * 0.1)
    const destLng = 106.8456 + (Math.random() * 0.1)

    // Calculate distance
    const distance = calculateDistance(currentLat, currentLng, destLat, destLng)
    const speed = 25 // km/h average speed
    const etaMinutes = Math.round((distance / speed) * 60)

    const eta = new Date()
    eta.setMinutes(eta.getMinutes() + etaMinutes)
    
    return eta
  } catch (error) {
    console.error('Error calculating ETA:', error)
    return null
  }
}

async function checkProximityToDestination(
  currentLat: number, 
  currentLng: number, 
  orderId: string
): Promise<boolean> {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { address: true }
    })

    if (!order) return false

    // Mock destination coordinates
    const destLat = -6.2088 + (Math.random() * 0.1)
    const destLng = 106.8456 + (Math.random() * 0.1)

    // Calculate distance
    const distance = calculateDistance(currentLat, currentLng, destLat, destLng)
    
    // Consider "near" if within 500 meters
    return distance <= 0.5
  } catch (error) {
    console.error('Error checking proximity:', error)
    return false
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}