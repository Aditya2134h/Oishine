'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreHorizontal, MapPin, Clock, Fuel, TrendingUp, Play, Pause, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'

interface DeliveryRoute {
  id: string
  driverId: string
  driver: {
    id: string
    name: string
    phone: string
    vehicleType: string
    vehicleNumber: string
  }
  date: string
  startTime?: string
  endTime?: string
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  totalDistance?: number
  estimatedTime?: number
  actualTime?: number
  fuelCost?: number
  optimizationScore?: number
  routeOrders: Array<{
    id: string
    orderId: string
    order: {
      id: string
      total: number
      status: string
      name: string
      phone: string
      address: string
    }
    sequence: number
    status: string
    estimatedArrival?: string
  }>
  _count: {
    routeOrders: number
  }
}

interface Order {
  id: string
  total: number
  status: string
  name: string
  phone: string
  address: string
  createdAt: string
}

interface Driver {
  id: string
  name: string
  phone: string
  vehicleType: string
  vehicleNumber: string
  status: string
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })

  const [formData, setFormData] = useState({
    driverId: '',
    date: new Date().toISOString().split('T')[0],
    orderIds: [] as string[],
    optimizeRoute: true
  })

  const fetchRoutes = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(dateFilter && { date: dateFilter })
      })

      const response = await fetch(`/api/routes?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRoutes(data.routes)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching routes:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch routes',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers?status=AVAILABLE')
      if (response.ok) {
        const data = await response.json()
        setDrivers(data.drivers)
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders?status=CONFIRMED&status=PREPARING&status=READY_FOR_PICKUP')
      if (response.ok) {
        const data = await response.json()
        setPendingOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error)
    }
  }

  useEffect(() => {
    fetchRoutes()
    fetchDrivers()
    fetchPendingOrders()
  }, [pagination.page, searchTerm, statusFilter, dateFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Route created successfully'
        })
        setIsCreateDialogOpen(false)
        setFormData({
          driverId: '',
          date: new Date().toISOString().split('T')[0],
          orderIds: [],
          optimizeRoute: true
        })
        fetchRoutes()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create route',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error creating route:', error)
      toast({
        title: 'Error',
        description: 'Failed to create route',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateRouteStatus = async (routeId: string, status: string) => {
    try {
      const response = await fetch(`/api/routes/${routeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status,
          startTime: status === 'ACTIVE' ? new Date().toISOString() : undefined,
          endTime: status === 'COMPLETED' ? new Date().toISOString() : undefined
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Route ${status.toLowerCase()}`
        })
        fetchRoutes()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update route status',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error updating route status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update route status',
        variant: 'destructive'
      })
    }
  }

  const optimizeRoute = async (routeId: string) => {
    try {
      const response = await fetch(`/api/routes/${routeId}/optimize`, {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Route optimized successfully'
        })
        fetchRoutes()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to optimize route',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error optimizing route:', error)
      toast({
        title: 'Error',
        description: 'Failed to optimize route',
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800'
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return <Clock className="h-3 w-3" />
      case 'ACTIVE':
        return <Play className="h-3 w-3" />
      case 'COMPLETED':
        return <CheckCircle className="h-3 w-3" />
      case 'CANCELLED':
        return <XCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
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
                <h1 className="ml-3 text-xl font-semibold text-gray-900">Route Optimization</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground">Manage and optimize delivery routes</p>
            </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Route
                </Button>
              </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Route</DialogTitle>
              <DialogDescription>
                Create a new delivery route and optimize it for efficiency.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="driver">Driver *</Label>
                  <Select value={formData.driverId} onValueChange={(value) => setFormData({ ...formData, driverId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} - {driver.vehicleType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Orders *</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="flex items-center space-x-2 p-2">
                        <Checkbox
                          id={order.id}
                          checked={formData.orderIds.includes(order.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                orderIds: [...formData.orderIds, order.id]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                orderIds: formData.orderIds.filter(id => id !== order.id)
                              })
                            }
                          }}
                        />
                        <Label htmlFor={order.id} className="text-sm">
                          {order.name} - {order.address} (Rp {order.total.toLocaleString()})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="optimize"
                    checked={formData.optimizeRoute}
                    onCheckedChange={(checked) => setFormData({ ...formData, optimizeRoute: !!checked })}
                  />
                  <Label htmlFor="optimize">Optimize route automatically</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || formData.orderIds.length === 0}>
                  {isSubmitting ? 'Creating...' : 'Create Route'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.filter(r => r.status === 'ACTIVE').length}</div>
            <p className="text-xs text-muted-foreground">
              {routes.filter(r => r.status === 'PLANNED').length} planned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Distance</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routes.filter(r => r.totalDistance).length > 0 
                ? (routes.filter(r => r.totalDistance).reduce((sum, r) => sum + (r.totalDistance || 0), 0) / routes.filter(r => r.totalDistance).length).toFixed(1)
                : '0'
              } km
            </div>
            <p className="text-xs text-muted-foreground">Per route</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routes.filter(r => r.estimatedTime).length > 0 
                ? Math.round(routes.filter(r => r.estimatedTime).reduce((sum, r) => sum + (r.estimatedTime || 0), 0) / routes.filter(r => r.estimatedTime).length)
                : '0'
              } min
            </div>
            <p className="text-xs text-muted-foreground">Estimated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routes.filter(r => r.optimizationScore).length > 0 
                ? Math.round(routes.filter(r => r.optimizationScore).reduce((sum, r) => sum + (r.optimizationScore || 0), 0) / routes.filter(r => r.optimizationScore).length)
                : '0'
              }%
            </div>
            <p className="text-xs text-muted-foreground">Avg score</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PLANNED">Planned</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-[180px]"
        />
      </div>

      {/* Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Routes</CardTitle>
          <CardDescription>
            Manage and optimize your delivery routes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading routes...</div>
          ) : routes.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No routes found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating your first route.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Route</th>
                    <th className="text-left p-4">Driver</th>
                    <th className="text-left p-4">Orders</th>
                    <th className="text-left p-4">Distance</th>
                    <th className="text-left p-4">Time</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route) => (
                    <tr key={route.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">Route #{route.id.slice(-6)}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(route.date).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`/avatars/${route.driver.id}.jpg`} />
                            <AvatarFallback>{route.driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{route.driver.name}</div>
                            <div className="text-sm text-muted-foreground">{route.driver.vehicleType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{route._count.routeOrders} orders</div>
                          <div className="text-sm text-muted-foreground">
                            Rp {route.routeOrders.reduce((sum, ro) => sum + ro.order.total, 0).toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span className="font-medium">{route.totalDistance || 0} km</span>
                        </div>
                        {route.fuelCost && (
                          <div className="text-sm text-muted-foreground">
                            Fuel: Rp {route.fuelCost.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">{route.estimatedTime || 0} min</span>
                        </div>
                        {route.actualTime && (
                          <div className="text-sm text-muted-foreground">
                            Actual: {route.actualTime} min
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(route.status)}>
                          {getStatusIcon(route.status)} {route.status}
                        </Badge>
                        {route.optimizationScore && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Score: {route.optimizationScore}%
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {route.status === 'PLANNED' && (
                              <>
                                <DropdownMenuItem onClick={() => updateRouteStatus(route.id, 'ACTIVE')}>
                                  <Play className="mr-2 h-4 w-4" />
                                  Start Route
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => optimizeRoute(route.id)}>
                                  <TrendingUp className="mr-2 h-4 w-4" />
                                  Optimize Route
                                </DropdownMenuItem>
                              </>
                            )}
                            {route.status === 'ACTIVE' && (
                              <DropdownMenuItem onClick={() => updateRouteStatus(route.id, 'COMPLETED')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Complete Route
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                              <a href={`/admin/routes/${route.id}`}>
                                <MapPin className="mr-2 h-4 w-4" />
                                View Details
                              </a>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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