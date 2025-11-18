'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, UserCheck, UserX, Star, AlertCircle, BarChart3, PieChart, Award, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

interface DriverAnalytics {
  summary: {
    totalDrivers: number
    activeDrivers: number
    availableDrivers: number
    busyDrivers: number
    offlineDrivers: number
    avgOrdersPerDriver: number
    avgRating: number
  }
  statusDistribution: Array<{
    status: string
    count: number
    percentage: number
  }>
  topPerformers: Array<{
    id: string
    name: string
    orders: number
    totalOrders: number
    rating: number
  }>
  driverStats: Array<{
    id: string
    name: string
    status: string
    totalOrders: number
    recentOrders: number
    rating: number
    joinDate: string
  }>
}

export default function DriverAnalyticsPage() {
  const [analytics, setAnalytics] = useState<DriverAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/drivers/analytics?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0 flex-1">
              <Link href="/admin/drivers" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 shrink-0">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
                <span className="sm:hidden">←</span>
              </Link>
              <div className="flex items-center ml-2 sm:ml-4 min-w-0 flex-1">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 shrink-0" />
                <h1 className="ml-2 sm:ml-3 text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Driver Analytics
                </h1>
              </div>
            </div>
            <div className="shrink-0">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[140px] sm:w-[180px] text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{analytics.summary.totalDrivers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.activeDrivers} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Available Now</CardTitle>
            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{analytics.summary.availableDrivers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.busyDrivers} busy
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg Orders/Driver</CardTitle>
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{analytics.summary.avgOrdersPerDriver}</div>
            <p className="text-xs text-muted-foreground">
              Last {period} days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{analytics.summary.avgRating}</div>
            <p className="text-xs text-muted-foreground">
              Driver performance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChart className="h-4 w-4 sm:h-5 sm:w-5" />
              Status Distribution
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Current driver status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {analytics.statusDistribution.map((status) => (
              <div key={status.status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(status.status)} text-xs`}>
                      {getStatusIcon(status.status)} {status.status}
                    </Badge>
                    <span className="text-xs sm:text-sm font-medium">{status.count} drivers</span>
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {status.percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={status.percentage} className="h-1.5 sm:h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
              Top Performers
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Best performing drivers this period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {analytics.topPerformers.map((driver, index) => (
                <div key={driver.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary font-bold text-xs sm:text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                        {driver.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {driver.orders} orders this period
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs sm:text-sm font-medium">{driver.rating.toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {driver.totalOrders} total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Drivers Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Driver Performance Overview</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Complete list of drivers with their performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium">Driver</th>
                  <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium hidden sm:table-cell">Status</th>
                  <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium text-right">Recent Orders</th>
                  <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium text-right hidden lg:table-cell">Total Orders</th>
                  <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium text-right">Rating</th>
                  <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium hidden sm:table-cell">Join Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.driverStats.map((driver) => (
                  <tr key={driver.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                          <AvatarImage src={`/avatars/${driver.id}.jpg`} />
                          <AvatarFallback className="text-xs">{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">
                          {driver.name}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 hidden sm:table-cell">
                      <Badge className={`${getStatusColor(driver.status)} text-xs`}>
                        {getStatusIcon(driver.status)} {driver.status}
                      </Badge>
                    </td>
                    <td className="p-2 sm:p-4 text-right">
                      <div className="font-medium text-xs sm:text-sm">{driver.recentOrders}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">Last {period} days</div>
                    </td>
                    <td className="p-2 sm:p-4 text-right hidden lg:table-cell">
                      <div className="font-medium text-xs sm:text-sm">{driver.totalOrders}</div>
                      <div className="text-xs text-muted-foreground">All time</div>
                    </td>
                    <td className="p-2 sm:p-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-xs sm:text-sm">{driver.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 text-xs sm:text-sm hidden sm:table-cell">
                      <div className="sm:hidden">
                        {new Date(driver.joinDate).toLocaleDateString('id-ID', { 
                          day: '2-digit', 
                          month: 'short' 
                        })}
                      </div>
                      <div className="hidden sm:block">
                        {new Date(driver.joinDate).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
        </div>
      </main>
    </div>
  )
}