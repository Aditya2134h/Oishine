'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import AdminErrorBoundary from '@/components/admin-error-boundary'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart,
  Package,
  Truck,
  MapPin,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  Store,
  Ticket,
  Route,
  Settings,
  TrendingUp,
  Navigation,
  Gift,
  BarChart3,
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Activity,
  Zap,
  Target,
  Star,
  RefreshCw,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  totalVouchers: number
  totalDrivers: number
  activeRoutes: number
}

export default function AdminPageSimple() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    totalProducts: 0,
    totalDeliveryZones: 0,
    totalVouchers: 0,
    totalDrivers: 0,
    activeRoutes: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('🔄 [Admin Dashboard] Starting to fetch dashboard data...')
        
        // Fetch orders
        console.log('📦 [Admin Dashboard] Fetching orders...')
        const ordersResponse = await fetch('/api/admin/orders')
        if (!ordersResponse.ok) {
          throw new Error(`Gagal memuat pesanan: ${ordersResponse.status}`)
        }
        
        const ordersData = await ordersResponse.json()
        console.log('✅ [Admin Dashboard] Orders fetched:', ordersData.success ? 'Success' : 'Failed')
        
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
          console.log('📊 [Admin Dashboard] Stats updated with orders data')
        } else {
          throw new Error(ordersData.error || 'Gagal memuat data pesanan')
        }

        // Fetch products
        console.log('🍱 [Admin Dashboard] Fetching products...')
        try {
          const productsResponse = await fetch('/api/products')
          if (!productsResponse.ok) {
            console.warn('⚠️ [Admin Dashboard] Gagal memuat produk:', productsResponse.status)
          } else {
            const productsData = await productsResponse.json()
            if (productsData.success) {
              setStats(prev => ({ ...prev, totalProducts: productsData.data.length }))
              console.log('✅ [Admin Dashboard] Products fetched successfully')
            }
          }
        } catch (productError) {
          console.warn('⚠️ [Admin Dashboard] Product fetch error:', productError)
        }

        // Fetch delivery zones
        console.log('🚚 [Admin Dashboard] Fetching delivery zones...')
        try {
          const zonesResponse = await fetch('/api/admin/delivery-zones')
          if (!zonesResponse.ok) {
            console.warn('⚠️ [Admin Dashboard] Gagal memuat delivery zones:', zonesResponse.status)
          } else {
            const zonesData = await zonesResponse.json()
            if (zonesData.success) {
              const activeZones = zonesData.data.filter((zone: any) => zone.isActive)
              setStats(prev => ({ ...prev, totalDeliveryZones: activeZones.length }))
              console.log('✅ [Admin Dashboard] Delivery zones fetched successfully')
            }
          }
        } catch (zoneError) {
          console.warn('⚠️ [Admin Dashboard] Delivery zone fetch error:', zoneError)
        }

        // Fetch team members
        console.log('👥 [Admin Dashboard] Fetching team members...')
        try {
          const teamResponse = await fetch('/api/admin/team')
          if (!teamResponse.ok) {
            console.warn('⚠️ [Admin Dashboard] Gagal memuat team:', teamResponse.status)
          } else {
            const teamData = await teamResponse.json()
            if (teamData.success) {
              setStats(prev => ({ ...prev, activeUsers: teamData.data.filter((member: any) => member.isActive).length }))
              console.log('✅ [Admin Dashboard] Team members fetched successfully')
            }
          }
        } catch (teamError) {
          console.warn('⚠️ [Admin Dashboard] Team fetch error:', teamError)
        }

        // Fetch vouchers
        console.log('🎫 [Admin Dashboard] Fetching vouchers data...')
        try {
          const vouchersResponse = await fetch('/api/admin/vouchers')
          if (!vouchersResponse.ok) {
            console.warn('⚠️ [Admin Dashboard] Gagal memuat vouchers:', vouchersResponse.status)
          } else {
            const vouchersData = await vouchersResponse.json()
            if (vouchersData.success) {
              const now = new Date()
              const activeVouchers = vouchersData.data.filter((voucher: any) => {
                const validFrom = new Date(voucher.validFrom)
                const validTo = new Date(voucher.validTo)
                const hasUsageLimit = voucher.usageLimit ? voucher.usageCount < voucher.usageLimit : true
                return voucher.isActive && 
                       validFrom <= now && 
                       validTo >= now && 
                       hasUsageLimit
              })
              setStats(prev => ({ ...prev, totalVouchers: activeVouchers.length }))
              console.log('✅ [Admin Dashboard] Vouchers fetched successfully:', activeVouchers.length, 'active vouchers')
            }
          }
        } catch (voucherError) {
          console.warn('⚠️ [Admin Dashboard] Voucher data error:', voucherError)
        }

        // Fetch drivers
        console.log('🚚 [Admin Dashboard] Fetching drivers data...')
        try {
          const driversResponse = await fetch('/api/drivers')
          if (!driversResponse.ok) {
            console.warn('⚠️ [Admin Dashboard] Gagal memuat drivers:', driversResponse.status)
          } else {
            const driversData = await driversResponse.json()
            if (driversData.drivers) {
              const activeDrivers = driversData.drivers.filter((driver: any) => 
                driver.isActive && driver.status !== 'OFFLINE'
              )
              setStats(prev => ({ ...prev, totalDrivers: activeDrivers.length }))
              console.log('✅ [Admin Dashboard] Drivers fetched successfully:', activeDrivers.length, 'active drivers')
            }
          }
        } catch (driverError) {
          console.warn('⚠️ [Admin Dashboard] Driver data error:', driverError)
        }

        // Fetch routes
        console.log('🛣️ [Admin Dashboard] Fetching routes data...')
        try {
          const routesResponse = await fetch('/api/routes')
          if (!routesResponse.ok) {
            console.warn('⚠️ [Admin Dashboard] Gagal memuat routes:', routesResponse.status)
          } else {
            const routesData = await routesResponse.json()
            if (routesData.routes) {
              const activeRoutes = routesData.routes.filter((route: any) => 
                route.status === 'PLANNED' || route.status === 'ACTIVE'
              )
              setStats(prev => ({ ...prev, activeRoutes: activeRoutes.length }))
              console.log('✅ [Admin Dashboard] Routes fetched successfully:', activeRoutes.length, 'active routes')
            }
          }
        } catch (routeError) {
          console.warn('⚠️ [Admin Dashboard] Route data error:', routeError)
        }

        console.log('🎉 [Admin Dashboard] All data fetched successfully!')
        
        // Show success toast
        toast({
          title: "Dashboard Loaded",
          description: "All data has been successfully refreshed.",
        })
      } catch (error) {
        console.error('❌ [Admin Dashboard] Error fetching dashboard data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui'
        setError(errorMessage)
        
        // Show error toast
        toast({
          title: "Error Loading Dashboard",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    }

    fetchDashboardData()
  }, [retryCount])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setRetryCount(prev => prev + 1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PREPARING': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CONFIRMED': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'DELIVERING': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const handleLogout = () => {
    // Clear authentication tokens
    localStorage.removeItem('admin-token')
    sessionStorage.removeItem('admin-token')
    
    // Redirect to login page
    router.push('/login')
  }

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4"
          >
            <img src="/oishine-logo-custom.png" alt="OISHINE!" className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-full" />
          </motion.div>
          <p className="text-gray-600 font-medium">Memeriksa autentikasi...</p>
        </motion.div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  // Show loading screen while loading data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50">
        {/* Header Skeleton */}
        <div className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg animate-pulse">
                  <div className="h-6 w-6 bg-gradient-to-r from-red-300 to-pink-300 rounded"></div>
                </div>
                <div>
                  <div className="h-6 w-32 bg-gradient-to-r from-gray-300 to-gray-400 rounded animate-pulse mb-1"></div>
                  <div className="h-4 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-6 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="animate-pulse">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 w-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded"></div>
                    <div className="h-4 w-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Management Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Card className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 w-32 bg-gradient-to-r from-gray-300 to-gray-400 rounded mb-2"></div>
                    <div className="h-4 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="flex items-center justify-between">
                          <div className="h-3 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                          <div className="h-5 w-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded"></div>
                        </div>
                      ))}
                      <div className="h-10 w-full bg-gradient-to-r from-gray-300 to-gray-400 rounded mt-4"></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-red-800">Error Memuat Data</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">{error}</p>
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                  variant="outline"
                >
                  Refresh Halaman
                </Button>
                <Button 
                  onClick={() => {
                    setError(null)
                    setRetryCount(prev => prev + 1)
                  }} 
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  Coba Lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <AdminErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-200 to-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg border-b border-red-100 sticky top-0 z-40 shadow-sm"
        >
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <img src="/oishine-logo-custom.png" alt="OISHINE!" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 object-cover rounded-full" />
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">
                    Kelola toko Oishine! Purwokerto
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
                >
                  <motion.div
                    animate={isRefreshing ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  <span className="hidden sm:inline">Refresh</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 sm:py-8 relative">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    Selamat Datang Kembali! 👋
                  </h2>
                  <p className="text-red-100 text-sm sm:text-base">
                    Kelola bisnis Anda dengan mudah dan efisien
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold">{stats.todayOrders}</div>
                    <div className="text-xs sm:text-sm text-red-100">Pesanan Hari Ini</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold">Rp {stats.todayRevenue.toLocaleString('id-ID')}</div>
                    <div className="text-xs sm:text-sm text-red-100">Pendapatan Hari Ini</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
          >
            {/* Total Orders Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Pesanan</CardTitle>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+12% dari bulan lalu</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Revenue Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Pendapatan</CardTitle>
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">Rp {stats.totalRevenue.toLocaleString('id-ID')}</div>
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+8% dari bulan lalu</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Products Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Produk</CardTitle>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Package className="h-4 w-4 text-purple-500" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Activity className="w-3 h-3" />
                    <span>{stats.pendingOrders} perlu persetujuan</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active Users Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Tim Aktif</CardTitle>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Users className="h-4 w-4 text-orange-500" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Zap className="w-3 h-3" />
                    <span>Online sekarang</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Management Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {/* Products Management */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Manajemen Produk</CardTitle>
                      <CardDescription>Kelola katalog produk</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Produk</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {stats.totalProducts}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Kategori Aktif</span>
                    <Badge variant="secondary">5</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Produk Tersedia</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {stats.totalProducts - 2}
                    </Badge>
                  </div>
                  <Link href="/admin/products">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                        Kelola Produk
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Orders Management */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Manajemen Pesanan</CardTitle>
                      <CardDescription> Pantau status pesanan</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pesanan Menunggu</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {stats.pendingOrders}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pesanan Hari Ini</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {stats.todayOrders}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Pesanan</span>
                    <Badge variant="secondary">{stats.totalOrders}</Badge>
                  </div>
                  <Link href="/admin/orders">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                        Kelola Pesanan
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vouchers Management */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Ticket className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Manajemen Voucher</CardTitle>
                      <CardDescription>Buat dan kelola voucher</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Voucher Aktif</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {stats.totalVouchers}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Terpakai</span>
                    <Badge variant="secondary">24</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Diskon Total</span>
                    <Badge variant="secondary">Rp 450K</Badge>
                  </div>
                  <Link href="/admin/vouchers">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                        Kelola Voucher
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Delivery Management */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Manajemen Pengiriman</CardTitle>
                      <CardDescription>Zona dan driver</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Zona Aktif</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {stats.totalDeliveryZones}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Driver Aktif</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {stats.totalDrivers}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rute Aktif</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {stats.activeRoutes}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/admin/delivery-zones">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                          Zona
                        </Button>
                      </motion.div>
                    </Link>
                    <Link href="/admin/drivers">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                          Driver
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Team Management */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Manajemen Tim</CardTitle>
                      <CardDescription>Kelola staff dan admin</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Staff</span>
                    <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                      {stats.activeUsers}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Admin Aktif</span>
                    <Badge variant="secondary">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Shift Hari Ini</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      2
                    </Badge>
                  </div>
                  <Link href="/admin/settings">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                        Kelola Tim
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Analytics & Reports */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Analitik & Laporan</CardTitle>
                      <CardDescription>Statistik bisnis</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Profit Bulan Ini</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +15%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Konversi</span>
                    <Badge variant="secondary">3.2%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rating Rata-rata</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      4.8⭐
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/admin/profit-analysis">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button size="sm" className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white">
                          Profit
                        </Button>
                      </motion.div>
                    </Link>
                    <Link href="/admin/tracking">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button size="sm" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                          Tracking
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                    <CardDescription>Tindakan yang sering dilakukan</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/admin/products/create">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                        <Plus className="h-6 w-6" />
                        <span className="text-xs">Tambah Produk</span>
                      </Button>
                    </motion.div>
                  </Link>
                  
                  <Link href="/admin/coupon-generator">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                        <Gift className="h-6 w-6" />
                        <span className="text-xs">Buat Voucher</span>
                      </Button>
                    </motion.div>
                  </Link>
                  
                  <Link href="/admin/routes">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                        <Route className="h-6 w-6" />
                        <span className="text-xs">Rute Pengiriman</span>
                      </Button>
                    </motion.div>
                  </Link>
                  
                  <Link href="/admin/drivers/analytics">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                        <TrendingUp className="h-6 w-6" />
                        <span className="text-xs">Analitik Driver</span>
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Pesanan Terbaru</CardTitle>
                      <CardDescription>5 pesanan terakhir</CardDescription>
                    </div>
                  </div>
                  <Link href="/admin/orders">
                    <Button variant="outline" size="sm">
                      Lihat Semua
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {recentOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">Rp {order.total.toLocaleString('id-ID')}</p>
                            <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {recentOrders.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">Belum ada pesanan</p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </AdminErrorBoundary>
  )
}