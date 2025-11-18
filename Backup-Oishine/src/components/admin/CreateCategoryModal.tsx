import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (category: any) => void
  onDeleted?: (id: string) => void
}

export default function CreateCategoryModal({ open, onClose, onCreated, onDeleted }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [isFetching, setIsFetching] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Nama kategori wajib diisi')
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('admin-token')
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: name.trim(), description: description.trim() })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Kategori berhasil dibuat')
        onCreated(data.data)
        setName('')
        setDescription('')
        onClose()
      } else {
        toast.error(data.error || 'Gagal membuat kategori')
      }
    } catch (err) {
      console.error('Create category error:', err)
      toast.error('Terjadi kesalahan saat membuat kategori')
    } finally {
      setIsLoading(false)
    }
  }

  // Load categories when modal opens
  useEffect(() => {
    const load = async () => {
      if (!open) return
      setIsFetching(true)
      try {
        const res = await fetch('/api/admin/categories')
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.data)) {
            setCategories(data.data)
          }
        }
      } catch (err) {
        console.error('Failed to load categories in modal', err)
      } finally {
        setIsFetching(false)
      }
    }
    load()
  }, [open])

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kategori ini? Tindakan ini tidak dapat dibatalkan.')) return
    setIsLoading(true)
    try {
      const token = localStorage.getItem('admin-token')
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ id })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Kategori berhasil dihapus')
        setCategories(prev => prev.filter(c => c.id !== id))
        if (typeof (onDeleted) === 'function') onDeleted(id)
      } else {
        toast.error(data.error || 'Gagal menghapus kategori')
      }
    } catch (err) {
      console.error('Delete category error:', err)
      toast.error('Terjadi kesalahan saat menghapus kategori')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Kategori Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cat-name">Nama Kategori</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Bento" />
          </div>
          <div>
            <Label htmlFor="cat-desc">Deskripsi (opsional)</Label>
            <Input id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi singkat" />
          </div>
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Kategori yang sudah ada</h4>
          {isFetching ? (
            <div className="text-sm text-gray-500">Memuat...</div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.length === 0 && (
                <div className="text-sm text-gray-500">Belum ada kategori</div>
              )}
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="text-sm">{cat.name || 'Kategori'}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500 mr-2">{(cat._count?.products) ?? 0} produk</div>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(cat.id)} disabled={isLoading || !cat.id}>
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>Batal</Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Buat Kategori'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
