'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X, Image as ImageIcon, Upload, Package, DollarSign, FileText, Tag, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import CreateCategoryModal from '@/components/admin/CreateCategoryModal'

interface Category {
  id: string;
  name: string;
  description: string;
  _count: { products: number };
}

export default function CreateProduct() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    ingredients: '',
    categoryId: '',
    isAvailable: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)

  useEffect(() => {
    checkAuth();
    loadCategories();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('admin-token');
      
      const response = await fetch('/api/admin/auth/me', {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      if (!response.ok) {
        localStorage.removeItem('admin-token');
        router.push('/login');
        return;
      }
      
      const data = await response.json();
      if (!data.success) {
        localStorage.removeItem('admin-token');
        router.push('/login');
        return;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('admin-token');
      router.push('/login');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
          console.log('Categories loaded:', data.data.length);
        }
      } else {
        console.error('Failed to load categories:', response.status);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name);
  };

  const validateField = (name: string) => {
    const newErrors: Record<string, string> = {};
    
    switch (name) {
      case 'name':
        if (!formData.name.trim()) {
          newErrors.name = 'Nama produk wajib diisi';
        } else if (formData.name.length < 3) {
          newErrors.name = 'Nama produk minimal 3 karakter';
        }
        break;
      case 'description':
        if (!formData.description.trim()) {
          newErrors.description = 'Deskripsi wajib diisi';
        } else if (formData.description.length < 10) {
          newErrors.description = 'Deskripsi minimal 10 karakter';
        }
        break;
      case 'price':
        if (!formData.price || parseFloat(formData.price) <= 0) {
          newErrors.price = 'Harga harus lebih dari 0';
        }
        break;
      case 'categoryId':
        if (!formData.categoryId) {
          newErrors.categoryId = 'Kategori wajib dipilih';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const fields = ['name', 'description', 'price', 'categoryId'];
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // For now, just create a preview URL
      // In production, you would upload to a service like Cloudinary or AWS S3
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: previewUrl }));
      toast.success('Gambar berhasil diunggah');
    } catch (error) {
      toast.error('Gagal mengunggah gambar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Mohon perbaiki error pada form');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('admin-token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowSuccess(true);
        toast.success('Produk berhasil ditambahkan!');
        
        // Reset form after success
        setTimeout(() => {
          setFormData({
            name: '',
            description: '',
            price: '',
            image: '',
            ingredients: '',
            categoryId: '',
            isAvailable: true
          });
          setErrors({});
          setTouched({});
          setShowSuccess(false);
          router.push('/admin/products');
        }, 2000);
      } else {
        toast.error(data.error || 'Gagal menambahkan produk');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Terjadi kesalahan saat menambahkan produk');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/admin/products')}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Kembali</span>
              </motion.button>
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg"
                >
                  <Package className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    Tambah Produk Baru
                  </h1>
                  <p className="text-sm text-gray-500">Buat produk lezat untuk pelanggan</p>
                </div>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-red-100 overflow-hidden"
          >
            {/* Success Animation */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Berhasil!</h2>
                    <p className="text-gray-600">Produk berhasil ditambahkan</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress Form</span>
                  <span className="text-sm text-gray-500">
                    {Object.values(formData).filter(v => v && v !== '').length} / 7 field
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(Object.values(formData).filter(v => v && v !== '').length / 7) * 100}%` 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Basic Information Section */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Informasi Dasar</h2>
                    <p className="text-sm text-gray-500">Detail utama produk Anda</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative"
                  >
                    <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Produk <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('name')}
                        placeholder="Contoh: Mochi Premium"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                          errors.name && touched.name ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      />
                      {formData.name && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </motion.div>
                      )}
                    </div>
                    <AnimatePresence>
                      {errors.name && touched.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-1 text-sm text-red-600 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Price */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative"
                  >
                    <Label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Harga <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-lg">
                        Rp
                      </div>
                      <Input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('price')}
                        placeholder="10000"
                        min="0"
                        step="100"
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                          errors.price && touched.price ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      />
                      {formData.price && parseFloat(formData.price) > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </motion.div>
                      )}
                    </div>
                    <AnimatePresence>
                      {errors.price && touched.price && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-1 text-sm text-red-600 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.price}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.div>

              {/* Category Section */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Kategori</h2>
                    <p className="text-sm text-gray-500">Pilih kategori yang sesuai</p>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  <Select value={formData.categoryId} onValueChange={(value) => handleSelectChange('categoryId', value)}>
                    <SelectTrigger className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                      errors.categoryId && touched.categoryId ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full" />
                            {category.name}
                            <Badge variant="secondary" className="ml-auto">
                              {category._count?.products || 0} produk
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" onClick={() => setIsCreateCategoryOpen(true)}>
                      Tambah Kategori
                    </Button>
                    <CreateCategoryModal
                      open={isCreateCategoryOpen}
                      onClose={() => setIsCreateCategoryOpen(false)}
                      onCreated={(cat) => {
                        // append to categories and select it
                        setCategories(prev => [cat, ...prev])
                        setFormData(prev => ({ ...prev, categoryId: cat.id }))
                      }}
                      onDeleted={(id: string) => {
                        setCategories(prev => prev.filter(c => c.id !== id))
                        if (formData.categoryId === id) {
                          setFormData(prev => ({ ...prev, categoryId: '' }))
                        }
                      }}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.categoryId && touched.categoryId && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.categoryId}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* Description Section */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Deskripsi</h2>
                    <p className="text-sm text-gray-500">Jelaskan produk Anda dengan detail</p>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('description')}
                    placeholder="Deskripsi lengkap produk..."
                    rows={4}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none ${
                      errors.description && touched.description ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                    {formData.description.length}/500 karakter
                  </div>
                  <AnimatePresence>
                    {errors.description && touched.description && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* Ingredients Section */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Bahan-bahan</h2>
                    <p className="text-sm text-gray-500">Daftar bahan yang digunakan (opsional)</p>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                >
                  <Textarea
                    id="ingredients"
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleInputChange}
                    placeholder="Daftar bahan-bahan produk..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none hover:border-gray-300"
                  />
                </motion.div>
              </motion.div>

              {/* Image Section */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Gambar Produk</h2>
                    <p className="text-sm text-gray-500">Tambahkan foto yang menarik</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Image Upload */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="url"
                          id="image"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          placeholder="https://example.com/image.jpg"
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isUploading}
                          className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200"
                        >
                          {isUploading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              Mengunggah...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Unggah
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Image Preview */}
                  <AnimatePresence>
                    {formData.image && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group"
                      >
                        <div className="relative inline-block">
                          <img 
                            src={formData.image} 
                            alt="Product preview" 
                            className="h-40 w-40 object-cover rounded-xl shadow-lg border-2 border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                            className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">Preview gambar</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Availability Section */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Ketersediaan Produk</h3>
                      <p className="text-sm text-gray-600">Aktifkan untuk membuat produk tersedia</p>
                    </div>
                  </div>
                  <Switch
                    id="isAvailable"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </motion.div>

              <Separator className="my-8" />

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-end"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    onClick={() => router.push('/admin/products')}
                    variant="outline"
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                    Batal
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Simpan Produk
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}