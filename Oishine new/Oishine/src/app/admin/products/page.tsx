'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Package, ArrowLeft, Filter, Grid, List, Star, TrendingUp, DollarSign, Zap, Sparkles, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import AdminAuthWrapper from '@/components/admin-auth-wrapper';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  ingredients?: string;
  isAvailable: boolean;
  category: { id: string; name: string; };
  totalOrders?: number;
  totalRevenue?: number;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('admin-token') || sessionStorage.getItem('admin-token');
      if (!token) {
        return;
      }

      const response = await fetch('/api/admin/products?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProducts(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Gagal memuat produk');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.category.id === filterCategory;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'available' && product.isAvailable) ||
                           (filterStatus === 'unavailable' && !product.isAvailable);
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'orders':
          return (b.totalOrders || 0) - (a.totalOrders || 0);
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        default:
          return 0;
      }
    });

  const categories = Array.from(new Set(products.map(p => p.category.name)));

  const toggleProductAvailability = async (productId: string) => {
    try {
      const token = localStorage.getItem('admin-token') || sessionStorage.getItem('admin-token');
      if (!token) return;

      const product = products.find(p => p.id === productId);
      if (!product) return;

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isAvailable: !product.isAvailable
        })
      });

      if (response.ok) {
        setProducts(prev => prev.map(p =>
          p.id === productId 
            ? { ...p, isAvailable: !p.isAvailable }
            : p
        ));
        toast.success(`Produk ${!product.isAvailable ? 'ditampilkan' : 'disembunyikan'}`);
      } else {
        toast.error('Gagal mengubah status produk');
      }
    } catch (error) {
      console.error('Error toggling product:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const deleteProduct = async (productId: string, force = false) => {
    try {
      const token = localStorage.getItem('admin-token') || sessionStorage.getItem('admin-token');
      if (!token) return;

      const url = force ? `/api/admin/products/${productId}?force=true` : `/api/admin/products/${productId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(prev => prev.filter(product => product.id !== productId));
        toast.success('Produk berhasil dihapus');
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      } else {
        if (data.code === 'HAS_RELATIONS') {
          setProductToDelete(products.find(p => p.id === productId) || null);
          setDeleteDialogOpen(true);
        } else {
          toast.error(data.error || 'Gagal menghapus produk');
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Terjadi kesalahan saat menghapus produk');
    }
  };

  const forceDeleteProduct = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id, true);
    }
  };

  if (isLoading) {
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
          <p className="text-gray-600 font-medium">Memuat produk...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50">
        {/* Animated Background */}
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
        </div>

        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg border-b border-red-100 sticky top-0 z-40 shadow-sm"
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Kembali</span>
                </motion.button>
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <img src="/oishine-logo-custom.png" alt="OISHINE!" className="w-6 h-6 sm:w-7 sm:h-7 object-cover rounded-full" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      Kelola Produk
                    </h1>
                    <p className="text-sm text-gray-500">{products.length} produk tersedia</p>
                  </div>
                </div>
              </div>
              
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/admin/products/create')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Tambah Produk</span>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="p-4 sm:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto">
            {/* Filters and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Cari produk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3">
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-40 border-2 border-gray-200 rounded-xl">
                          <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Kategori</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32 border-2 border-gray-200 rounded-xl">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua</SelectItem>
                          <SelectItem value="available">Tersedia</SelectItem>
                          <SelectItem value="unavailable">Tidak Tersedia</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32 border-2 border-gray-200 rounded-xl">
                          <SelectValue placeholder="Urutkan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Nama</SelectItem>
                          <SelectItem value="price-low">Harga Terendah</SelectItem>
                          <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                          <SelectItem value="created">Terbaru</SelectItem>
                          <SelectItem value="orders">Pesanan</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-lg"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-lg"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Products Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="h-full"
                      >
                        <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                          <CardHeader className="p-4">
                            <div className="relative">
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-full h-40 object-cover rounded-xl"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                  <Package className="w-12 h-12 text-gray-400" />
                                </div>
                              )}
                              
                              {/* Status Badge */}
                              <div className="absolute top-2 right-2">
                                <Badge className={`${
                                  product.isAvailable 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-red-500 text-white'
                                }`}>
                                  {product.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
                                </Badge>
                              </div>

                              {/* Rating */}
                              {product.averageRating && (
                                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-lg flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs">{product.averageRating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                              <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-lg font-bold text-red-600">Rp {product.price.toLocaleString('id-ID')}</p>
                                <p className="text-xs text-gray-500">{product.category.name}</p>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => toggleProductAvailability(product.id)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    {product.isAvailable ? 'Sembunyikan' : 'Tampilkan'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => router.push(`/admin/products/edit/${product.id}`)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => deleteProduct(product.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Stats */}
                            {product.totalOrders && (
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>{product.totalOrders} pesanan</span>
                                </div>
                                {product.totalRevenue && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    <span>Rp {product.totalRevenue.toLocaleString('id-ID')}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAndSortedProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, x: 5 }}
                      >
                        <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-6">
                              {/* Product Image */}
                              <div className="relative">
                                {product.image ? (
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-20 h-20 object-cover rounded-xl"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                                
                                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                                  product.isAvailable ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                              </div>

                              {/* Product Info */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                                    <p className="text-gray-600 mb-2">{product.description}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                      <Badge variant="secondary">{product.category.name}</Badge>
                                      {product.averageRating && (
                                        <div className="flex items-center gap-1">
                                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                          <span>{product.averageRating.toFixed(1)}</span>
                                          <span className="text-gray-500">({product.reviewCount})</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="text-right">
                                    <p className="text-xl font-bold text-red-600">Rp {product.price.toLocaleString('id-ID')}</p>
                                    <Badge className={`${
                                      product.isAvailable 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {product.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Stats */}
                                {product.totalOrders && (
                                  <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <TrendingUp className="w-4 h-4" />
                                      <span>{product.totalOrders} pesanan</span>
                                    </div>
                                    {product.totalRevenue && (
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        <span>Rp {product.totalRevenue.toLocaleString('id-ID')}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleProductAvailability(product.id)}
                                >
                                  {product.isAvailable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteProduct(product.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {filteredAndSortedProducts.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
                    <p className="text-gray-500 mb-6">Coba ubah filter atau tambah produk baru</p>
                    <Button
                      onClick={() => router.push('/admin/products/create')}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Produk
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus Produk</DialogTitle>
              <DialogDescription>
                {productToDelete && (
                  <div>
                    <p>Produk <strong>{productToDelete.name}</strong> tidak dapat dihapus karena sudah ada dalam pesanan atau keranjang belanja.</p>
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Pilihan:</strong><br />
                        1. Klik "Hapus Paksa" untuk menghapus beserta semua data terkait<br />
                        2. Klik "Sembunyikan" untuk menyembunyikan produk dari menu
                      </p>
                    </div>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={forceDeleteProduct}
              >
                Hapus Paksa
              </Button>
              <Button
                onClick={() => {
                  if (productToDelete) {
                    toggleProductAvailability(productToDelete.id);
                    setDeleteDialogOpen(false);
                  }
                }}
              >
                Sembunyikan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminAuthWrapper>
  );
}