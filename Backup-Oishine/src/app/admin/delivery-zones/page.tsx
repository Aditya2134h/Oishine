'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Settings, 
  Users, 
  ShoppingCart,
  Package,
  Truck,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import DeliveryZoneManager from '@/components/admin/DeliveryZoneManager'
import Link from 'next/link'
import { toast } from '@/hooks/use-toast'
import AdminAuthWrapper from '@/components/admin-auth-wrapper'

export default function AdminDeliveryZonesPage() {
  const [activeTab, setActiveTab] = useState('zones')

  const updateStoreToPurwokerto = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeAddress: 'Purwokerto, Indonesia',
          storeDescription: 'Delicious Japanese Food Delivery - Purwokerto',
          contactAddress: 'Jl. Jend. Gatot Subroto No. 30, Purwokerto',
          contactPhone: '+62 281 123456'
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Store settings updated to Purwokerto!')
        // Refresh the page to show updated settings
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast.error(result.error || 'Failed to update settings')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengupdate settings')
    }
  }

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0 flex-1">
              <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 shrink-0">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
                <span className="sm:hidden">←</span>
              </Link>
              <div className="flex items-center ml-2 sm:ml-4 min-w-0 flex-1">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 shrink-0" />
                <h1 className="ml-2 sm:ml-3 text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Kelola Delivery Zones
                </h1>
              </div>
            </div>
            <div className="shrink-0">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">System Online</span>
                <span className="sm:hidden">🟢</span>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-auto p-1">
              <TabsTrigger value="zones" className="flex items-center gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Delivery Zones</span>
                <span className="sm:hidden">Zones</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                Pengaturan
              </TabsTrigger>
            </TabsList>

          <TabsContent value="zones" className="space-y-4 sm:space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Lokasi Pusat</CardTitle>
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold truncate">SMKN 1 Purwokerto</div>
                  <p className="text-xs text-muted-foreground">
                    -7.4256, 109.2435
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Coverage Area</CardTitle>
                  <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">5 Zone</div>
                  <p className="text-xs text-muted-foreground">
                    Purwokerto & Sekitarnya
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Status System</CardTitle>
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-green-600">Aktif</div>
                  <p className="text-xs text-muted-foreground">
                    Ready for orders
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Delivery Zone Manager */}
            <div className="bg-white rounded-lg shadow">
              <DeliveryZoneManager />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Location Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    Pengaturan Lokasi
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Konfigurasi lokasi pusat dan area coverage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Lokasi Saat Ini</h4>
                    <div className="space-y-1 text-xs sm:text-sm text-blue-700">
                      <p><strong>Pusat:</strong> SMKN 1 Purwokerto</p>
                      <p><strong>Latitude:</strong> -7.4256</p>
                      <p><strong>Longitude:</strong> 109.2435</p>
                      <p><strong>Alamat:</strong> Jl. Jend. Gatot Subroto No. 30, Purwokerto</p>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">Area Coverage</h4>
                    <div className="space-y-1 text-xs sm:text-sm text-green-700">
                      <p>• Purwokerto Utara</p>
                      <p>• Purwokerto Selatan</p>
                      <p>• Purwokerto Timur</p>
                      <p>• Purwokerto Barat</p>
                      <p>• Purwokerto Kota (Center)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                    Pengaturan Pengiriman
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Konfigurasi default untuk pengiriman
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 sm:p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2 text-sm sm:text-base">Default Settings</h4>
                    <div className="space-y-1 text-xs sm:text-sm text-orange-700">
                      <p><strong>Biaya Minimum:</strong> Rp 10.000</p>
                      <p><strong>Biaya Maksimum:</strong> Rp 25.000</p>
                      <p><strong>Estimasi Minimum:</strong> 15 menit</p>
                      <p><strong>Estimasi Maksimum:</strong> 60 menit</p>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">Jam Operasional</h4>
                    <div className="space-y-1 text-xs sm:text-sm text-purple-700">
                      <p><strong>Senin - Jumat:</strong> 10:00 - 22:00</p>
                      <p><strong>Sabtu - Minggu:</strong> 10:00 - 23:00</p>
                      <p><strong>Status:</strong> Buka</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Aksi cepat untuk mengelola delivery zones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-xs sm:text-sm">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-center">Tambah Zone Baru</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-xs sm:text-sm">
                    <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-center">Test Delivery</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-xs sm:text-sm"
                    onClick={updateStoreToPurwokerto}
                  >
                    <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-center">Update to Purwokerto</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </main>
    </div>
    </AdminAuthWrapper>
  )
}