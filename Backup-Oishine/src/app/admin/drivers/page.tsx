'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreHorizontal, User, Phone, Mail, Star, AlertCircle, BarChart3, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import AdminAuthWrapper from '@/components/admin-auth-wrapper'

interface Driver {
  id: string
  name: string
  phone: string
  email?: string
  licenseNumber: string
  vehicleType: string
  vehicleNumber: string
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ON_BREAK'
  totalOrders: number
  rating?: number
  isActive: boolean
  createdAt: string
  _count: {
    orders: number
  }
}

interface DriverFormData {
  name: string
  phone: string
  email: string
  licenseNumber: string
  vehicleType: string
  vehicleNumber: string
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })

  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    vehicleType: '',
    vehicleNumber: ''
  })

  const fetchDrivers = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/drivers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDrivers(data.drivers)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch drivers',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [pagination.page, searchTerm, statusFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Driver created successfully'
        })
        setIsCreateDialogOpen(false)
        setFormData({
          name: '',
          phone: '',
          email: '',
          licenseNumber: '',
          vehicleType: '',
          vehicleNumber: ''
        })
        fetchDrivers()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create driver',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error creating driver:', error)
      toast({
        title: 'Error',
        description: 'Failed to create driver',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateDriverStatus = async (driverId: string, status: string) => {
    try {
      const response = await fetch(`/api/drivers/${driverId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Driver status updated'
        })
        fetchDrivers()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update driver status',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error updating driver status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update driver status',
        variant: 'destructive'
      })
    }
  }

  const toggleDriverActive = async (driverId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Driver ${!isActive ? 'activated' : 'deactivated'}`
        })
        fetchDrivers()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update driver',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error updating driver:', error)
      toast({
        title: 'Error',
        description: 'Failed to update driver',
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800'
      case 'BUSY':
        return 'bg-yellow-100 text-yellow-800'
      case 'OFFLINE':
        return 'bg-gray-100 text-gray-800'
      case 'ON_BREAK':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '✓'
      case 'BUSY':
        return '⏳'
      case 'OFFLINE':
        return '○'
      case 'ON_BREAK':
        return '☕'
      default:
        return '○'
    }
  }

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0 flex-1">
              <a href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 shrink-0">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
                <span className="sm:hidden">←</span>
              </a>
              <div className="flex items-center ml-2 sm:ml-4 min-w-0 flex-1">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 shrink-0" />
                <h1 className="ml-2 sm:ml-3 text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Driver Management
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Manage delivery drivers and their assignments</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button variant="outline" asChild className="w-full sm:w-auto text-xs sm:text-sm">
                <a href="/admin/drivers/analytics">
                  <BarChart3 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">📊</span>
                </a>
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto text-xs sm:text-sm">
                    <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Add Driver
                  </Button>
                </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
                <DialogDescription>
                  Create a new driver account for the delivery team.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="licenseNumber">License Number *</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vehicleType">Vehicle Type *</Label>
                    <Select value={formData.vehicleType} onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="Car">Car</SelectItem>
                        <SelectItem value="Bicycle">Bicycle</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                    <Input
                      id="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Driver'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Drivers</CardTitle>
            <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{drivers.length}</div>
            <p className="text-xs text-muted-foreground">
              {drivers.filter(d => d.isActive).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Available</CardTitle>
            <div className="h-3 w-3 sm:h-4 sm:w-4 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{drivers.filter(d => d.status === 'AVAILABLE').length}</div>
            <p className="text-xs text-muted-foreground">Ready for delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Busy</CardTitle>
            <div className="h-3 w-3 sm:h-4 sm:w-4 bg-yellow-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{drivers.filter(d => d.status === 'BUSY').length}</div>
            <p className="text-xs text-muted-foreground">On delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {drivers.filter(d => d.rating).length > 0 
                ? (drivers.filter(d => d.rating).reduce((sum, d) => sum + d.rating!, 0) / drivers.filter(d => d.rating).length).toFixed(1)
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">Driver performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 sm:pl-10 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] text-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="BUSY">Busy</SelectItem>
            <SelectItem value="OFFLINE">Offline</SelectItem>
            <SelectItem value="ON_BREAK">On Break</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Drivers</CardTitle>
          <CardDescription>
            Manage your delivery team and track their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading drivers...</div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No drivers found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by adding your first driver.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Driver</th>
                    <th className="text-left p-4">Contact</th>
                    <th className="text-left p-4">Vehicle</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Performance</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`/avatars/${driver.id}.jpg`} />
                            <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{driver.name}</div>
                            <div className="text-sm text-muted-foreground">ID: {driver.licenseNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span className="text-sm">{driver.phone}</span>
                          </div>
                          {driver.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span className="text-sm">{driver.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{driver.vehicleType}</div>
                          <div className="text-sm text-muted-foreground">{driver.vehicleNumber}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(driver.status)}>
                          <span className="mr-1">{getStatusIcon(driver.status)}</span>
                          {driver.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{driver.rating?.toFixed(1) || 'N/A'}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {driver.totalOrders} orders
                          </div>
                        </div>
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
                            <DropdownMenuItem onClick={() => updateDriverStatus(driver.id, 'AVAILABLE')}>
                              Set Available
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateDriverStatus(driver.id, 'ON_BREAK')}>
                              Set On Break
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateDriverStatus(driver.id, 'OFFLINE')}>
                              Set Offline
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => toggleDriverActive(driver.id, driver.isActive)}
                              className={driver.isActive ? 'text-red-600' : 'text-green-600'}
                            >
                              {driver.isActive ? 'Deactivate' : 'Activate'}
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
    </AdminAuthWrapper>
  )
}