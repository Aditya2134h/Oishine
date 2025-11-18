'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  MapPin, 
  Clock, 
  Phone, 
  Package, 
  CheckCircle, 
  Circle,
  Truck,
  ChefHat,
  Home,
  Navigation,
  Star,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

interface LocationUpdate {
  id: string
  latitude: number
  longitude: number
  address: string
  timestamp: string
  speed?: number
  batteryLevel?: number
}

interface TrackingData {
  id: string
  orderId: string
  shareCode: string
  currentLat?: number
  currentLng?: number
  lastUpdate: string
  estimatedArrival?: string
  actualArrival?: string
  statusHistory: string
  order: {
    id: string
    total: number
    status: string
    name: string
    phone: string
    address: string
    createdAt: string
    items: Array<{
      product: {
        id: string
        name: string
        image: string
      }
    }>
  }
  driver?: {
    id: string
    name: string
    phone: string
    vehicleType: string
    vehicleNumber: string
    rating?: number
  }
  locationUpdates: LocationUpdate[]
  eta?: string
}

export default function TrackingPage() {
  const params = useParams()
  const router = useRouter()
  const [tracking, setTracking] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTracking = async () => {
    try {
      const response = await fetch(`/api/tracking?shareCode=${params.code}`)
      
      if (response.status === 404) {
        setError('Tracking code not found')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch tracking data')
      }
      
      const data = await response.json()
      setTracking(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching tracking:', error)
      setError('Failed to load tracking information')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (params.code) {
      fetchTracking()
    }
  }, [params.code])

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (tracking && tracking.order.status !== 'COMPLETED') {
        fetchTracking()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [params.code, tracking?.order.status])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchTracking()
  }

  const getStatusHistory = () => {
    if (!tracking) return []
    return JSON.parse(tracking.statusHistory || '[]')
  }

  const getCurrentStatus = () => {
    const history = getStatusHistory()
    return history[history.length - 1]?.status || 'ORDER_CONFIRMED'
  }

  const getProgressPercentage = () => {
    const status = getCurrentStatus()
    const statusProgress: { [key: string]: number } = {
      'ORDER_CONFIRMED': 20,
      'PREPARING': 40,
      'READY_FOR_PICKUP': 60,
      'OUT_FOR_DELIVERY': 80,
      'NEAR_DESTINATION': 90,
      'DELIVERED': 100,
      'FAILED': 0
    }
    return statusProgress[status] || 0
  }

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'ORDER_CONFIRMED': <Circle className="h-4 w-4" />,
      'PREPARING': <ChefHat className="h-4 w-4" />,
      'READY_FOR_PICKUP': <Package className="h-4 w-4" />,
      'OUT_FOR_DELIVERY': <Truck className="h-4 w-4" />,
      'NEAR_DESTINATION': <Navigation className="h-4 w-4" />,
      'DELIVERED': <CheckCircle className="h-4 w-4" />,
      'FAILED': <Circle className="h-4 w-4" />
    }
    return icons[status] || <Circle className="h-4 w-4" />
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'ORDER_CONFIRMED': 'bg-gray-100 text-gray-800',
      'PREPARING': 'bg-blue-100 text-blue-800',
      'READY_FOR_PICKUP': 'bg-yellow-100 text-yellow-800',
      'OUT_FOR_DELIVERY': 'bg-green-100 text-green-800',
      'NEAR_DESTINATION': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-emerald-100 text-emerald-800',
      'FAILED': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle>Tracking Not Found</CardTitle>
            <CardDescription>
              The tracking code you entered is not valid. Please check the code and try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tracking) return null

  const statusHistory = getStatusHistory()
  const currentStatus = getCurrentStatus()
  const progressPercentage = getProgressPercentage()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O!</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Oishine Delivery Tracking</h1>
                <p className="text-sm text-gray-600">Order #{tracking.orderId.slice(-8)}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Delivery Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(currentStatus)}>
                  {getStatusIcon(currentStatus)} {currentStatus.replace(/_/g, ' ')}
                </Badge>
                <span className="text-sm text-gray-600">
                  {progressPercentage}% Complete
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              
              {/* Status Timeline */}
              <div className="space-y-3 mt-6">
                {statusHistory.map((item: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {item.status.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatTime(item.timestamp)} - {formatDate(item.timestamp)}
                      </p>
                      {item.note && (
                        <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Customer</p>
                <p className="text-sm text-gray-600">{tracking.order.name}</p>
                <p className="text-sm text-gray-600">{tracking.order.phone}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-gray-900">Delivery Address</p>
                <p className="text-sm text-gray-600">{tracking.order.address}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-gray-900">Order Items</p>
                <div className="space-y-2 mt-2">
                  {tracking.order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.product.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">Total Amount</p>
                <p className="text-lg font-bold text-red-600">
                  Rp {tracking.order.total.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Driver & ETA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Driver Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tracking.driver ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold">
                        {tracking.driver.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{tracking.driver.name}</p>
                      <p className="text-sm text-gray-600">{tracking.driver.vehicleType}</p>
                      <p className="text-sm text-gray-600">{tracking.driver.vehicleNumber}</p>
                      {tracking.driver.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{tracking.driver.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <Button variant="outline" size="sm" className="flex-1">
                      Contact Driver
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <Truck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Driver assigned soon</p>
                </div>
              )}
              
              <Separator />
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-900">Estimated Arrival</p>
                </div>
                {tracking.estimatedArrival ? (
                  <div>
                    <p className="text-lg font-bold text-red-600">
                      {formatTime(tracking.estimatedArrival)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDate(tracking.estimatedArrival)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Calculating...</p>
                )}
              </div>
              
              {tracking.actualArrival && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <p className="text-sm font-medium text-gray-900">Delivered At</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {formatTime(tracking.actualArrival)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(tracking.actualArrival)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Location Map Placeholder */}
        {tracking.currentLat && tracking.currentLng && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Live Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Live tracking map</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {formatTime(tracking.lastUpdate)}
                  </p>
                </div>
              </div>
              {tracking.locationUpdates.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Recent Location Updates</p>
                  <div className="space-y-2">
                    {tracking.locationUpdates.slice(0, 3).map((update) => (
                      <div key={update.id} className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{update.address}</span>
                        <span>• {formatTime(update.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}