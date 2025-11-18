'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building,
  Truck,
  User,
  MapPin,
  Phone,
  Mail,
  Tag,
  X,
  CheckCircle,
  Calendar,
  Clock,
  Store,
  Home,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import QRISPayment from '@/components/QRISPayment';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  // Pre-order fields
  isPreOrder: boolean;
  scheduledTime: string;
  deliveryType: 'DELIVERY' | 'PICKUP' | 'DINE_IN';
  deliveryAddress?: string;
}

interface AppliedVoucher {
  id: string;
  code: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  discountAmount: number;
}

interface DeliveryZone {
  id: string;
  name: string;
  description?: string;
  deliveryFee: number;
  estimatedTime: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    // Pre-order fields
    isPreOrder: false,
    scheduledTime: '',
    deliveryType: 'DELIVERY',
    deliveryAddress: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'transfer' | 'ewallet' | 'cod'>('qris');
  const [showQRIS, setShowQRIS] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [stableOrderId, setStableOrderId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isDataPrefilled, setIsDataPrefilled] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);
  const [storeSettings, setStoreSettings] = useState({
    maxPreOrderDays: 7,
    minPreOrderHours: 2,
    weekdayHours: '10:00 - 22:00',
    weekendHours: '10:00 - 23:00',
    holidayHours: '10:00 - 23:00'
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('cart');

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('oishine-cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        console.log('Loaded cart data:', cartData);
        setCartItems(cartData);
      } catch (error) {
        console.error('Error parsing cart data:', error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
    
    // Load saved checkout form data
    const savedCheckoutData = localStorage.getItem('oishine-checkout-data');
    if (savedCheckoutData) {
      try {
        const checkoutData = JSON.parse(savedCheckoutData);
        console.log('Loaded checkout data:', checkoutData);
        
        // Check if any field has data to determine if it's pre-filled
        const hasData = checkoutData.name || checkoutData.email || checkoutData.phone || checkoutData.address;
        
        const newFormData = {
          name: checkoutData.name || '',
          email: checkoutData.email || '',
          phone: checkoutData.phone || '',
          address: checkoutData.address || '',
          city: checkoutData.city || '',
          postalCode: checkoutData.postalCode || '',
          isPreOrder: checkoutData.isPreOrder || false,
          scheduledTime: checkoutData.scheduledTime || '',
          deliveryType: checkoutData.deliveryType || 'DELIVERY',
          deliveryAddress: checkoutData.deliveryAddress || ''
        };
        
        setFormData(prev => ({
          ...prev,
          ...newFormData
        }));
        
        setIsDataPrefilled(!!hasData);
        if (hasData) {
          setOriginalFormData(newFormData);
        }
        
        // Clear the saved data after loading
        localStorage.removeItem('oishine-checkout-data');
      } catch (error) {
        console.error('Error parsing checkout data:', error);
      }
    }
    
    // Generate stable order ID once when component mounts
    setStableOrderId(generateOrderId());
    
    // Load delivery zones
    fetchDeliveryZones();
    
    // Load store settings
    fetchStoreSettings();
    
    // Add scroll event listener
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
      
      // Update active section based on scroll position
      const sections = ['cart', 'delivery', 'payment', 'summary'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchDeliveryZones = async () => {
    try {
      const response = await fetch('/api/delivery-zones');
      const result = await response.json();
      
      if (result.success) {
        setDeliveryZones(result.data);
      }
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
    }
  };

  const fetchStoreSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const result = await response.json();
      
      if (result.success) {
        setStoreSettings(prev => ({
          ...prev,
          maxPreOrderDays: result.data.maxPreOrderDays || 7,
          minPreOrderHours: result.data.minPreOrderHours || 2,
          weekdayHours: result.data.weekdayHours || '10:00 - 22:00',
          weekendHours: result.data.weekendHours || '10:00 - 23:00',
          holidayHours: result.data.holidayHours || '10:00 - 23:00'
        }));
      }
    } catch (error) {
      console.error('Error fetching store settings:', error);
    }
  };

  // Generate available time slots for pre-order
  const generateTimeSlots = (selectedDate: Date): string[] => {
    const slots: string[] = [];
    const dayOfWeek = selectedDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Get opening hours based on day
    const hours = isWeekend ? storeSettings.weekendHours : storeSettings.weekdayHours;
    const [openTime, closeTime] = hours.split(' - ').map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes; // Convert to minutes
    });
    
    // Generate slots every 30 minutes
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    for (let minutes = openTime; minutes < closeTime; minutes += 30) {
      // Skip slots that are less than minimum pre-order hours from now
      if (isToday && minutes < currentMinutes + (storeSettings.minPreOrderHours * 60)) {
        continue;
      }
      
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
    
    return slots;
  };

  // Generate available dates for pre-order
  const generateAvailableDates = (): { date: Date; label: string; isToday: boolean }[] => {
    const dates: { date: Date; label: string; isToday: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < storeSettings.maxPreOrderDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      
      const label = i === 0 
        ? 'Hari Ini' 
        : i === 1 
          ? 'Besok' 
          : `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
      
      dates.push({
        date,
        label,
        isToday: i === 0
      });
    }
    
    return dates;
  };

  const updateQuantity = (id: string, change: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = formData.deliveryType === 'DELIVERY' 
    ? (selectedZone ? selectedZone.deliveryFee : (subtotal > 50000 ? 0 : 15000))
    : 0; // Free for pickup and dine-in
  const discount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * 0.11);
  const total = Math.max(0, subtotal + shipping + tax - discount);

  // Voucher functions
  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Masukkan kode voucher');
      return;
    }

    setIsApplyingVoucher(true);
    setVoucherError('');

    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: voucherCode.trim(),
          email: formData.email,
          totalAmount: subtotal + shipping + tax
        })
      });

      const data = await response.json();

      if (data.success) {
        setAppliedVoucher({
          id: data.data.voucher.id,
          code: data.data.voucher.code,
          name: data.data.voucher.name,
          type: data.data.voucher.type,
          value: data.data.voucher.value,
          discountAmount: data.data.discountAmount
        });
        setVoucherCode('');
        setVoucherError('');
      } else {
        setVoucherError(data.error);
      }
    } catch (error) {
      console.error('Error applying voucher:', error);
      setVoucherError('Terjadi kesalahan saat menerapkan voucher');
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError('');
  };

  const handleVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyVoucher();
  };

  // Location detection functions
  const detectCustomerLocation = async () => {
    setIsCheckingLocation(true);
    setLocationError('');

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      setCustomerLocation(location);
      await checkDeliveryZone(location);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Failed to detect location');
    } finally {
      setIsCheckingLocation(false);
    }
  };

  const checkDeliveryZone = async (location: { lat: number; lng: number }) => {
    try {
      const response = await fetch(`/api/delivery-zones?lat=${location.lat}&lng=${location.lng}`);
      const result = await response.json();

      if (result.success && result.data.inDeliveryZone) {
        setSelectedZone(result.data.zone);
        setLocationError('');
      } else {
        setSelectedZone(null);
        setLocationError('Location is outside our delivery area');
      }
    } catch (error) {
      console.error('Error checking delivery zone:', error);
      setLocationError('Failed to check delivery zone');
    }
  };

  const handleZoneSelection = (zone: DeliveryZone) => {
    setSelectedZone(zone);
    setLocationError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateOrderId = () => {
    return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  // Generate placeholder image with product initial
  const getPlaceholderImage = (name: string) => {
    const initial = name.charAt(0).toUpperCase();
    const colors = ['bg-red-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return { initial, colorClass: colors[colorIndex] };
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for pre-order
    if (formData.isPreOrder && !formData.scheduledTime) {
      toast({
        variant: 'destructive',
        title: 'Validasi Gagal',
        description: 'Mohon pilih waktu untuk pre-order'
      });
      return;
    }

    // Validation for different delivery types
    if (formData.deliveryType === 'DELIVERY' && !formData.address) {
      toast({
        variant: 'destructive',
        title: 'Validasi Gagal',
        description: 'Mohon lengkapi alamat pengiriman'
      });
      return;
    }

    if (formData.deliveryType === 'PICKUP' && !formData.name) {
      toast({
        variant: 'destructive',
        title: 'Validasi Gagal',
        description: 'Mohon lengkapi nama untuk pickup'
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Keranjang Kosong',
        description: 'Keranjang belanja kosong'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // First, validate that all products still exist
      const productValidation = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const response = await fetch(`/api/products/${item.id}`);
            if (!response.ok) {
              return { id: item.id, exists: false, name: item.name };
            }
            const product = await response.json();
            return { id: item.id, exists: true, product: product.data, name: item.name };
          } catch (error) {
            return { id: item.id, exists: false, name: item.name };
          }
        })
      );

      const invalidProducts = productValidation.filter(p => !p.exists);
      if (invalidProducts.length > 0) {
        const invalidNames = invalidProducts.map(p => p.name).join(', ');
        toast({
          variant: 'destructive',
          title: 'Produk Tidak Tersedia',
          description: `Produk berikut tidak tersedia lagi: ${invalidNames}. Silakan hapus dari keranjang.`
        });
        return;
      }

      // Prepare order data for API
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          price: item.price,
          quantity: item.quantity
        })),
        total: total,
        name: formData.name,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: formData.phone,
        address: formData.deliveryType === 'DELIVERY' 
          ? `${formData.address}${formData.city ? `, ${formData.city}` : ''}${formData.postalCode ? ` ${formData.postalCode}` : ''}`
          : formData.deliveryAddress || '',
        notes: `Payment method: ${paymentMethod}${appliedVoucher ? ` | Voucher: ${appliedVoucher.code}` : ''}${selectedZone ? ` | Delivery Zone: ${selectedZone.name}` : ''}${formData.isPreOrder ? ` | Pre-order for: ${formData.scheduledTime}` : ''} | Delivery type: ${formData.deliveryType}`,
        userId: null, // Guest user
        voucherId: appliedVoucher?.id || null,
        deliveryFee: shipping,
        deliveryType: formData.deliveryType,
        // Pre-order fields
        isPreOrder: formData.isPreOrder,
        scheduledTime: formData.isPreOrder ? new Date(formData.scheduledTime) : null
      };

      console.log('Submitting order:', orderData);

      // Send order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const createdOrder = await response.json();
      console.log('Order created successfully:', createdOrder);

      // Generate order ID for display
      const orderId = createdOrder.id || generateOrderId();
      
      // Prepare order data for localStorage (for display purposes)
      const displayOrderData = {
        id: orderId,
        customer: formData,
        items: cartItems,
        subtotal,
        shipping,
        tax,
        discount,
        total,
        paymentMethod,
        voucher: appliedVoucher,
        status: 'pending',
        createdAt: new Date().toISOString(),
        apiOrder: createdOrder
      };

      setCurrentOrder(displayOrderData);

      // Save order to localStorage for history
      const existingOrders = JSON.parse(localStorage.getItem('oishine-orders') || '[]');
      existingOrders.push(displayOrderData);
      localStorage.setItem('oishine-orders', JSON.stringify(existingOrders));

      if (paymentMethod === 'qris') {
        console.log('Opening QRIS payment with order:', displayOrderData);
        setShowQRIS(true);
      } else {
        // Handle other payment methods
        await processOrder(displayOrderData);
      }
    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        variant: 'destructive',
        title: 'Terjadi Kesalahan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processOrder = async (orderData: any) => {
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clear cart
    localStorage.removeItem('oishine-cart');
    setCartItems([]);
    
    // Redirect to success page
    router.push('/checkout/success?id=' + orderData.id);
  };

  const handleQRISPaymentSuccess = () => {
    console.log('QRIS payment success callback triggered, currentOrder:', currentOrder);
    if (currentOrder) {
      processOrder(currentOrder);
    } else {
      console.error('No currentOrder found in QRIS payment success');
      toast({
        variant: 'destructive',
        title: 'Terjadi Kesalahan',
        description: 'Pesanan tidak ditemukan'
      });
    }
  };

  const handleQRISPaymentExpired = () => {
    setShowQRIS(false);
    toast({
      variant: 'destructive',
      title: 'Pembayaran Kadaluarsa',
      description: 'Pembayaran QRIS telah kadaluarsa. Silakan coba lagi.'
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Kosong</h2>
            <p className="text-gray-600 mb-6">Belum ada produk di keranjang belanja Anda</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 scroll-smooth">
      <style jsx>{`
        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #dc2626;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #b91c1c;
        }
        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #dc2626 #f1f1f1;
        }
      `}</style>
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
              {isDataPrefilled && (
                <p className="text-sm text-green-600">Data diisi otomatis dari pesanan sebelumnya</p>
              )}
            </div>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Scroll Navigation */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex space-x-6">
              <button
                onClick={() => scrollToSection('cart')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === 'cart' 
                    ? 'bg-red-100 text-red-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Keranjang
              </button>
              <button
                onClick={() => scrollToSection('delivery')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === 'delivery' 
                    ? 'bg-red-100 text-red-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Truck className="w-4 h-4" />
                Pengiriman
              </button>
              <button
                onClick={() => scrollToSection('payment')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === 'payment' 
                    ? 'bg-red-100 text-red-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Pembayaran
              </button>
              <button
                onClick={() => scrollToSection('summary')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === 'summary' 
                    ? 'bg-red-100 text-red-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Tag className="w-4 h-4" />
                Ringkasan
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Total: <span className="font-semibold text-gray-900">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div id="cart" className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  console.log('Rendering item:', item.name, 'image:', item.image);
                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.image && item.image.startsWith('http') ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log('Image failed to load, using placeholder:', item.image);
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const placeholder = getPlaceholderImage(item.name);
                                parent.innerHTML = `<div class="w-full h-full ${placeholder.colorClass} flex items-center justify-center"><span class="text-lg font-bold text-gray-600">${placeholder.initial}</span></div>`;
                              }
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', item.image);
                            }}
                          />
                        ) : (
                          (() => {
                            const placeholder = getPlaceholderImage(item.name);
                            return (
                              <div className={`w-full h-full ${placeholder.colorClass} flex items-center justify-center`}>
                                <span className="text-lg font-bold text-gray-600">{placeholder.initial}</span>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-600 hover:scale-110 transition-all duration-200 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>

              {/* Voucher Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kode Voucher</h3>
                
                {appliedVoucher ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">{appliedVoucher.name}</p>
                          <p className="text-sm text-green-600">
                            {appliedVoucher.type === 'PERCENTAGE' 
                              ? `Diskon ${appliedVoucher.value}%` 
                              : `Diskon Rp ${appliedVoucher.value.toLocaleString('id-ID')}`
                            }
                          </p>
                          <p className="text-xs text-green-600">Kode: {appliedVoucher.code}</p>
                        </div>
                      </div>
                      <button
                        onClick={removeVoucher}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleVoucherSubmit} className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => {
                            setVoucherCode(e.target.value.toUpperCase());
                            setVoucherError('');
                          }}
                          placeholder="Masukkan kode voucher"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
                      <button
                        type="submit"
                        disabled={isApplyingVoucher || !voucherCode.trim()}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isApplyingVoucher ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Terapkan'
                        )}
                      </button>
                    </div>
                    {voucherError && (
                      <p className="text-sm text-red-600">{voucherError}</p>
                    )}
                  </form>
                )}
              </div>

              {/* Order Total */}
              <div className="border-t pt-4 space-y-2">
                {/* Delivery Type & Pre-order Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Jenis Layanan</span>
                    <div className="flex items-center gap-2">
                      {formData.deliveryType === 'DELIVERY' && <Truck className="w-4 h-4 text-gray-600" />}
                      {formData.deliveryType === 'PICKUP' && <Store className="w-4 h-4 text-gray-600" />}
                      {formData.deliveryType === 'DINE_IN' && <Home className="w-4 h-4 text-gray-600" />}
                      <span className="text-sm font-medium capitalize">
                        {formData.deliveryType === 'DELIVERY' ? 'Delivery' : 
                         formData.deliveryType === 'PICKUP' ? 'Pickup' : 'Dine In'}
                      </span>
                    </div>
                  </div>
                  {formData.isPreOrder && formData.scheduledTime && (
                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                      <Calendar className="w-3 h-3" />
                      <Clock className="w-3 h-3" />
                      <span>Pre-order: {new Date(formData.scheduledTime).toLocaleString('id-ID', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ongkos Kirim</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'GRATIS' : `Rp ${shipping.toLocaleString('id-ID')}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Diskon</span>
                    <span className="font-medium text-green-600">-Rp {discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pajak (11%)</span>
                  <span className="font-medium">Rp {tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-red-500">
                      Rp {total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div id="payment" className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metode Pembayaran</h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="qris"
                    checked={paymentMethod === 'qris'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-4 h-4 text-red-500"
                  />
                  <div className="ml-3 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="font-medium">QRIS</div>
                      <div className="text-sm text-gray-500">Scan QR Code dengan e-wallet</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-4 h-4 text-red-500"
                  />
                  <div className="ml-3 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Transfer Bank</div>
                      <div className="text-sm text-gray-500">BCA, Mandiri, BNI, BRI</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-4 h-4 text-red-500"
                  />
                  <div className="ml-3 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-gray-500">Bayar saat barang sampai</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div id="delivery" className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Informasi Pengiriman</h2>
              {isDataPrefilled && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">Data dari pesanan sebelumnya</span>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} id="summary" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="0812-3456-7890"
                    required
                  />
                </div>
              </div>

              {/* Delivery Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Layanan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'DELIVERY' }))}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-105 ${
                      formData.deliveryType === 'DELIVERY'
                        ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <Truck className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'PICKUP' }))}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-105 ${
                      formData.deliveryType === 'PICKUP'
                        ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <Store className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">Pickup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'DINE_IN' }))}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-105 ${
                      formData.deliveryType === 'DINE_IN'
                        ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <Home className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">Dine In</span>
                  </button>
                </div>
              </div>

              {/* Pre-order Option */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPreOrder}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      isPreOrder: e.target.checked,
                      scheduledTime: e.target.checked ? '' : prev.scheduledTime
                    }))}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">Pre-order</span>
                    <p className="text-xs text-gray-500">Pesan sekarang, ambil/nikmati nanti</p>
                  </div>
                </label>
              </div>

              {/* Pre-order Date & Time Selection */}
              {formData.isPreOrder && (
                <div className="space-y-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Pilih Waktu Pre-order</span>
                  </div>
                  
                  {/* Date Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Tanggal</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {generateAvailableDates().map((dateOption, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            const [date, time] = formData.scheduledTime.split(' ');
                            const newScheduledTime = `${dateOption.date.toISOString().split('T')[0]} ${time || ''}`;
                            setFormData(prev => ({ ...prev, scheduledTime: newScheduledTime }));
                          }}
                          className={`p-2 text-xs rounded-lg border transition-all duration-200 cursor-pointer hover:scale-105 ${
                            formData.scheduledTime.startsWith(dateOption.date.toISOString().split('T')[0])
                              ? 'border-amber-500 bg-amber-100 text-amber-800 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          } ${dateOption.isToday ? 'font-semibold' : ''}`}
                        >
                          {dateOption.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Waktu</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto scroll-smooth custom-scrollbar">
                      {(() => {
                        const selectedDate = formData.scheduledTime.split(' ')[0];
                        const dateObj = selectedDate ? new Date(selectedDate) : new Date();
                        return generateTimeSlots(dateObj).map((timeSlot, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              const selectedDate = formData.scheduledTime.split(' ')[0] || new Date().toISOString().split('T')[0];
                              setFormData(prev => ({ 
                                ...prev, 
                                scheduledTime: `${selectedDate} ${timeSlot}` 
                              }));
                            }}
                            className={`p-2 text-xs rounded-lg border transition-all duration-200 cursor-pointer hover:scale-105 ${
                              formData.scheduledTime.endsWith(timeSlot)
                                ? 'border-amber-500 bg-amber-100 text-amber-800 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                          >
                            {timeSlot}
                          </button>
                        ));
                      })()}
                    </div>
                  </div>

                  {formData.scheduledTime && (
                    <div className="mt-3 p-2 bg-amber-100 rounded text-xs text-amber-800">
                      <strong>Pre-order untuk:</strong> {new Date(formData.scheduledTime).toLocaleString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Address field - only show for DELIVERY */}
              {formData.deliveryType === 'DELIVERY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Lengkap
                  </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all duration-200 hover:border-gray-400 cursor-text"
                    placeholder="Jl. Contoh No. 123, RT 01/RW 02"
                    required={formData.deliveryType === 'DELIVERY'}
                  />
                </div>
              </div>
              )}

              {/* Pickup/Dine In Address */}
              {(formData.deliveryType === 'PICKUP' || formData.deliveryType === 'DINE_IN') && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    {formData.deliveryType === 'PICKUP' ? (
                      <Store className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Home className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-sm font-medium text-blue-800">
                      {formData.deliveryType === 'PICKUP' ? 'Informasi Pickup' : 'Informasi Dine In'}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mb-3">
                    {formData.deliveryType === 'PICKUP' 
                      ? 'Pesanan Anda akan disiapkan dan dapat diambil di toko kami pada waktu yang ditentukan.'
                      : 'Meja akan disiapkan untuk Anda di toko kami pada waktu yang ditentukan.'
                    }
                  </p>
                  <div className="text-xs text-blue-600">
                    <strong>Alamat:</strong> Jl. Jend. Gatot Subroto No. 30, Purwokerto
                  </div>
                </div>
              )}

              {/* Delivery Zone Selection - only for DELIVERY */}
              {formData.deliveryType === 'DELIVERY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Area Pengiriman
                  </label>
                
                {/* Location Detection */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={detectCustomerLocation}
                    disabled={isCheckingLocation}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MapPin className="w-4 h-4" />
                    {isCheckingLocation ? 'Mendeteksi Lokasi...' : 'Deteksi Lokasi Otomatis'}
                  </button>
                  {locationError && (
                    <p className="mt-2 text-sm text-red-600">{locationError}</p>
                  )}
                </div>

                {/* Selected Zone Display */}
                {selectedZone && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{selectedZone.name}</p>
                        <p className="text-sm text-green-600">
                          {selectedZone.description && `${selectedZone.description} • `}
                          Estimasi {selectedZone.estimatedTime} menit
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Zone Selection */}
                {deliveryZones.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Atau pilih area pengiriman secara manual:</p>
                    <div className="grid gap-2 max-h-40 overflow-y-auto scroll-smooth custom-scrollbar">
                      {deliveryZones.map((zone) => (
                        <label
                          key={zone.id}
                          className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="deliveryZone"
                            checked={selectedZone?.id === zone.id}
                            onChange={() => handleZoneSelection(zone)}
                            className="w-4 h-4 text-red-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className="font-medium">{zone.name}</div>
                            <div className="text-sm text-gray-500">
                              {zone.description && `${zone.description} • `}
                              Rp {zone.deliveryFee.toLocaleString('id-ID')} • {zone.estimatedTime} menit
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kota
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 cursor-text"
                    placeholder="Jakarta"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 cursor-text"
                    placeholder="12345"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg transform hover:scale-[1.02] interactive-cursor enhanced-button"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Konfirmasi Pesanan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* QRIS Payment Modal */}
      <QRISPayment
        key={stableOrderId} // Add key to prevent component reuse
        isOpen={showQRIS}
        onClose={() => setShowQRIS(false)}
        amount={total}
        orderId={currentOrder?.id || stableOrderId}
        onPaymentSuccess={handleQRISPaymentSuccess}
        onPaymentExpired={handleQRISPaymentExpired}
      />
    </div>
  );
}