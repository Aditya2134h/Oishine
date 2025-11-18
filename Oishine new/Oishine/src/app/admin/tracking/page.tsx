'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Clock, User, Phone, Navigation, RefreshCw, Eye, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

interface TrackingData {
  id: string
  orderId: string
  order: {
    id: string
    customerName: string
    customerPhone: string
    customerAddress: string
    status: string
    total: number
    createdAt: string
  }
  driver?: {
    id: string
    name: string
    phone: string
    vehicleType: string
    vehicleNumber: string
  }
  currentLat?: number
  currentLng?: number
  estimatedArrival?: string
  actualArrival?: string
  trackingUrl?: string
  shareCode?: string
  lastUpdate: string
  statusHistory: any[]
  locationUpdates: any[]
}

export default function TrackingPage() {
  const [trackingData, setTrackingData] = useState<TrackingData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTracking, setSelectedTracking] = useState<TrackingData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const fetchTrackingData = async () => {
    try {
      const response = await fetch('/api/tracking')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTrackingData(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tracking data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrackingData()
  }, [])

  const filteredTracking = trackingData.filter(tracking => 
    tracking.order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tracking.order.customerPhone.includes(searchTerm) ||
    tracking.orderId.toLowerCase().includes(searchTerm) ||
    tracking.driver?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'PREPARING':
        return 'bg-yellow-100 text-yellow-800'
      case 'READY_FOR_PICKUP':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERING':
        return 'bg-orange-100 text-orange-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID')
  }

  const copyTrackingUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: 'Berhasil',
      description: 'Tracking URL disalin ke clipboard'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                Back
              </a>
              <div className="flex items-center ml-4">
                <MapPin className="w-6 h-6 text-gray-600" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">Delivery Tracking</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground">Monitor real-time delivery tracking</p>
            </div>
            <Button onClick={fetchTrackingData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer name, phone, order ID, or driver name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracking</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trackingData.length}</div>
            <p className="text-xs text-muted-foreground">Active deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivering</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trackingData.filter(t => t.order.status === 'DELIVERING').length}
            </div>
            <p className="text-xs text-muted-foreground">On the way</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="h-4 w-4 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trackingData.filter(t => t.order.status === 'COMPLETED').length}
            </div>
            <p className="text-xs text-muted-foreground">Delivered today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(trackingData.filter(t => t.driver).map(t => t.driver?.id)).size}
            </div>
            <p className="text-xs text-muted-foreground">Currently delivering</p>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Tracking</CardTitle>
          <CardDescription>
            Real-time tracking of all deliveries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading tracking data...</div>
          ) : filteredTracking.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No tracking data found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'No active deliveries at the moment'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Order</th>
                    <th className="text-left p-4">Customer</th>
                    <th className="text-left p-4">Driver</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Location</th>
                    <th className="text-left p-4">ETA</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTracking.map((tracking) => (
                    <tr key={tracking.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">#{tracking.orderId.slice(-8)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(tracking.order.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{tracking.order.customerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {tracking.order.customerPhone}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {tracking.order.customerAddress}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {tracking.driver ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/avatars/${tracking.driver.id}.jpg`} />
                              <AvatarFallback>
                                {tracking.driver.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{tracking.driver.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {tracking.driver.vehicleType} - {tracking.driver.vehicleNumber}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No driver assigned</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(tracking.order.status)}>
                          {tracking.order.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {tracking.currentLat && tracking.currentLng ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-green-500" />
                            <span>Live</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No location</span>
                        )}
                      </td>
                      <td className="p-4">
                        {tracking.estimatedArrival ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(tracking.estimatedArrival).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedTracking(tracking)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Tracking Details</DialogTitle>
                                <DialogDescription>
                                  Order #{selectedTracking?.orderId.slice(-8)}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedTracking && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Customer Information</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><strong>Name:</strong> {selectedTracking.order.customerName}</p>
                                        <p><strong>Phone:</strong> {selectedTracking.order.customerPhone}</p>
                                        <p><strong>Address:</strong> {selectedTracking.order.customerAddress}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Driver Information</h4>
                                      {selectedTracking.driver ? (
                                        <div className="space-y-1 text-sm">
                                          <p><strong>Name:</strong> {selectedTracking.driver.name}</p>
                                          <p><strong>Phone:</strong> {selectedTracking.driver.phone}</p>
                                          <p><strong>Vehicle:</strong> {selectedTracking.driver.vehicleType} - {selectedTracking.driver.vehicleNumber}</p>
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground">No driver assigned</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2">Tracking Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><strong>Tracking Code:</strong> {selectedTracking.shareCode || 'N/A'}</p>
                                      <p><strong>Last Update:</strong> {formatTime(selectedTracking.lastUpdate)}</p>
                                      <p><strong>Estimated Arrival:</strong> {selectedTracking.estimatedArrival ? formatTime(selectedTracking.estimatedArrival) : 'N/A'}</p>
                                      {selectedTracking.trackingUrl && (
                                        <div className="flex items-center gap-2">
                                          <strong>Tracking URL:</strong>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => copyTrackingUrl(selectedTracking.trackingUrl!)}
                                          >
                                            Copy URL
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">Location Updates</h4>
                                    <div className="max-h-40 overflow-y-auto">
                                      {selectedTracking.locationUpdates.length > 0 ? (
                                        <div className="space-y-2">
                                          {selectedTracking.locationUpdates.slice(-5).map((update, index) => (
                                            <div key={index} className="text-sm border-b pb-2">
                                              <p><strong>Time:</strong> {formatTime(update.timestamp)}</p>
                                              <p><strong>Location:</strong> {update.latitude.toFixed(6)}, {update.longitude.toFixed(6)}</p>
                                              {update.address && <p><strong>Address:</strong> {update.address}</p>}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground">No location updates yet</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </main>
    </div>
  )
}