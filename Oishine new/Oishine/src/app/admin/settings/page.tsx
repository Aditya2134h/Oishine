'use client';

import React, { useState, useEffect } from 'react';
import { Settings, User, Lock, Store, BarChart3, Save, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Users, Upload, Plus, Trash2, Edit2, Camera, X, Tag, Calendar, Percent, DollarSign, Phone, Clock, MapPin, Mail, Download, RefreshCw, ShoppingCart, TrendingUp, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdminAuthWrapper from '@/components/admin-auth-wrapper';
import ImageWithFallback from '@/components/ui/image-with-fallback';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  email?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  isActive: boolean;
  createdAt: string;
}

interface Voucher {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  userLimit?: number;
  isActive: boolean;
  validFrom: string;
  validTo: string;
  createdAt: string;
}

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeDescription: string;
  currency: string;
  taxRate: number;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  weekdayHours: string;
  weekendHours: string;
  holidayHours: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

export default function AdminSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    id: '1',
    name: 'Admin User',
    email: 'admin@oishine.com',
    role: 'Super Admin',
    isActive: true,
    createdAt: new Date().toISOString()
  });
  const [originalAdminProfile, setOriginalAdminProfile] = useState<AdminProfile | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'Oishine!',
    storeEmail: 'admin@oishine.com',
    storePhone: '+62 812-3456-7890',
    storeAddress: 'Purwokerto, Indonesia',
    storeDescription: 'Delicious Japanese Food Delivery - Purwokerto',
    currency: 'IDR',
    taxRate: 11,
    contactEmail: 'info@oishine.com',
    contactPhone: '+62 21 1234 5678',
    contactAddress: 'Jl. Jend. Gatot Subroto No. 30, Purwokerto',
    instagram: '',
    facebook: '',
    twitter: '',
    weekdayHours: '10:00 - 22:00',
    weekendHours: '10:00 - 23:00',
    holidayHours: '10:00 - 23:00'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('7d');
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [teamForm, setTeamForm] = useState({
    name: '',
    role: '',
    image: '',
    bio: '',
    email: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    isActive: true
  });
  const [voucherForm, setVoucherForm] = useState({
    code: '',
    name: '',
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    userLimit: '',
    validFrom: '',
    validTo: '',
    isActive: true
  });

  // Load admin profile
  const loadAdminProfile = async () => {
    try {
      const response = await fetch('/api/admin/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setAdminProfile(data.user);
        } else {
          // Fallback data for demo
          setAdminProfile({
            id: '1',
            name: 'Admin User',
            email: 'admin@oishine.com',
            role: 'Super Admin',
            isActive: true,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // Fallback data for demo
        setAdminProfile({
          id: '1',
          name: 'Admin User',
          email: 'admin@oishine.com',
          role: 'Super Admin',
          isActive: true,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
      // Fallback data for demo
      setAdminProfile({
        id: '1',
        name: 'Admin User',
        email: 'admin@oishine.com',
        role: 'Super Admin',
        isActive: true,
        createdAt: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load store settings
  const loadStoreSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/store');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Normalize: ensure social fields are always strings, never undefined
          const normalized = {
            ...data.data,
            instagram: data.data.instagram || '',
            facebook: data.data.facebook || '',
            twitter: data.data.twitter || ''
          };
          setStoreSettings(normalized);
        }
      }
    } catch (error) {
      console.error('Error loading store settings:', error);
    }
  };

  // Load analytics data
  const loadAnalytics = async (period: string = '7d') => {
    setIsLoadingAnalytics(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalyticsData(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Gagal memuat data analytics');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Load team members
  const loadTeamMembers = async () => {
    setIsLoadingTeam(true);
    try {
      const response = await fetch('/api/admin/team');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTeamMembers(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Gagal memuat data tim');
    } finally {
      setIsLoadingTeam(false);
    }
  };

  // Load vouchers
  const loadVouchers = async () => {
    setIsLoadingVouchers(true);
    try {
      const response = await fetch('/api/admin/vouchers');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVouchers(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error('Gagal memuat data voucher');
    } finally {
      setIsLoadingVouchers(false);
    }
  };

  useEffect(() => {
    loadAdminProfile();
    loadStoreSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics(analyticsPeriod);
    } else if (activeTab === 'team') {
      loadTeamMembers();
    } else if (activeTab === 'vouchers') {
      loadVouchers();
    }
  }, [activeTab, analyticsPeriod]);

  // Reset admin profile form
  const resetAdminProfile = () => {
    if (originalAdminProfile) {
      setAdminProfile({...originalAdminProfile});
    }
  };

  // Update admin profile
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!adminProfile.name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }

    if (!adminProfile.email.trim()) {
      toast.error('Email tidak boleh kosong');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminProfile.email)) {
      toast.error('Format email tidak valid');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminProfile.name,
          email: adminProfile.email
        })
      });

      if (response.ok) {
        toast.success('Profil berhasil diperbarui');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui profil');
    } finally {
      setIsSaving(false);
    }
  };

  // Update password
  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!passwordForm.currentPassword.trim()) {
      toast.error('Password saat ini tidak boleh kosong');
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      toast.error('Password baru tidak boleh kosong');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    if (!passwordForm.confirmPassword.trim()) {
      toast.error('Konfirmasi password tidak boleh kosong');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password baru tidak cocok dengan konfirmasi');
      return;
    }

    // Check if new password is same as current
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error('Password baru harus berbeda dengan password saat ini');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        toast.success('Password berhasil diperbarui');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui password');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset store settings to original values
  const resetStoreSettings = async () => {
    await loadStoreSettings();
    toast.info('Pengaturan toko telah direset');
  };

  // Update store settings
  const updateStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!storeSettings.storeName.trim()) {
      toast.error('Nama toko tidak boleh kosong');
      return;
    }

    if (!storeSettings.storeEmail.trim()) {
      toast.error('Email toko tidak boleh kosong');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(storeSettings.storeEmail)) {
      toast.error('Format email toko tidak valid');
      return;
    }

    if (!storeSettings.storePhone.trim()) {
      toast.error('Telepon toko tidak boleh kosong');
      return;
    }

    if (!storeSettings.storeAddress.trim()) {
      toast.error('Alamat toko tidak boleh kosong');
      return;
    }

    if (storeSettings.taxRate < 0 || storeSettings.taxRate > 100) {
      toast.error('Pajak harus antara 0% dan 100%');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeSettings)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Pengaturan toko berhasil disimpan');
          await loadStoreSettings();
        } else {
          throw new Error(data.error || 'Failed to save settings');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error updating store settings:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan pengaturan toko');
    } finally {
      setIsSaving(false);
    }
  };

  // Team member functions
  const resetTeamForm = () => {
    setTeamForm({
      name: '',
      role: '',
      image: '',
      bio: '',
      email: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      isActive: true
    });
    setEditingTeamMember(null);
  };

  const handleAddTeamMember = () => {
    resetTeamForm();
    setShowTeamForm(true);
  };

  const handleEditTeamMember = (member: TeamMember) => {
    setTeamForm({
      name: member.name,
      role: member.role,
      image: member.image,
      bio: member.bio,
      email: member.email || '',
      instagram: member.instagram || '',
      twitter: member.twitter || '',
      linkedin: member.linkedin || '',
      isActive: member.isActive
    });
    setEditingTeamMember(member);
    setShowTeamForm(true);
  };

  const handleSaveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamForm.name.trim() || !teamForm.role.trim() || !teamForm.image.trim() || !teamForm.bio.trim()) {
      toast.error('Nama, peran, gambar, dan bio wajib diisi');
      return;
    }

    try {
      const url = editingTeamMember 
        ? `/api/admin/team/${editingTeamMember.id}`
        : '/api/admin/team';
      const method = editingTeamMember ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm)
      });

      if (response.ok) {
        toast.success(editingTeamMember ? 'Anggota tim berhasil diperbarui' : 'Anggota tim berhasil ditambahkan');
        setShowTeamForm(false);
        resetTeamForm();
        loadTeamMembers();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save team member');
      }
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan anggota tim');
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus anggota tim ini?')) return;

    try {
      const response = await fetch(`/api/admin/team/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Anggota tim berhasil dihapus');
        loadTeamMembers();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete team member');
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus anggota tim');
    }
  };

  // Voucher functions
  const resetVoucherForm = () => {
    setVoucherForm({
      code: '',
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      userLimit: '',
      validFrom: '',
      validTo: '',
      isActive: true
    });
    setEditingVoucher(null);
  };

  const handleAddVoucher = () => {
    resetVoucherForm();
    setShowVoucherForm(true);
  };

  const handleEditVoucher = (voucher: Voucher) => {
    setVoucherForm({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || '',
      type: voucher.type,
      value: voucher.value.toString(),
      minOrderAmount: voucher.minOrderAmount?.toString() || '',
      maxDiscountAmount: voucher.maxDiscountAmount?.toString() || '',
      usageLimit: voucher.usageLimit?.toString() || '',
      userLimit: voucher.userLimit?.toString() || '',
      validFrom: new Date(voucher.validFrom).toISOString().split('T')[0],
      validTo: new Date(voucher.validTo).toISOString().split('T')[0],
      isActive: voucher.isActive
    });
    setEditingVoucher(voucher);
    setShowVoucherForm(true);
  };

  const handleSaveVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!voucherForm.code.trim() || !voucherForm.name.trim() || !voucherForm.value || !voucherForm.validFrom || !voucherForm.validTo) {
      toast.error('Kode, nama, nilai, dan periode valid wajib diisi');
      return;
    }

    try {
      const payload = {
        ...voucherForm,
        value: parseInt(voucherForm.value),
        minOrderAmount: voucherForm.minOrderAmount ? parseInt(voucherForm.minOrderAmount) : null,
        maxDiscountAmount: voucherForm.maxDiscountAmount ? parseInt(voucherForm.maxDiscountAmount) : null,
        usageLimit: voucherForm.usageLimit ? parseInt(voucherForm.usageLimit) : null,
        userLimit: voucherForm.userLimit ? parseInt(voucherForm.userLimit) : null,
        validFrom: new Date(voucherForm.validFrom).toISOString(),
        validTo: new Date(voucherForm.validTo).toISOString()
      };

      const url = editingVoucher 
        ? `/api/admin/vouchers/${editingVoucher.id}`
        : '/api/admin/vouchers';
      const method = editingVoucher ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(editingVoucher ? 'Voucher berhasil diperbarui' : 'Voucher berhasil dibuat');
        setShowVoucherForm(false);
        resetVoucherForm();
        loadVouchers();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save voucher');
      }
    } catch (error) {
      console.error('Error saving voucher:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan voucher');
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus voucher ini?')) return;

    try {
      const response = await fetch(`/api/admin/vouchers/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Voucher berhasil dihapus');
        loadVouchers();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete voucher');
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus voucher');
    }
  };

  const handleLogout = () => {
    // Clear authentication tokens
    localStorage.removeItem('admin-token');
    sessionStorage.removeItem('admin-token');
    
    // Redirect to login page
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4"
          >
            <img src="/oishine-logo-custom.png" alt="OISHINE!" className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-full" />
          </motion.div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
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
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <img src="/oishine-logo-custom.png" alt="OISHINE!" className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded-full" />
                </motion.div>
                <h1 className="ml-2 sm:ml-3 text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Pengaturan
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        <div className="max-w-4xl sm:max-w-6xl mx-auto">
          {/* Tab Navigation - Responsive */}
          <div className="bg-white rounded-lg shadow mb-4 sm:mb-6 overflow-hidden">
            <div className="border-b border-gray-200">
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex -mb-px px-4 sm:px-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'profile'
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Profil</span>
                    <span className="sm:hidden">👤</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'security'
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Keamanan</span>
                    <span className="sm:hidden">🔒</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('store')}
                  className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'store'
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Toko</span>
                    <span className="sm:hidden">🏪</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'team'
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Tim</span>
                    <span className="sm:hidden">👥</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('vouchers')}
                  className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'vouchers'
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Voucher</span>
                    <span className="sm:hidden">🏷️</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'contact'
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Kontak</span>
                    <span className="sm:hidden">📞</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('system')}
                  className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'system'
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Sistem</span>
                    <span className="sm:hidden">⚙️</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'analytics'
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Analytics</span>
                    <span className="sm:hidden">📊</span>
                  </div>
                </button>
              </nav>
              
              {/* Mobile Dropdown */}
              <div className="lg:hidden px-4 sm:px-6 py-3 sm:py-4">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                >
                  <option value="profile">👤 Profil Admin</option>
                  <option value="security">🔒 Keamanan</option>
                  <option value="store">🏪 Pengaturan Toko</option>
                  <option value="team">👥 Tim Profesional</option>
                  <option value="vouchers">🏷️ Promo/Voucher</option>
                  <option value="contact">📞 Informasi Kontak</option>
                  <option value="system">⚙️ Sistem</option>
                  <option value="analytics">📊 Analytics</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-4 sm:p-6 lg:p-8">
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  </div>
                )}
                {!isLoading && (
                  <>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Informasi Profil</h2>
                      <p className="text-gray-600">Kelola informasi pribadi dan data akun admin Anda</p>
                    </div>
                    <form onSubmit={updateProfile} className="space-y-8">
                  {/* Profile Picture Section */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-red-600" />
                      </div>
                      Foto Profil
                    </h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-lg">
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <User className="w-12 h-12 text-gray-500" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <button
                          type="button"
                          className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 transition-colors shadow-sm"
                        >
                          <Camera className="w-4 h-4" />
                          Upload Foto
                        </button>
                        <button
                          type="button"
                          className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Hapus Foto
                        </button>
                        <p className="text-xs text-gray-500">
                          Format: JPG, PNG. Maksimal 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-red-600" />
                      </div>
                      Informasi Pribadi
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nama Lengkap *
                        </label>
                        <input
                          type="text"
                          value={adminProfile.name}
                          onChange={(e) => setAdminProfile({...adminProfile, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="Masukkan nama lengkap"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={adminProfile.email}
                          onChange={(e) => setAdminProfile({...adminProfile, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <Lock className="w-4 h-4 text-red-600" />
                      </div>
                      Informasi Akun
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Role
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={adminProfile.role}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Lock className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Role hanya dapat diubah oleh Super Admin
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Status Akun
                        </label>
                        <div className="flex items-center h-12">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                            adminProfile.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {adminProfile.isActive ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Aktif
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-2" />
                                Tidak Aktif
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Status akun saat ini
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Simpan Perubahan
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetAdminProfile}
                      className="px-8 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
                  </>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6 lg:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Keamanan</h2>
                  <p className="text-gray-600">Kelola password dan pengaturan keamanan akun Anda</p>
                </div>
                
                <div className="space-y-8">
                  {/* Change Password Section */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <Lock className="w-4 h-4 text-red-600" />
                      </div>
                      Ubah Password
                    </h3>
                    <form onSubmit={updatePassword} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password Saat Ini
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all pr-12"
                            placeholder="Masukkan password saat ini"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password Baru
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all pr-12"
                            placeholder="Masukkan password baru"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Konfirmasi Password Baru
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="Konfirmasi password baru"
                          required
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Memperbarui...
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              Ubah Password
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                          className="px-8 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Security Tips */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                      Tips Keamanan
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                        Gunakan password yang kuat dengan kombinasi huruf, angka, dan simbol
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                        Jangan berbagi password Anda dengan orang lain
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                        Ganti password secara berkala untuk keamanan maksimal
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                        Logout setelah selesai menggunakan admin panel
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Store Settings Tab */}
            {activeTab === 'store' && (
              <div className="p-6 lg:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan Toko</h2>
                  <p className="text-gray-600">Kelola informasi dan konfigurasi toko Anda</p>
                </div>
                
                <form onSubmit={updateStoreSettings} className="space-y-8">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <Store className="w-4 h-4 text-red-600" />
                      </div>
                      Informasi Dasar
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nama Toko *
                        </label>
                        <input
                          type="text"
                          value={storeSettings.storeName}
                          onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="Masukkan nama toko"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Toko *
                        </label>
                        <input
                          type="email"
                          value={storeSettings.storeEmail}
                          onChange={(e) => setStoreSettings({...storeSettings, storeEmail: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="toko@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Telepon Toko *
                        </label>
                        <input
                          type="tel"
                          value={storeSettings.storePhone}
                          onChange={(e) => setStoreSettings({...storeSettings, storePhone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="+62 812-3456-7890"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Alamat Toko *
                        </label>
                        <input
                          type="text"
                          value={storeSettings.storeAddress}
                          onChange={(e) => setStoreSettings({...storeSettings, storeAddress: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="Jakarta, Indonesia"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Deskripsi Toko
                      </label>
                      <textarea
                        value={storeSettings.storeDescription}
                        onChange={(e) => setStoreSettings({...storeSettings, storeDescription: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                        placeholder="Deskripsikan tentang toko Anda..."
                      />
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-gray-800 mb-3">Social Links</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                          <input
                            type="text"
                            value={(storeSettings as any).instagram}
                            onChange={(e) => setStoreSettings({...storeSettings, instagram: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="https://instagram.com/yourhandle or @handle"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                          <input
                            type="text"
                            value={(storeSettings as any).facebook}
                            onChange={(e) => setStoreSettings({...storeSettings, facebook: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="https://facebook.com/yourpage"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
                          <input
                            type="text"
                            value={(storeSettings as any).twitter}
                            onChange={(e) => setStoreSettings({...storeSettings, twitter: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="https://x.com/yourhandle or @handle"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Settings */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <DollarSign className="w-4 h-4 text-red-600" />
                      </div>
                      Pengaturan Finansial
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Mata Uang
                        </label>
                        <select
                          value={storeSettings.currency}
                          onChange={(e) => setStoreSettings({...storeSettings, currency: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        >
                          <option value="IDR">Indonesian Rupiah (IDR)</option>
                          <option value="USD">US Dollar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Pajak (%)
                        </label>
                        <input
                          type="number"
                          value={storeSettings.taxRate}
                          onChange={(e) => setStoreSettings({...storeSettings, taxRate: parseFloat(e.target.value) || 0})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="11"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Simpan Pengaturan
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetStoreSettings}
                      className="px-8 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="p-6 lg:p-8">
                <div className="mb-8 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Tim Profesional</h2>
                    <p className="text-gray-600">Kelola anggota tim dan informasi profesional</p>
                  </div>
                  <button
                    onClick={handleAddTeamMember}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Anggota
                  </button>
                </div>

                {isLoadingTeam ? (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="mx-auto mb-4"
                    >
                      <img src="/oishine-logo-custom.png" alt="OISHINE!" className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded-full" />
                    </motion.div>
                    <p className="text-gray-600">Memuat data tim...</p>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Anggota Tim</h3>
                    <p className="text-gray-500 mb-6">Mulai dengan menambahkan anggota tim pertama Anda</p>
                    <button
                      onClick={handleAddTeamMember}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Tambah Anggota Tim
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <ImageWithFallback
                                src={member.image}
                                alt={member.name}
                                className="w-12 h-12 rounded-full object-cover"
                                fallbackClassName="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100"
                                fallbackText={member.name}
                                iconSize={20}
                              />
                              <div>
                                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                                <p className="text-sm text-gray-600">{member.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                              <span className="text-xs text-gray-500">
                                {member.isActive ? 'Aktif' : 'Non-aktif'}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{member.bio}</p>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                            {member.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{member.email}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditTeamMember(member)}
                              className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            >
                              <Edit2 className="w-3 h-3 inline mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTeamMember(member.id)}
                              className="flex-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-3 h-3 inline mr-1" />
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Team Form Modal */}
                {showTeamForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {editingTeamMember ? 'Edit Anggota Tim' : 'Tambah Anggota Tim Baru'}
                          </h3>
                          <button
                            onClick={() => setShowTeamForm(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <form onSubmit={handleSaveTeamMember} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nama *
                            </label>
                            <input
                              type="text"
                              value={teamForm.name}
                              onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Peran *
                            </label>
                            <input
                              type="text"
                              value={teamForm.role}
                              onChange={(e) => setTeamForm({...teamForm, role: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              required
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Bio *
                            </label>
                            <textarea
                              value={teamForm.bio}
                              onChange={(e) => setTeamForm({...teamForm, bio: e.target.value})}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={teamForm.email}
                              onChange={(e) => setTeamForm({...teamForm, email: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              URL Foto *
                            </label>
                            <input
                              type="url"
                              value={teamForm.image}
                              onChange={(e) => setTeamForm({...teamForm, image: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="https://example.com/photo.jpg"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Masukkan URL foto lengkap (contoh: https://example.com/photo.jpg)
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Instagram
                            </label>
                            <input
                              type="text"
                              value={teamForm.instagram}
                              onChange={(e) => setTeamForm({...teamForm, instagram: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="@username"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Twitter
                            </label>
                            <input
                              type="text"
                              value={teamForm.twitter}
                              onChange={(e) => setTeamForm({...teamForm, twitter: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="@username"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              LinkedIn
                            </label>
                            <input
                              type="text"
                              value={teamForm.linkedin}
                              onChange={(e) => setTeamForm({...teamForm, linkedin: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="@handle or full URL"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={teamForm.isActive}
                                onChange={(e) => setTeamForm({...teamForm, isActive: e.target.checked})}
                                className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                              />
                              <span className="text-sm font-medium text-gray-700">Aktif</span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setShowTeamForm(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            {editingTeamMember ? 'Perbarui' : 'Simpan'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vouchers Tab */}
            {activeTab === 'vouchers' && (
              <div className="p-6 lg:p-8">
                <div className="mb-8 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Promo/Voucher</h2>
                    <p className="text-gray-600">Kelola voucher dan promosi untuk pelanggan</p>
                  </div>
                  <button
                    onClick={handleAddVoucher}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Buat Voucher
                  </button>
                </div>

                {isLoadingVouchers ? (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="mx-auto mb-4"
                    >
                      <img src="/oishine-logo-custom.png" alt="OISHINE!" className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded-full" />
                    </motion.div>
                    <p className="text-gray-600">Memuat data voucher...</p>
                  </div>
                ) : vouchers.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Voucher</h3>
                    <p className="text-gray-500 mb-6">Mulai dengan membuat voucher pertama Anda</p>
                    <button
                      onClick={handleAddVoucher}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Buat Voucher Baru
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vouchers.map((voucher) => {
                      const now = new Date();
                      const validFrom = new Date(voucher.validFrom);
                      const validTo = new Date(voucher.validTo);
                      const isActive = voucher.isActive && validFrom <= now && validTo >= now;
                      const isExpired = validTo < now;
                      const isUpcoming = validFrom > now;
                      
                      return (
                        <div key={voucher.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-gray-900">{voucher.name}</h3>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    isActive 
                                      ? 'bg-green-100 text-green-800' 
                                      : isExpired 
                                        ? 'bg-red-100 text-red-800'
                                        : isUpcoming
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {isActive ? 'Aktif' : isExpired ? 'Kadaluarsa' : isUpcoming ? 'Akan Datang' : 'Non-aktif'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-4 mb-3">
                                  <code className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-sm font-mono">
                                    {voucher.code}
                                  </code>
                                  <div className="flex items-center gap-1">
                                    {voucher.type === 'PERCENTAGE' ? (
                                      <>
                                        <Percent className="w-4 h-4 text-green-600" />
                                        <span className="font-semibold text-green-600">{voucher.value}%</span>
                                      </>
                                    ) : (
                                      <>
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        <span className="font-semibold text-green-600">Rp {voucher.value.toLocaleString('id-ID')}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                
                                {voucher.description && (
                                  <p className="text-sm text-gray-600 mb-3">{voucher.description}</p>
                                )}
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                                  <div>
                                    <span className="block font-medium">Berlaku dari</span>
                                    {new Date(voucher.validFrom).toLocaleDateString('id-ID')}
                                  </div>
                                  <div>
                                    <span className="block font-medium">Berlaku sampai</span>
                                    {new Date(voucher.validTo).toLocaleDateString('id-ID')}
                                  </div>
                                  <div>
                                    <span className="block font-medium">Penggunaan</span>
                                    {voucher.usageCount}{voucher.usageLimit ? `/${voucher.usageLimit}` : ' (Tak terbatas)'}
                                  </div>
                                  {voucher.minOrderAmount && (
                                    <div>
                                      <span className="block font-medium">Min. Pembelian</span>
                                      Rp {voucher.minOrderAmount.toLocaleString('id-ID')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditVoucher(voucher)}
                                className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                              >
                                <Edit2 className="w-3 h-3 inline mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteVoucher(voucher.id)}
                                className="flex-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-3 h-3 inline mr-1" />
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Voucher Form Modal */}
                {showVoucherForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {editingVoucher ? 'Edit Voucher' : 'Buat Voucher Baru'}
                          </h3>
                          <button
                            onClick={() => setShowVoucherForm(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <form onSubmit={handleSaveVoucher} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Kode Voucher *
                            </label>
                            <input
                              type="text"
                              value={voucherForm.code}
                              onChange={(e) => setVoucherForm({...voucherForm, code: e.target.value.toUpperCase()})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                              placeholder="DISKON10"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nama Voucher *
                            </label>
                            <input
                              type="text"
                              value={voucherForm.name}
                              onChange={(e) => setVoucherForm({...voucherForm, name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Diskon 10%"
                              required
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Deskripsi
                            </label>
                            <textarea
                              value={voucherForm.description}
                              onChange={(e) => setVoucherForm({...voucherForm, description: e.target.value})}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Diskon khusus untuk pelanggan setia"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tipe Voucher *
                            </label>
                            <select
                              value={voucherForm.type}
                              onChange={(e) => setVoucherForm({...voucherForm, type: e.target.value as 'PERCENTAGE' | 'FIXED'})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="PERCENTAGE">Persentase (%)</option>
                              <option value="FIXED">Nominal (Rp)</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nilai Voucher *
                            </label>
                            <input
                              type="number"
                              value={voucherForm.value}
                              onChange={(e) => setVoucherForm({...voucherForm, value: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder={voucherForm.type === 'PERCENTAGE' ? '10' : '10000'}
                              min="0"
                              max={voucherForm.type === 'PERCENTAGE' ? '100' : undefined}
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Minimum Pembelian
                            </label>
                            <input
                              type="number"
                              value={voucherForm.minOrderAmount}
                              onChange={(e) => setVoucherForm({...voucherForm, minOrderAmount: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="50000"
                              min="0"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Maksimum Diskon
                            </label>
                            <input
                              type="number"
                              value={voucherForm.maxDiscountAmount}
                              onChange={(e) => setVoucherForm({...voucherForm, maxDiscountAmount: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="20000"
                              min="0"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Batas Penggunaan Total
                            </label>
                            <input
                              type="number"
                              value={voucherForm.usageLimit}
                              onChange={(e) => setVoucherForm({...voucherForm, usageLimit: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="100"
                              min="1"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Batas Penggunaan Per User
                            </label>
                            <input
                              type="number"
                              value={voucherForm.userLimit}
                              onChange={(e) => setVoucherForm({...voucherForm, userLimit: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="1"
                              min="1"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Berlaku Dari *
                            </label>
                            <input
                              type="date"
                              value={voucherForm.validFrom}
                              onChange={(e) => setVoucherForm({...voucherForm, validFrom: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Berlaku Sampai *
                            </label>
                            <input
                              type="date"
                              value={voucherForm.validTo}
                              onChange={(e) => setVoucherForm({...voucherForm, validTo: e.target.value})}
                              min={voucherForm.validFrom}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              required
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={voucherForm.isActive}
                                onChange={(e) => setVoucherForm({...voucherForm, isActive: e.target.checked})}
                                className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                              />
                              <span className="text-sm font-medium text-gray-700">Aktif</span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setShowVoucherForm(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            {editingVoucher ? 'Perbarui' : 'Simpan'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="p-6 lg:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Informasi Kontak</h2>
                  <p className="text-gray-600">Kelola informasi kontak dan layanan pelanggan</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Store Contact Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Store className="w-5 h-5 text-red-500" />
                      Informasi Toko
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email Toko</p>
                          <p className="font-medium">{storeSettings.storeEmail}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Telepon Toko</p>
                          <p className="font-medium">{storeSettings.storePhone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Alamat Toko</p>
                          <p className="font-medium">{storeSettings.storeAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Customer Service Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-red-500" />
                      Layanan Pelanggan
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email Layanan</p>
                          <p className="font-medium">{storeSettings.contactEmail}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Telepon Layanan</p>
                          <p className="font-medium">{storeSettings.contactPhone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Alamat Kantor</p>
                          <p className="font-medium">{storeSettings.contactAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Operating Hours */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-red-500" />
                      Jam Operasional
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Hari Kerja</p>
                        <p className="font-semibold text-lg">{storeSettings.weekdayHours}</p>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Akhir Pekan</p>
                        <p className="font-semibold text-lg">{storeSettings.weekendHours}</p>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Hari Libur</p>
                        <p className="font-semibold text-lg">{storeSettings.holidayHours}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                        <Mail className="w-4 h-4" />
                        Kirim Email Test
                      </button>
                      
                      <button className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                        <Phone className="w-4 h-4" />
                        Test Call Center
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab('store')}
                        className="flex items-center justify-center gap-2 p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Informasi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="p-6 lg:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan Sistem</h2>
                  <p className="text-gray-600">Kelola konfigurasi sistem dan pengaturan lanjutan</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* System Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-red-500" />
                      Informasi Sistem
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Versi Aplikasi</span>
                        <span className="font-medium">v1.0.0</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Lingkungan</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Production</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Database</span>
                        <span className="font-medium">SQLite</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Framework</span>
                        <span className="font-medium">Next.js 15</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Status API</span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-sm text-green-600">Online</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* System Configuration */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-red-500" />
                      Konfigurasi
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Mata Uang</span>
                        <span className="font-medium">{storeSettings.currency}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Pajak</span>
                        <span className="font-medium">{storeSettings.taxRate}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Biaya Kirim Standar</span>
                        <span className="font-medium">Rp 10.000</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Bebas Kirim Minimum</span>
                        <span className="font-medium">Rp 50.000</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Maks Pre-order Hari</span>
                        <span className="font-medium">7 hari</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* System Actions */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tindakan Sistem</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                        <RefreshCw className="w-5 h-5" />
                        <span className="text-sm font-medium">Cache Clear</span>
                      </button>
                      
                      <button className="flex flex-col items-center gap-2 p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                        <Download className="w-5 h-5" />
                        <span className="text-sm font-medium">Backup Data</span>
                      </button>
                      
                      <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                        <BarChart3 className="w-5 h-5" />
                        <span className="text-sm font-medium">System Logs</span>
                      </button>
                      
                      <button className="flex flex-col items-center gap-2 p-4 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-sm font-medium">Performance</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Statistics */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Sistem</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
                        <p className="text-sm text-gray-500">Total Pesanan</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">5</div>
                        <p className="text-sm text-gray-500">Total Produk</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">1</div>
                        <p className="text-sm text-gray-500">Voucher Aktif</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-1">3</div>
                        <p className="text-sm text-gray-500">Driver Aktif</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Settings */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Cepat</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Maintenance Mode</p>
                          <p className="text-sm text-gray-500">Matikan sementara toko untuk maintenance</p>
                        </div>
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                          Non-aktif
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Debug Mode</p>
                          <p className="text-sm text-gray-500">Tampilkan informasi debug untuk development</p>
                        </div>
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                          Non-aktif
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Kirim notifikasi email untuk pesanan baru</p>
                        </div>
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                          Aktif
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="p-6 lg:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
                  <p className="text-gray-600">Lihat analitik dan performa bisnis Anda</p>
                </div>
                
                {isLoadingAnalytics ? (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="mx-auto mb-4"
                    >
                      <img src="/oishine-logo-custom.png" alt="OISHINE!" className="w-16 h-16 object-cover rounded-full" />
                    </motion.div>
                    <p className="text-gray-500">Memuat data analytics...</p>
                  </div>
                ) : analyticsData ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Ringkasan Performa</h3>
                        <select
                          value={analyticsPeriod}
                          onChange={(e) => setAnalyticsPeriod(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        >
                          <option value="7d">7 Hari Terakhir</option>
                          <option value="30d">30 Hari Terakhir</option>
                          <option value="90d">90 Hari Terakhir</option>
                          <option value="1y">1 Tahun Terakhir</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="text-sm text-gray-500">Total Orders</div>
                          <div className="text-2xl font-bold text-gray-900">{analyticsData.summary?.totalOrders || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="text-sm text-gray-500">Total Revenue</div>
                          <div className="text-2xl font-bold text-gray-900">Rp {analyticsData.summary?.totalRevenue?.toLocaleString('id-ID') || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="text-sm text-gray-500">Average Order</div>
                          <div className="text-2xl font-bold text-gray-900">Rp {analyticsData.summary?.avgOrderValue?.toLocaleString('id-ID') || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="text-sm text-gray-500">Total Profit</div>
                          <div className="text-2xl font-bold text-gray-900">Rp {analyticsData.summary?.totalProfit?.toLocaleString('id-ID') || 0}</div>
                        </div>
                      </div>
                    </div>
                    
                    {analyticsData.topProducts && analyticsData.topProducts.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Produk Terlaris</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Produk</th>
                                <th className="text-right py-2">Qty</th>
                                <th className="text-right py-2">Revenue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analyticsData.topProducts.slice(0, 5).map((product: any, index: number) => (
                                <tr key={index} className="border-b">
                                  <td className="py-2">{product.name}</td>
                                  <td className="text-right py-2">{product.quantity}</td>
                                  <td className="text-right py-2">Rp {product.totalRevenue?.toLocaleString('id-ID')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Data Analytics</h3>
                    <p className="text-gray-500 mb-6">Belum ada data analytics tersedia</p>
                    <button 
                      onClick={() => loadAnalytics(analyticsPeriod)}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 inline mr-2" />
                      Muat Ulang Data
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    </AdminAuthWrapper>
  );
}