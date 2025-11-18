'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Trash2, Edit, Plus, MapPin, Clock, DollarSign } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface DeliveryZone {
  id: string
  name: string
  description?: string
  area: number[][]
  deliveryFee: number
  estimatedTime: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Koordinat area Purwokerto (SMKN 1 Purwokerto sebagai pusat)
// SMKN 1 Purwokerto: -7.4256, 109.2435
const purwokertoAreas = {
  'Purwokerto Utara': [
    [-7.4100, 109.2300],
    [-7.4100, 109.2500],
    [-7.4300, 109.2500],
    [-7.4300, 109.2300]
  ],
  'Purwokerto Selatan': [
    [-7.4300, 109.2300],
    [-7.4300, 109.2500],
    [-7.4500, 109.2500],
    [-7.4500, 109.2300]
  ],
  'Purwokerto Timur': [
    [-7.4200, 109.2500],
    [-7.4200, 109.2700],
    [-7.4400, 109.2700],
    [-7.4400, 109.2500]
  ],
  'Purwokerto Barat': [
    [-7.4200, 109.2100],
    [-7.4200, 109.2300],
    [-7.4400, 109.2300],
    [-7.4400, 109.2100]
  ],
  'Purwokerto Kota (Center)': [
    [-7.4200, 109.2300],
    [-7.4200, 109.2500],
    [-7.4300, 109.2500],
    [-7.4300, 109.2300]
  ]
}

export default function DeliveryZoneManager() {
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    area: '',
    deliveryFee: '',
    estimatedTime: '',
    isActive: true
  })

  const fetchZones = async () => {
    try {
      const response = await fetch('/api/admin/delivery-zones')
      const result = await response.json()
      
      if (result.success) {
        // Parse area for each zone
        const zonesWithParsedArea = result.data.map((zone: any) => ({
          ...zone,
          area: zone.area ? JSON.parse(zone.area) : []
        }))
        setZones(zonesWithParsedArea)
      } else {
        toast.error('Gagal memuat delivery zones')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchZones()
  }, [])

  const handleNameChange = (value: string) => {
    setFormData({ 
      ...formData, 
      name: value,
      area: JSON.stringify(purwokertoAreas[value as keyof typeof purwokertoAreas] || [])
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Parse area JSON
      let parsedArea
      try {
        parsedArea = JSON.parse(formData.area)
      } catch (error) {
        toast.error('Format koordinat area tidak valid. Gunakan format JSON: [[lat, lng], ...]')
        return
      }

      // Validate coordinates
      if (!Array.isArray(parsedArea) || parsedArea.length === 0) {
        toast.error('Area harus berisi setidaknya satu koordinat')
        return
      }

      for (const coord of parsedArea) {
        if (!Array.isArray(coord) || coord.length !== 2 || 
            typeof coord[0] !== 'number' || typeof coord[1] !== 'number') {
          toast.error('Format koordinat tidak valid. Setiap koordinat harus berupa [latitude, longitude]')
          return
        }
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        area: parsedArea,
        deliveryFee: parseFloat(formData.deliveryFee),
        estimatedTime: parseInt(formData.estimatedTime),
        isActive: formData.isActive
      }

      const url = editingZone 
        ? `/api/admin/delivery-zones/${editingZone.id}`
        : '/api/admin/delivery-zones'
      
      const method = editingZone ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(editingZone ? 'Zone berhasil diperbarui' : 'Zone berhasil ditambahkan')
        setIsFormOpen(false)
        setEditingZone(null)
        resetForm()
        fetchZones()
      } else {
        toast.error(result.error || 'Gagal menyimpan zone')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan data')
    }
  }

  const handleEdit = (zone: DeliveryZone) => {
    setEditingZone(zone)
    setFormData({
      name: zone.name,
      description: zone.description || '',
      area: JSON.stringify(zone.area),
      deliveryFee: zone.deliveryFee.toString(),
      estimatedTime: zone.estimatedTime.toString(),
      isActive: zone.isActive
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus zone ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/delivery-zones/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Zone berhasil dihapus')
        fetchZones()
      } else {
        toast.error(result.error || 'Gagal menghapus zone')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus data')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      area: '',
      deliveryFee: '',
      estimatedTime: '',
      isActive: true
    })
  }

  const toggleZoneStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/delivery-zones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Zone berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`)
        fetchZones()
      } else {
        toast.error(result.error || 'Gagal mengubah status zone')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengubah status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Delivery Zone Purwokerto</h2>
          <p className="text-muted-foreground">
            Kelola area pengiriman untuk wilayah Purwokerto (SMKN 1 Purwokerto sebagai pusat)
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingZone(null)
            resetForm()
            setIsFormOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Zone
        </Button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingZone ? 'Edit Delivery Zone' : 'Tambah Delivery Zone Baru'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Zone *</Label>
                  <select
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Pilih Area Purwokerto</option>
                    {Object.keys(purwokertoAreas).map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deliveryFee">Biaya Pengiriman (Rp) *</Label>
                  <Input
                    id="deliveryFee"
                    type="number"
                    step="0.01"
                    value={formData.deliveryFee}
                    onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                    placeholder="15000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Area coverage untuk Purwokerto..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area Coordinates (JSON) *</Label>
                <Textarea
                  id="area"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder='[[-7.4256, 109.2435], [-7.4260, 109.2440]]'
                  rows={4}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Format: [[latitude, longitude], ...] - Koordinat akan otomatis terisi saat memilih area
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimasi Waktu (menit) *</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  placeholder="30"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Zone Aktif</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingZone ? 'Update Zone' : 'Tambah Zone'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false)
                    setEditingZone(null)
                    resetForm()
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Zones List */}
      <div className="grid gap-4">
        {zones.length === 0 ? (
          <Alert>
            <AlertDescription>
              Belum ada delivery zone yang ditambahkan. Klik "Tambah Zone" untuk memulai.
            </AlertDescription>
          </Alert>
        ) : (
          zones.map((zone) => (
            <Card key={zone.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{zone.name}</h3>
                      <Badge variant={zone.isActive ? 'default' : 'secondary'}>
                        {zone.isActive ? 'Aktif' : 'Non-aktif'}
                      </Badge>
                    </div>
                    
                    {zone.description && (
                      <p className="text-muted-foreground mb-3">{zone.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>Rp {zone.deliveryFee.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{zone.estimatedTime} menit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{zone.area.length} titik koordinat</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleZoneStatus(zone.id, !zone.isActive)}
                    >
                      {zone.isActive ? 'Non-aktifkan' : 'Aktifkan'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(zone)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(zone.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}