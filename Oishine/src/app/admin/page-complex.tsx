'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Users, 
  ShoppingCart,
  Package,
  Truck,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Store,
  ChefHat,
  MessageSquare,
  BarChart3,
  Ticket,
  Car,
  Route,
  Gift,
  Star,
  Navigation,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import ErrorBoundary from '@/components/admin/ErrorBoundary'
import { FullPageLoading, LoadingCard } from '@/components/admin/LoadingSpinner'

interface Order {
  id: string
  name: string
  total: number
  status: string
  createdAt: string
}

interface Stats {
  totalOrders: number
  totalRevenue: number
  activeUsers: number
  pendingOrders: number
  todayOrders: number
  todayRevenue: number
  totalProducts: number
  totalDeliveryZones: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    totalProducts: 0,
    totalDeliveryZones: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const retryFetch = () => {
    setRetryCount(prev => prev + 1)
    setError(null)
    setLoading(true)
  }

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null)
        
        // Fetch orders
        const ordersResponse = await fetch('/api/admin/orders')
        if (!ordersResponse.ok) {
          throw new Error(`Gagal memuat pesanan: ${ordersResponse.status}`)
        }
        
        const ordersData = await ordersResponse.json()
        if (ordersData.success) {
          const orders = ordersData.data
          const today = new Date().toDateString()
          const todayOrders = orders.filter((order: Order) => 
            new Date(order.createdAt).toDateString() === today
          )
          
          setStats(prev => ({
            ...prev,
            totalOrders: orders.length,
            pendingOrders: orders.filter((order: Order) => order.status === 'PENDING').length,
            todayOrders: todayOrders.length,
            todayRevenue: todayOrders.reduce((sum: number, order: Order) => sum + order.total, 0),
            totalRevenue: orders.reduce((sum: number, order: Order) => sum + order.total, 0)
          }))
          
          // Get recent orders (last 5)
          setRecentOrders(orders.slice(0, 5))
        } else {
          throw new Error(ordersData.error || 'Gagal memuat data pesanan')
        }

        // Fetch products
        const productsResponse = await fetch('/api/products')
        if (!productsResponse.ok) {
          console.warn('Gagal memuat produk:', productsResponse.status)
        } else {
          const productsData = await productsResponse.json()
          if (productsData.success) {
            setStats(prev => ({ ...prev, totalProducts: productsData.data.length }))
          }
        }

        // Fetch delivery zones
        const zonesResponse = await fetch('/api/admin/delivery-zones')
        if (!zonesResponse.ok) {
          console.warn('Gagal memuat delivery zones:', zonesResponse.status)
        } else {
          const zonesData = await zonesResponse.json()
          if (zonesData.success) {
            // Parse area for each zone
            const zonesWithParsedArea = zonesData.data.map((zone: any) => ({
              ...zone,
              area: zone.area ? JSON.parse(zone.area) : []
            }))
            setStats(prev => ({ ...prev, totalDeliveryZones: zonesWithParsedArea.length }))
          }
        }

        // Fetch team members
        const teamResponse = await fetch('/api/admin/team')
        if (!teamResponse.ok) {
          console.warn('Gagal memuat team:', teamResponse.status)
        } else {
          const teamData = await teamResponse.json()
          if (teamData.success) {
            setStats(prev => ({ ...prev, activeUsers: teamData.data.filter((member: any) => member.isActive).length }))
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError(error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [retryCount])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PREPARING': return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED': return 'bg-purple-100 text-purple-800'
      case 'DELIVERING': return 'bg-orange-100 text-orange-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Menunggu'
      case 'PREPARING': return 'Disiapkan'
      case 'CONFIRMED': return 'Dikonfirmasi'
      case 'DELIVERING': return 'Diantar'
      case 'COMPLETED': return 'Selesai'
      case 'CANCELLED': return 'Dibatalkan'
      default: return status
    }
  }

  if (loading) {
    return <FullPageLoading text="Memuat dashboard..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Error Memuat Data</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">{error}</p>
            <Button 
              onClick={retryFetch} 
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Store className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Kelola toko Oishine! Purwokerto
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              System Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.todayOrders} pesanan hari ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString('id-ID')}</div>
              <p className="text-xs text-muted-foreground">
                Rp {stats.todayRevenue.toLocaleString('id-ID')} hari ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tim Aktif</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Staff online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesanan Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Perlu diproses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Menu tersedia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Zones</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDeliveryZones}</div>
              <p className="text-xs text-muted-foreground">
                Area coverage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Delivery Zones */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-orange-500" />
                Delivery Zones
              </CardTitle>
              <CardDescription>
                Kelola area pengiriman Purwokerto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Zones</span>
                  <Badge variant="secondary">{stats.totalDeliveryZones} Area</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Coverage</span>
                  <Badge variant="outline">Purwokerto</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <Link href="/admin/delivery-zones">
                  <Button className="w-full mt-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    Kelola Zones
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Produk
              </CardTitle>
              <CardDescription>
                Kelola menu dan harga produk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Produk</span>
                  <Badge variant="secondary">{stats.totalProducts} Items</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Kategori</span>
                  <Badge variant="outline">Makanan & Minuman</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className="bg-green-100 text-green-800">Available</Badge>
                </div>
                <Link href="/admin/products">
                  <Button className="w-full mt-4">
                    <Package className="h-4 w-4 mr-2" />
                    Kelola Produk
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-500" />
                Pesanan
              </CardTitle>
              <CardDescription>
                Kelola pesanan masuk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hari Ini</span>
                  <Badge variant="secondary">{stats.todayOrders} Orders</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <Badge variant="destructive">{stats.pendingOrders} Orders</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <Badge className="bg-green-100 text-green-800">{stats.totalOrders - stats.pendingOrders} Orders</Badge>
                </div>
                <Link href="/admin/orders">
                  <Button className="w-full mt-4">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Lihat Pesanan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Team
              </CardTitle>
              <CardDescription>
                Kelola tim dan staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Team</span>
                  <Badge variant="secondary">{stats.activeUsers} Members</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <Badge className="bg-green-100 text-green-800">{stats.activeUsers} Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className="bg-green-100 text-green-800">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Departments</span>
                  <Badge variant="outline">Kitchen, Delivery</Badge>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Kelola Team
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vouchers */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-yellow-500" />
                Vouchers
              </CardTitle>
              <CardDescription>
                Kelola voucher dan diskon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Vouchers</span>
                  <Badge variant="secondary">5 Vouchers</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Used</span>
                  <Badge variant="outline">23 Times</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <Link href="/admin/vouchers">
                  <Button className="w-full mt-4" variant="outline">
                    <Ticket className="h-4 w-4 mr-2" />
                    Kelola Vouchers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Drivers */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-500" />
                Drivers
              </CardTitle>
              <CardDescription>
                Kelola kurir pengiriman
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Drivers</span>
                  <Badge variant="secondary">8 Drivers</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">On Duty</span>
                  <Badge className="bg-green-100 text-green-800">5 Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Rating</span>
                  <Badge variant="outline">4.8 ⭐</Badge>
                </div>
                <Link href="/admin/drivers">
                  <Button className="w-full mt-4" variant="outline">
                    <Car className="h-4 w-4 mr-2" />
                    Kelola Drivers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                Pengaturan
              </CardTitle>
              <CardDescription>
                Konfigurasi toko
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Store Name</span>
                  <Badge variant="secondary">Oishine!</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <Badge variant="outline">Purwokerto</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className="bg-green-100 text-green-800">Open</Badge>
                </div>
                <Link href="/admin/settings">
                  <Button className="w-full mt-4" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Pengaturan Toko
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Profit Analysis */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Profit Analysis
              </CardTitle>
              <CardDescription>
                Analisis keuntungan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Today Revenue</span>
                  <Badge variant="secondary">Rp {stats.todayRevenue.toLocaleString('id-ID')}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Growth</span>
                  <Badge className="bg-green-100 text-green-800">+12%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Top Product</span>
                  <Badge variant="outline">Mochi</Badge>
                </div>
                <Link href="/admin/profit-analysis">
                  <Button className="w-full mt-4" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Lihat Analytics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Pesanan Terbaru
            </CardTitle>
            <CardDescription>
              5 pesanan terakhir yang masuk
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">ID</th>
                      <th className="text-left py-2 px-4">Pelanggan</th>
                      <th className="text-left py-2 px-4">Total</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-left py-2 px-4">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 text-sm">#{order.id.slice(-6)}</td>
                        <td className="py-2 px-4 text-sm">{order.name}</td>
                        <td className="py-2 px-4 text-sm">Rp {order.total.toLocaleString('id-ID')}</td>
                        <td className="py-2 px-4">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 text-sm">
                          {new Date(order.createdAt).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada pesanan
              </div>
            )}
            <div className="mt-4">
              <Link href="/admin/orders">
                <Button variant="outline" className="w-full">
                  Lihat Semua Pesanan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Aksi cepat untuk mengelola toko
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/orders">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full">
                  <ShoppingCart className="h-6 w-6" />
                  <span>Pesanan Baru</span>
                </Button>
              </Link>
              <Link href="/admin/products/create">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full">
                  <Package className="h-6 w-6" />
                  <span>Tambah Produk</span>
                </Button>
              </Link>
              <Link href="/admin/delivery-zones">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full">
                  <Truck className="h-6 w-6" />
                  <span>Test Delivery</span>
                </Button>
              </Link>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full">
                <MessageSquare className="h-6 w-6" />
                <span>Customer Chat</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Pesanan Terbaru
            </CardTitle>
            <CardDescription>
              5 pesanan terakhir yang masuk
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Pelanggan</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-right py-2">Total</th>
                        <th className="text-left py-2">Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">
                            <div>
                              <div className="font-medium">{order.name}</div>
                              <div className="text-xs text-gray-500">{order.email}</div>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </td>
                          <td className="py-3 text-right font-medium">
                            Rp {order.total.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Link href="/admin/orders">
                  <Button variant="outline" className="w-full">
                    Lihat Semua Pesanan
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Belum ada pesanan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </ErrorBoundary>
  )
}