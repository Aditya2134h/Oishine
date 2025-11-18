'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ImageWithFallback from '@/components/ui/image-with-fallback'
import { 
  ShoppingCart, 
  Search, 
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  X, 
  Plus, 
  Minus, 
  CreditCard,
  Menu as MenuIcon,
  ChefHat,
  Users,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  ArrowRight,
  Sparkles,
  Leaf,
  Utensils,
  Calendar,
  History,
  MessageSquare,
  ThumbsUp,
  Camera,
  Truck,
  Navigation,
  Timer,
  Store,
  ChevronDown,
  Heart
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import WhatsAppButton from '@/components/WhatsAppButton'
import LoyaltyWidget from '@/components/LoyaltyWidget'
import ReviewList from '@/components/ReviewList'
import ReviewForm from '@/components/ReviewForm'
import ThemeToggle from '@/components/ThemeToggle'
import { ProductGridSkeleton } from '@/components/ui/skeleton'
import ScrollToTop from '@/components/ScrollToTop'
import { FadeIn, ScaleIn, FloatingElement } from '@/components/animations/ScrollAnimations'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  ingredients?: string
  category: {
    id: string
    name: string
  }
  isAvailable: boolean
}

interface CartItem {
  id: string
  product: Product
  quantity: number
}

interface TeamMember {
  id: string
  name: string
  role: string
  image: string
  bio: string
  email?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  isActive: boolean
  social?: {
    instagram?: string
    twitter?: string
    linkedin?: string
  }
}

export default function Home() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailQuantity, setDetailQuantity] = useState(1)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [lastOrder, setLastOrder] = useState(null) // Store last order for re-order functionality
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: 'qris',
    // Pre-order fields
    isPreOrder: false,
    scheduledTime: '',
    deliveryType: 'delivery',
    deliveryAddress: ''
  })
  const [showQRIS, setShowQRIS] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [qrTimer, setQrTimer] = useState(600) // 10 minutes in seconds
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [orderHistory, setOrderHistory] = useState([])
  const [showOrderHistory, setShowOrderHistory] = useState(false)
  const [showReviews, setShowReviews] = useState(false)
  const [productReviews, setProductReviews] = useState([])
  const [selectedProductForReview, setSelectedProductForReview] = useState(null)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    images: []
  })
  const [wishlist, setWishlist] = useState<string[]>([]) // Array of product IDs
  const [sessionId, setSessionId] = useState<string>('')
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Oishine!',
    storeEmail: 'admin@oishine.com',
    storePhone: '+62 812-3456-7890',
    storeAddress: 'Purwokerto, Indonesia',
    storeDescription: 'Delicious Japanese Food Delivery - Purwokerto',
    currency: 'IDR',
    taxRate: 11, // Updated to match database
    contactEmail: 'info@oishine.com',
    contactPhone: '+62 21 1234 5678',
    contactAddress: 'Jl. Jend. Gatot Subroto No. 30, Purwokerto',
    weekdayHours: '10:00 - 22:00',
    weekendHours: '10:00 - 23:00',
    holidayHours: '10:00 - 23:00'
  })

  // Ensure social fields exist on storeSettings object (may be returned by API)
  if ((storeSettings as any).instagram === undefined) {
    ;(storeSettings as any).instagram = ''
  }
  if ((storeSettings as any).facebook === undefined) {
    ;(storeSettings as any).facebook = ''
  }
  if ((storeSettings as any).twitter === undefined) {
    ;(storeSettings as any).twitter = ''
  }

  // Default footer social links (used as fallback if `storeSettings` doesn't provide them)
  const FOOTER_SOCIALS = {
    instagram: 'https://instagram.com/oishine',
    facebook: 'https://facebook.com/oishine',
    twitter: 'https://x.com/oishine'
  }

  // Load reviews for a product
  const loadProductReviews = async (productId: string) => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProductReviews(data.data)
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  // Submit review
  const submitReview = async () => {
    if (!selectedProductForReview || !reviewForm.rating) {
      toast.warning('Rating Diperlukan', 'Mohon berikan rating untuk produk ini')
      return
    }

    try {
      const reviewData = {
        orderId: currentOrder?.id || null, // Make orderId optional
        productId: selectedProductForReview.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        images: reviewForm.images,
        userId: null // Could be added if user authentication is implemented
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit review')
      }

      const review = await response.json()
      toast.success('Review Berhasil!', 'Review Anda telah berhasil ditambahkan')
      
      // Reset form
      setReviewForm({ rating: 5, comment: '', images: [] })
      setSelectedProductForReview(null)
      setShowReviews(false)
      
      // Reload products to update ratings
      window.location.reload()

    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Gagal Menambah Review', error.message || 'Terjadi kesalahan saat menambahkan review')
    }
  }

  // Wishlist functions
  const getOrCreateSessionId = () => {
    if (sessionId && sessionId !== '') return sessionId
    
    let sid = localStorage.getItem('sessionId')
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('sessionId', sid)
      setSessionId(sid)
    }
    return sid
  }

  const loadWishlist = async () => {
    try {
      const sid = getOrCreateSessionId()
      if (!sid) {
        console.log('No session ID available yet')
        return
      }
      
      const response = await fetch(`/api/wishlist?sessionId=${sid}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const wishlistIds = data.data.map((item: any) => item.productId)
          setWishlist(wishlistIds)
          console.log('Wishlist loaded:', wishlistIds)
        }
      }
    } catch (error) {
      console.error('Error loading wishlist:', error)
    }
  }

  const toggleWishlist = async (productId: string) => {
    const sid = getOrCreateSessionId()
    if (!sid) {
      toast({
        variant: 'destructive',
        title: 'Terjadi Kesalahan',
        description: 'Session tidak tersedia'
      })
      return
    }
    
    const isInWishlist = wishlist.includes(productId)

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?sessionId=${sid}&productId=${productId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setWishlist(wishlist.filter(id => id !== productId))
          toast({
            title: 'Dihapus dari Favorit',
            description: 'Produk berhasil dihapus dari daftar favorit'
          })
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId: sid, productId })
        })
        
        if (response.ok) {
          setWishlist([...wishlist, productId])
          toast({
            title: 'Ditambahkan ke Favorit',
            description: 'Produk berhasil ditambahkan ke daftar favorit'
          })
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      toast({
        variant: 'destructive',
        title: 'Terjadi Kesalahan',
        description: 'Gagal mengubah daftar favorit'
      })
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId)
  }

  // Load order history
  const loadOrderHistory = async (email?: string, phone?: string) => {
    try {
      const params = new URLSearchParams()
      if (email) params.append('email', email)
      if (phone) params.append('phone', phone)

      const response = await fetch(`/api/orders/history?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrderHistory(data.data)
        }
      }
    } catch (error) {
      console.error('Error loading order history:', error)
    }
  }

  // Re-order function
  const handleReorder = (order: any) => {
    const reorderedItems = order.items.map((item: any) => ({
      id: Date.now().toString() + item.productId,
      product: item.product,
      quantity: item.quantity
    }))
    
    // Save reordered items to localStorage for checkout page
    const cartData = reorderedItems.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
      description: item.product.description
    }))
    
    localStorage.setItem('oishine-cart', JSON.stringify(cartData))
    
    // Save checkout form data to localStorage
    const checkoutData = {
      name: order.name || '',
      email: order.email || '',
      phone: order.phone || '',
      address: order.address || order.deliveryAddress || '',
      city: '',
      postalCode: ''
    }
    localStorage.setItem('oishine-checkout-data', JSON.stringify(checkoutData))
    
    setShowOrderHistory(false)
    
    // Navigate to checkout page instead of opening dialog
    router.push('/checkout')
  }

  // Re-order from current cart (for checkout dialog)
  const handleReorderFromCart = () => {
    if (lastOrder) {
      // Show confirmation dialog
      const confirmMessage = `Tampilkan kembali pesanan sebelumnya?\n\n` +
        `Item: ${lastOrder.items.map((item: any) => `${item.product.name} (${item.quantity})`).join(', ')}\n` +
        `Total: Rp ${lastOrder.total.toLocaleString('id-ID')}\n\n` +
        `Form checkout akan diisi otomatis dengan data pesanan sebelumnya.`
      
      if (confirm(confirmMessage)) {
        handleReorder(lastOrder)
      }
    }
  }

  // Clear last order history
  const clearLastOrder = () => {
    if (confirm('Hapus riwayat pesanan terakhir? Tombol "Pesan Lagi" akan disembunyikan.')) {
      setLastOrder(null)
    }
  }

  // Save current order as last order
  const saveLastOrder = (orderData: any) => {
    setLastOrder({
      ...orderData,
      items: cart.map(item => ({
        productId: item.product.id,
        product: item.product,
        quantity: item.quantity,
        price: item.product.price
      }))
    })
  }

  // Track order function
  const handleTrackOrder = (order: any) => {
    const trackingInfo = `Status: ${order.status}\nNo. Tracking: ${order.trackingNumber || 'N/A'}\nEstimasi Pengiriman: ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleString('id-ID') : 'N/A'}\n${order.driver ? `Kurir: ${order.driver.name} (${order.driver.phone})` : ''}`
    
    toast.info('Informasi Tracking', trackingInfo)
  }

  // Team members data
  // Load team members from API
  const loadTeamMembers = async () => {
    try {
      const response = await fetch('/api/admin/team')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Transform database data to match frontend interface
          const transformedMembers = data.data.map((member: any) => ({
            ...member,
            social: {
              instagram: member.instagram,
              twitter: member.twitter,
              linkedin: member.linkedin
            }
          }))
          setTeamMembers(transformedMembers.filter((m: TeamMember) => m.isActive))
        }
      }
    } catch (error) {
      console.error('Error loading team members:', error)
    }
  }

  // Load products, categories, and settings from API
  useEffect(() => {
    const loadData = async () => {
      if (!isInitialLoad) setIsLoading(true)
      
      try {
        // Load settings
        console.log('Loading settings...')
        const settingsResponse = await fetch('/api/settings', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          if (settingsData.success) {
            console.log('Settings loaded:', settingsData.data);
            setStoreSettings(settingsData.data);
          }
        }

        // Load products with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const productsResponse = await fetch('/api/products?limit=50', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId)
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          if (productsData.success) {
            setProducts(productsData.data);
            setFilteredProducts(productsData.data);
            
            // Extract unique categories, filtering out empty strings
            const productCategories = Array.from(new Set(productsData.data.map((p: Product) => p.category?.name || '')))
              .filter(category => category && category.trim() !== '');

            // Also fetch categories from the categories API so the main menu includes categories created in admin
            try {
              const catsRes = await fetch('/api/admin/categories', { cache: 'no-store' })
              if (catsRes.ok) {
                const catsData = await catsRes.json()
                if (catsData.success && Array.isArray(catsData.data)) {
                  // Normalize and trim names from admin API
                  const apiCats = catsData.data.map((c: any) => (c.name || '').trim()).filter((n: string) => n)
                  const productCats = productCategories.map((c: string) => (c || '').trim()).filter((n: string) => n)

                  // Merge while preserving original casing and order, deduplicate case-insensitively
                  const map = new Map<string, string>()
                  ;[...apiCats, ...productCats].forEach((name) => {
                    const key = name.toLowerCase()
                    if (!map.has(key)) map.set(key, name)
                  })

                  setCategories(Array.from(map.values()))
                } else {
                  setCategories(productCategories)
                }
              } else {
                setCategories(productCategories)
              }
            } catch (err) {
              console.error('Failed to load admin categories, falling back to product categories', err)
              setCategories(productCategories)
            }
          }
        } else {
          // Fallback to sample data if API fails
          console.log('API failed, using sample data');
          loadSampleData();
        }

        // Load team members
        await loadTeamMembers();
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error loading data:', error);
          // Fallback to sample data
          loadSampleData();
        }

        // Load team members even if other data fails
        await loadTeamMembers();
      } finally {
        setIsLoading(false)
        setIsInitialLoad(false)
      }
    };

    const loadSampleData = () => {
      const sampleProducts: Product[] = [
        {
          id: '1',
          name: 'Mochi',
          description: 'Mochi lembut dengan berbagai pilihan rasa, dibuat dari tepung beras berkualitas tinggi',
          price: 6000,
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
          ingredients: 'Tepung beras premium, gula aren, kacang merah, kelapa parut',
          category: { id: '1', name: 'Makanan' },
          isAvailable: true
        },
        {
          id: '2',
          name: 'Dorayaki',
          description: 'Pancake Jepang klasik dengan filling kacang merah yang manis',
          price: 7000,
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
          ingredients: 'Tepung terigu, telur, kacang merah, madu, vanila',
          category: { id: '1', name: 'Makanan' },
          isAvailable: true
        },
        {
          id: '3',
          name: 'Onigiri',
          description: 'Nasi kebul Jepang bentuk segitiga dengan filling favorit',
          price: 13000,
          image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
          ingredients: 'Nasi Jepang premium, nori, salmon, tuna, sayuran',
          category: { id: '1', name: 'Makanan' },
          isAvailable: true
        },
        {
          id: '4',
          name: 'Gyoza',
          description: 'Dumpling Jepang dengan daging dan sayuran segar, digoreng hingga kriuk',
          price: 8000,
          image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
          ingredients: 'Kulit dumpling, daging ayam, sayuran, bawang putih, kecap asin',
          category: { id: '1', name: 'Makanan' },
          isAvailable: true
        },
        {
          id: '5',
          name: 'Iced Matcha Latte',
          description: 'Minuman matcha segar dengan susu creamy dan es',
          price: 7000,
          image: 'https://images.unsplash.com/photo-1593079832685-2ea9ca6d0c7b?w=400&h=300&fit=crop',
          ingredients: 'Matcha powder premium, susu fresh, gula aren, es batu',
          category: { id: '2', name: 'Minuman' },
          isAvailable: true
        },
        {
          id: '6',
          name: 'Yuzu Tea',
          description: 'Teh segar dengan rasa yuzu yang unik dan menyegarkan',
          price: 7000,
          image: 'https://images.unsplash.com/photo-1593079832685-2ea9ca6d0c7b?w=400&h=300&fit=crop',
          ingredients: 'Teh hijau premium, ekstrak yuzu asli, madu, air mineral',
          category: { id: '2', name: 'Minuman' },
          isAvailable: true
        }
      ];

      setProducts(sampleProducts);
      setFilteredProducts(sampleProducts);
      
      const uniqueCategories = Array.from(new Set(sampleProducts.map(p => p.category.name)))
        .filter(category => category && category.trim() !== '');
      setCategories(uniqueCategories);
    };

    loadData();
  }, [])

  // Initialize session ID on mount
  useEffect(() => {
    const sid = localStorage.getItem('sessionId')
    if (!sid) {
      const newSid = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('sessionId', newSid)
      setSessionId(newSid)
    } else {
      setSessionId(sid)
    }
  }, [])

  // Load wishlist when sessionId is available
  useEffect(() => {
    if (sessionId) {
      loadWishlist()
    }
  }, [sessionId])

  // Debug: Log when storeSettings changes
  useEffect(() => {
    console.log('storeSettings changed:', storeSettings)
  }, [storeSettings]);

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (showQRIS && qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer(prev => prev - 1)
      }, 1000)
    } else if (qrTimer === 0 && showQRIS) {
      toast.error('QR Code Kadaluarsa', 'QR Code telah kadaluarsa. Silakan buat pesanan baru.')
      setShowQRIS(false)
      setCurrentOrder(null)
      setQrTimer(600)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [showQRIS, qrTimer])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    let filtered = products

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category.name === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }, [selectedCategory, searchTerm, products])

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prevCart, { id: Date.now().toString(), product, quantity }]
    })
  }

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product)
    setDetailQuantity(1)
    setIsDetailOpen(true)
  }

  const addToCartFromDetail = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, detailQuantity)
      setIsDetailOpen(false)
    }
  }

  const clearCart = (keepLastOrder = false) => {
    setCart([])
    if (!keepLastOrder) {
      setLastOrder(null)
    }
    setCheckoutForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      paymentMethod: 'qris',
      isPreOrder: false,
      scheduledTime: '',
      deliveryType: 'delivery',
      deliveryAddress: ''
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.product.id !== productId))
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      )
    }
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + ((item.product.price || 0) * item.quantity), 0)
  }

  const getTotalPriceWithTax = () => {
    const subtotal = getTotalPrice()
    const taxRate = storeSettings?.taxRate || 11 // Fallback to 11% if undefined
    const tax = (subtotal * taxRate) / 100
    console.log(`Tax calculation: subtotal=${subtotal}, taxRate=${taxRate}, tax=${tax}`)
    return subtotal + tax
  }

  const getTaxAmount = () => {
    const subtotal = getTotalPrice()
    const taxRate = storeSettings?.taxRate || 11 // Fallback to 11% if undefined
    const tax = (subtotal * taxRate) / 100
    console.log(`Tax amount: subtotal=${subtotal}, taxRate=${taxRate}, tax=${tax}`)
    return tax
  }

  // Return category label with emoji. Detect drinks by keywords, otherwise treat as food.
  const getCategoryLabel = (category: string) => {
    const name = (category || '').trim()
    const lower = name.toLowerCase()
    const drinkKeywords = ['minuman','minum','tea','matcha','latte','kopi','coffee','juice','teh','soda']
    const isDrink = drinkKeywords.some(k => lower.includes(k))
    const emoji = isDrink ? '🍵' : '🍱'
    return `${emoji} ${name}`
  }

  // Build canonical social URL from handle or full URL
  const getSocialUrl = (platform: string, value?: string) => {
    if (!value) return '#'
    const v = value.trim()
    if (v.startsWith('http')) return v
    const handle = v.replace(/^@/, '')
    switch (platform) {
      case 'instagram':
        return `https://instagram.com/${handle}`
      case 'twitter':
        // prefer X domain for modern links
        return `https://x.com/${handle}`
      case 'linkedin':
        return `https://linkedin.com/in/${handle}`
      case 'facebook':
        return `https://facebook.com/${handle}`
      default:
        return v
    }
  }

  const handleCheckout = () => {
    // Save cart to localStorage for checkout page
    localStorage.setItem('oishine-cart', JSON.stringify(cart.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
      description: item.product.description
    }))))
    router.push('/checkout')
  }

  const handleFormChange = (field: string, value: string) => {
    setCheckoutForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const submitOrder = async () => {
    // Validation
    if (!checkoutForm.name || !checkoutForm.email || !checkoutForm.phone) {
      toast.warning('Form Lengkap Diperlukan', 'Mohon lengkapi semua field yang diperlukan')
      return
    }

    // Validate delivery address for delivery orders
    if (checkoutForm.deliveryType === 'delivery' && !checkoutForm.deliveryAddress && !checkoutForm.address) {
      toast.warning('Alamat Pengiriman Diperlukan', 'Mohon lengkapi alamat pengiriman')
      return
    }

    // Validate scheduled time for pre-orders
    if (checkoutForm.isPreOrder && !checkoutForm.scheduledTime) {
      toast.warning('Waktu Pre-order Diperlukan', 'Mohon pilih waktu pengiriman untuk pre-order')
      return
    }

    try {
      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        total: getTotalPriceWithTax(),
        name: checkoutForm.name,
        email: checkoutForm.email,
        phone: checkoutForm.phone,
        address: checkoutForm.address,
        notes: checkoutForm.notes,
        paymentMethod: checkoutForm.paymentMethod,
        // Pre-order fields
        isPreOrder: checkoutForm.isPreOrder,
        scheduledTime: checkoutForm.scheduledTime,
        // Delivery fields
        deliveryType: checkoutForm.deliveryType,
        deliveryAddress: checkoutForm.deliveryAddress || checkoutForm.address,
        deliveryFee: checkoutForm.deliveryType === 'delivery' ? 10000 : 0
      }

      // Send order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const order = await response.json()
      setCurrentOrder(order)
      
      // Save order for re-order functionality
      saveLastOrder(orderData)

      // Handle payment methods
      if (checkoutForm.paymentMethod === 'qris') {
        setShowQRIS(true)
        setIsCheckoutOpen(false)
      } else {
        const paymentMessages = {
          transfer: `Pesanan berhasil! Silakan transfer ke rekening BCA/Mandiri/BNI. Total: Rp ${getTotalPriceWithTax().toLocaleString('id-ID')}${order.trackingNumber ? `\nNo. Tracking: ${order.trackingNumber}` : ''}`,
          ewallet: `Pesanan berhasil! Silakan bayar via GoPay/OVO/DANA. Total: Rp ${getTotalPriceWithTax().toLocaleString('id-ID')}${order.trackingNumber ? `\nNo. Tracking: ${order.trackingNumber}` : ''}`,
          cod: `Pesanan berhasil! Pembayaran dilakukan saat pengiriman. Total: Rp ${getTotalPriceWithTax().toLocaleString('id-ID')}${order.trackingNumber ? `\nNo. Tracking: ${order.trackingNumber}` : ''}`
        }

        // Show toast notification
        toast({
          title: 'Pesanan Berhasil!',
          description: paymentMessages[checkoutForm.paymentMethod]
        })
        
        // Reset form
        clearCart(true) // Keep lastOrder for re-order functionality
        setIsCheckoutOpen(false)
      }

    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('Gagal Membuat Pesanan', error.message || 'Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.')
    }
  }

  const confirmPayment = () => {
    if (currentOrder) {
      console.log('Payment confirmed for order:', currentOrder)
      const total = currentOrder.total || 0
      const successMessage = `Pembayaran QRIS berhasil! Pesanan Anda sedang diproses. Total: Rp ${total.toLocaleString('id-ID')}${currentOrder.trackingNumber ? `\nNo. Tracking: ${currentOrder.trackingNumber}` : ''}`
      
      toast.success('Pembayaran Berhasil!', successMessage)
      
      clearCart(true) // Keep lastOrder for re-order functionality
      setIsCheckoutOpen(false)
      setShowQRIS(false)
      setCurrentOrder(null)
      setQrTimer(600) // Reset timer
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Debug: Show current settings */}
      {console.log('Render - Current storeSettings:', storeSettings)}
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 dark:bg-background/95 backdrop-blur-xl border-b border-border shadow-sm transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="relative"
              >
                <img 
                  src="/oishine-logo-custom.png" 
                  alt="OISHINE!" 
                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 object-cover rounded-full shadow-lg group-hover:shadow-xl transition-shadow" 
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                />
              </motion.div>
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-baseline"
                >
                  <span className="font-bold text-xl lg:text-2xl bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">OISHINE</span>
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="font-bold text-xl lg:text-2xl text-red-600 ml-1"
                  >!</motion.span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-xs lg:text-sm text-muted-foreground font-medium"
                >
                  おいしいね！
                </motion.div>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {[
                { href: "#menu", label: "Menu", icon: ChefHat },
                { href: "#about", label: "Tentang", icon: Sparkles },
                { href: "#team", label: "Tim Kami", icon: Users },
                { href: "#contact", label: "Kontak", icon: Phone }
              ].map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link 
                    href={item.href} 
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200 font-medium group"
                  >
                    <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="flex items-center space-x-2 lg:space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Order History Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="relative hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => setShowOrderHistory(true)}
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Riwayat</span>
                </Button>
              </motion.div>

              {/* Cart Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="relative hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => setIsCartOpen(!isCartOpen)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {getTotalItems() > 0 && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white flex items-center justify-center font-bold shadow-lg"
                    >
                      {getTotalItems()}
                    </motion.div>
                  )}
                  <span className="hidden sm:inline ml-2">Keranjang</span>
                </Button>
              </motion.div>
              
              {/* Mobile Menu Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-red-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-red-100"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {[
                  { href: "#menu", label: "Menu", icon: ChefHat },
                  { href: "#about", label: "Tentang", icon: Sparkles },
                  { href: "#team", label: "Tim Kami", icon: Users },
                  { href: "#contact", label: "Kontak", icon: Phone }
                ].map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link 
                      href={item.href} 
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[30vh] md:min-h-[35vh] lg:min-h-[40vh] flex items-center justify-center overflow-hidden pt-6 sm:pt-8 md:pt-10 lg:pt-12">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 dark:from-red-950/20 dark:via-pink-950/20 dark:to-purple-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
          
          {/* Floating Animated Elements */}
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1], 
              rotate: [0, 180, 360],
              x: [0, 100, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-red-300 to-pink-300 dark:from-red-600 dark:to-pink-600 rounded-full opacity-20 dark:opacity-10 blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.3, 1, 1.3], 
              rotate: [360, 180, 0],
              x: [0, -80, 0],
              y: [0, 60, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-20 blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1], 
              y: [0, -80, 0],
              x: [0, 40, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-20 blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2], 
              rotate: [0, -360, 0],
              x: [0, -60, 0],
              y: [0, -40, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full opacity-20 blur-3xl"
          />
        </div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-4 md:mb-6"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mx-auto relative overflow-hidden rounded-full shadow-2xl"
                  >
                    <img src="/oishine-logo-custom.png" alt="OISHINE!" className="w-full h-full object-cover rounded-full" />
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-500 rounded-full blur-xl opacity-30 scale-110"></div>
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1 -right-1 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full shadow-lg"
                  >
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white m-auto" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-6 md:mb-8"
            >
              <motion.h1 
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight"
              >
                <motion.span 
                  className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent block mb-2 md:mb-4"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  OISHINE!
                </motion.span>
                <motion.span 
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-800 font-bold block"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  おいしいね！
                </motion.span>
              </motion.h1>
            </motion.div>
            
            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-4 md:mb-6"
            >
              <motion.p 
                className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 font-medium max-w-3xl mx-auto leading-relaxed"
                animate={{ opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                Nikmati kelezatan makanan Jepang autentik dengan cita rasa premium yang 
                <motion.span 
                  className="text-red-600 font-bold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                > {" "}menggugah selera
                </motion.span>
              </motion.p>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 md:mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="#menu">
                  <Button size="lg" className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 interactive-cursor enhanced-button">
                    <ChefHat className="h-5 w-5 mr-2" />
                    Lihat Menu
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="#contact">
                  <Button size="lg" variant="outline" className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-8 py-6 text-lg font-semibold rounded-2xl transition-all duration-300 interactive-cursor enhanced-button">
                    <Phone className="h-5 w-5 mr-2" />
                    Pesan Sekarang
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              {[
                { icon: Truck, text: "Pengiriman Cepat", delay: 0 },
                { icon: Star, text: "Rating 4.8⭐", delay: 0.1 },
                { icon: Clock, text: "Buka Setiap Hari", delay: 0.2 }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + feature.delay, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg"
                >
                  <feature.icon className="h-5 w-5 text-red-600" />
                  <span className="text-gray-700 font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-gray-400"
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Lokasi Premium',
                description: 'Pusat Kota, Mudah Diakses',
                color: 'from-pink-500 to-purple-500'
              },
              {
                icon: Star,
                title: 'Bintang 5',
                description: 'Kualitas Terbaik Terjamin',
                color: 'from-purple-500 to-indigo-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center group"
              >
                <div className={`h-20 w-20 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 bg-gradient-to-b from-gray-50 via-white to-white relative overflow-hidden scroll-mt-20 scroll-animate">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 left-10 w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full opacity-30 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-30 blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl shadow-xl mb-6"
            >
              <Utensils className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-6">
              <motion.span 
                className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Menu Premium
              </motion.span>
            </h2>
            <motion.p 
              className="text-gray-600 max-w-3xl mx-auto text-sm lg:text-base leading-relaxed"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              Pilihan makanan dan minuman Jepang autentik dengan citarasa yang luar biasa 
              <span className="text-red-600 font-semibold"> • Fresh • Halal • Berkualitas</span>
            </motion.p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div 
            className="flex flex-col lg:flex-row gap-4 mb-6 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
              <Input
                placeholder="Cari makanan atau minuman impianmu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 border-2 border-gray-200 focus:border-red-400 transition-all duration-300 text-base rounded-2xl shadow-sm hover:shadow-md focus:shadow-lg bg-white/80 backdrop-blur-sm"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-80 h-14 border-2 border-gray-200 focus:border-red-400 transition-all duration-300 text-base rounded-2xl shadow-sm hover:shadow-md focus:shadow-lg bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="🍱 Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🌟 Semua Menu</SelectItem>
                {categories.filter(category => category && category.trim() !== '').map(category => (
                  <SelectItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 border-2 border-gray-200 hover:border-red-400 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md bg-white/80 backdrop-blur-sm"
                onClick={() => window.location.reload()}
                disabled={isLoading}
                title="Refresh menu"
              >
                <motion.div
                  animate={isLoading ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
                >
                  <Search className="h-5 w-5" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 max-w-5xl mx-auto">
            {isLoading ? (
              // Enhanced Loading Skeletons
              Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group"
                >
                  <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                    <CardHeader className="pb-4">
                      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse mb-2" />
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 animate-pulse" />
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse mb-4" />
                      <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/2 animate-pulse" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 interactive-cursor bg-white/80 backdrop-blur-sm rounded-3xl" onClick={() => openProductDetail(product)}>
                    {/* Product Image */}
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Wishlist Heart Button - Always Visible */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 + index * 0.1, type: "spring" }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleWishlist(product.id)
                        }}
                        className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg cursor-pointer z-10 hover:bg-white transition-all"
                      >
                        <Heart 
                          className={`h-5 w-5 transition-all duration-300 ${
                            isInWishlist(product.id) 
                              ? 'text-red-500 fill-red-500 animate-pulse' 
                              : 'text-gray-400 hover:text-red-400'
                          }`} 
                        />
                      </motion.div>
                      
                      {/* Product Badge */}
                      {product.isAvailable && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Badge className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-1 rounded-full shadow-lg">
                            ✓ Tersedia
                          </Badge>
                        </motion.div>
                      )}
                      
                      {/* Quick Actions */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute bottom-4 left-4 right-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg"
                        >
                          <Star className="h-4 w-4 text-yellow-500" />
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleWishlist(product.id)
                          }}
                          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg cursor-pointer"
                        >
                          <Heart 
                            className={`h-4 w-4 transition-colors ${
                              isInWishlist(product.id) 
                                ? 'text-red-500 fill-red-500' 
                                : 'text-gray-400'
                            }`} 
                          />
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg"
                        >
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                        </motion.div>
                      </motion.div>
                    </div>
                    
                    {/* Product Info */}
                    <CardHeader className="pb-4 pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                          {product.name}
                        </CardTitle>
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 15 }}
                          transition={{ type: "spring" }}
                        >
                          <div className="bg-gradient-to-r from-red-100 to-pink-100 p-2 rounded-xl">
                            <Leaf className="h-4 w-4 text-red-600" />
                          </div>
                        </motion.div>
                      </div>
                      <CardDescription className="text-gray-600 line-clamp-2 leading-relaxed">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-6">
                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(product.averageRating || 4.5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                          {product.averageRating?.toFixed(1) || '4.5'} ({product.reviewCount || 12})
                        </span>
                      </div>
                      
                      {/* Price and Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="text-2xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent"
                          >
                            Rp {product.price.toLocaleString('id-ID')}
                          </motion.div>
                          {product.totalOrders > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {product.totalOrders} terjual
                            </div>
                          )}
                        </div>
                        
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            addToCart(product)
                          }}
                          className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Plus className="h-5 w-5" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
          
          {/* No Results Message */}
          {!isLoading && filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Menu Tidak Ditemukan</h3>
              <p className="text-gray-500 mb-6">Coba ubah kata kunci pencarian atau kategori</p>
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                Reset Filter
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 bg-gradient-to-b from-white to-gray-50 scroll-mt-20 pt-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                Tentang OISHINE!
              </span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-base leading-relaxed">
              {storeSettings.storeDescription}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative max-w-sm mx-auto">
                <div className="aspect-square bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="/oishine-logo-optimized.png"
                    alt="OISHINE!"
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-3 -right-3 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg flex items-center justify-center"
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Masakan Jepang autentik dengan citarasa terbaik, disajikan dengan sentuhan modern.
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Kami menyajikan berbagai pilihan makanan dan minuman Jepang dengan bahan-bahan pilihan 
                  berkualitas tinggi, diproses dengan higienis dan disajikan dengan cita rasa autentik.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Leaf, text: "Bahan Berkualitas" },
                  { icon: Clock, text: "Cepat Saji" },
                  { icon: Truck, text: "Pengiriman Aman" },
                  { icon: Star, text: "Rating Tinggi" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-md"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-12 bg-white scroll-mt-20 scroll-animate">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-4">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                Tim Profesional Kami
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Didedikasikan oleh para ahli kuliner dengan pengalaman bertahun-tahun
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
                  <div className="aspect-square relative overflow-hidden">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      fallbackClassName="w-full h-full flex items-center justify-center bg-gray-100"
                      fallbackText={member.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-sm">{member.bio}</p>
                    </div>
                  </div>
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl font-bold text-gray-900">{member.name}</CardTitle>
                    <CardDescription className="text-red-600 font-semibold">{member.role}</CardDescription>
                  </CardHeader>
                  <CardFooter className="justify-center space-x-3">
                    {member.social.instagram && (
                      <a
                        href={getSocialUrl('instagram', member.social.instagram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on Instagram`}
                      >
                        <Button variant="ghost" size="sm" className="hover:text-pink-600 interactive-cursor">
                          <Instagram className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    {member.social.twitter && (
                      <a
                        href={getSocialUrl('twitter', member.social.twitter)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on X`}
                      >
                        <Button variant="ghost" size="sm" className="hover:text-blue-600 interactive-cursor">
                          <Twitter className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    {member.social.linkedin && (
                      <a
                        href={getSocialUrl('linkedin', member.social.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                      >
                        <Button variant="ghost" size="sm" className="hover:text-blue-700 interactive-cursor">
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-story" className="py-12 bg-gradient-to-b from-gray-50 to-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex justify-center mb-4">
                <Leaf className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Tentang OISHINE!
                </span>
                <div className="text-2xl md:text-3xl text-gray-700 mt-2">おいしいね！</div>
              </h2>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                Oishine! adalah sebuah brand kuliner yang menghadirkan berbagai makanan dan minuman khas Jepang dengan rasa autentik dan tampilan modern. Mengusung konsep "lezat, praktis, dan berkualitas", Oishine! menyediakan pilihan menu seperti dessert Jepang, minuman latte premium, hingga snack khas Jepang yang dibuat dengan bahan berkualitas tinggi. Setiap produk diolah dengan cita rasa yang lembut, segar, dan disesuaikan dengan selera masyarakat Indonesia, sehingga memberikan pengalaman menikmati kuliner Jepang yang menyenangkan dan mudah diakses.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {[
                  { number: '100+', label: 'Menu Variatif' },
                  { number: '50K+', label: 'Pelanggan Puas' },
                  { number: '4.9⭐', label: 'Rating Review' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                  >
                    <h3 className="font-bold text-4xl mb-2 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      {stat.number}
                    </h3>
                    <p className="text-gray-600 font-medium">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 bg-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-4">
              <Phone className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                Hubungi Kami
              </span>
            </h2>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="font-bold text-xl mb-4 text-gray-900">Informasi Kontak</h3>
                <div className="space-y-4">
                  {[
                    { icon: MapPin, text: storeSettings.contactAddress || 'Jl. Sudirman No. 123, Jakarta Pusat' },
                    { icon: Phone, text: storeSettings.contactPhone || '+62 21 1234 5678' },
                    { icon: Mail, text: storeSettings.contactEmail || 'info@oishine.com' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                      <div className="h-10 w-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="font-bold text-2xl mb-6 text-gray-900">Jam Buka</h3>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl">
                  <div className="space-y-4">
                    {[
                      { day: 'Senin - Jumat', hours: storeSettings.weekdayHours || '10:00 - 22:00' },
                      { day: 'Sabtu - Minggu', hours: storeSettings.weekendHours || '10:00 - 23:00' },
                      { day: 'Hari Libur', hours: storeSettings.holidayHours || '10:00 - 23:00' }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="font-medium text-gray-900">{item.day}</span>
                        <span className="text-red-600 font-semibold">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <motion.div 
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full overflow-hidden shadow-lg"
                >
                  <img src="/oishine-logo-custom.png" alt="OISHINE!" className="w-full h-full object-cover rounded-full" />
                </motion.div>
                <div>
                  <span className="font-bold text-xl">OISHINE!</span>
                  <div className="text-xs text-gray-400">おいしいね！</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Masakan Jepang autentik dengan citarasa terbaik, disajikan dengan sentuhan modern.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-6">Menu</h4>
              <ul className="space-y-3 text-gray-400">
                {categories.slice(0, 4).map((category, index) => (
                  <li 
                    key={index}
                    onClick={() => {
                      setSelectedCategory(category)
                      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="hover:text-white transition-colors interactive-cursor"
                  >
                    {category}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-6">Layanan</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors interactive-cursor">Dine-in</li>
                <li className="hover:text-white transition-colors interactive-cursor">Takeaway</li>
                <li className="hover:text-white transition-colors interactive-cursor">Delivery</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-6">Ikuti Kami</h4>
              <div className="flex space-x-4">
                <a href={getSocialUrl('instagram', (storeSettings as any).instagram) || FOOTER_SOCIALS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Oishine on Instagram">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white transition-colors interactive-cursor">
                    <Instagram className="h-5 w-5" />
                  </Button>
                </a>
                <a href={getSocialUrl('facebook', (storeSettings as any).facebook) || FOOTER_SOCIALS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Oishine on Facebook">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white transition-colors interactive-cursor">
                    <Facebook className="h-5 w-5" />
                  </Button>
                </a>
                <a href={getSocialUrl('twitter', (storeSettings as any).twitter) || FOOTER_SOCIALS.twitter} target="_blank" rel="noopener noreferrer" aria-label="Oishine on X">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white transition-colors interactive-cursor">
                    <Twitter className="h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <div className="mb-4">
              <Link 
                href="/login" 
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1"
              >
                <Store className="h-3 w-3" />
                Admin Login
              </Link>
            </div>
            <p>© 2025 OISHINE!. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-hidden"
          >
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setIsCartOpen(false)} 
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Cart Header */}
                <div className="relative p-6 border-b bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                      >
                        <ShoppingCart className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-bold">Keranjang Belanja</h2>
                        <p className="text-red-100 text-sm">{getTotalItems()} item</p>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsCartOpen(false)}
                        className="text-white hover:bg-white/20 rounded-xl"
                      >
                        <X className="h-6 w-6" />
                      </Button>
                    </motion.div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-4 right-4 w-6 h-6 bg-yellow-400 rounded-full opacity-60"
                  />
                  <motion.div
                    animate={{ scale: [1.2, 1, 1.2] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-4 left-4 w-4 h-4 bg-white/30 rounded-full"
                  />
                </div>
                
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
                  {cart.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"
                      >
                        <ShoppingCart className="h-10 w-10 text-gray-400" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Keranjang Kosong</h3>
                      <p className="text-gray-500 mb-6">Tambahkan makanan lezat untuk memulai</p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => setIsCartOpen(false)}
                          className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                        >
                          Lihat Menu
                        </Button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="group"
                        >
                          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 rounded-2xl hover:shadow-lg hover:border-red-200 transition-all duration-300">
                            {/* Product Image */}
                            <div className="relative">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-20 h-20 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold"
                              >
                                {item.quantity}
                              </motion.div>
                            </div>
                            
                            {/* Product Info */}
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                                {item.product.name}
                              </h4>
                              <p className="text-sm text-gray-500 mb-2">
                                {item.product.category?.name}
                              </p>
                              <p className="text-lg font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                Rp {(item.product.price || 0).toLocaleString('id-ID')}
                              </p>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex flex-col items-center space-y-2">
                              <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    className="h-8 w-8 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                                <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    className="h-8 w-8 hover:bg-green-100 hover:text-green-600 rounded-lg transition-colors"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              </div>
                              
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCart(item.product.id)}
                                  className="h-8 w-8 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Cart Footer */}
                {cart.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-t bg-gradient-to-b from-gray-50 to-white p-6"
                  >
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Subtotal:</span>
                        <span className="font-medium text-gray-900">
                          Rp {getTotalPrice().toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">PPN ({storeSettings.taxRate}%):</span>
                        <span className="font-medium text-gray-900">
                          Rp {getTaxAmount().toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Total:</span>
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="text-2xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent"
                          >
                            Rp {getTotalPriceWithTax().toLocaleString('id-ID')}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => {
                            // Save cart data to localStorage for checkout page
                            const cartData = cart.map(item => ({
                              id: item.product.id,
                              name: item.product.name,
                              price: item.product.price,
                              quantity: item.quantity,
                              image: item.product.image,
                              description: item.product.description
                            }))
                            
                            localStorage.setItem('oishine-cart', JSON.stringify(cartData))
                            
                            // Save checkout form data to localStorage
                            const checkoutData = {
                              name: checkoutForm.name || '',
                              email: checkoutForm.email || '',
                              phone: checkoutForm.phone || '',
                              address: checkoutForm.address || '',
                              city: '',
                              postalCode: ''
                            }
                            localStorage.setItem('oishine-checkout-data', JSON.stringify(checkoutData))
                            
                            // Navigate to checkout page
                            router.push('/checkout')
                          }}
                          className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <CreditCard className="h-5 w-5 mr-2" />
                          Checkout Sekarang
                        </Button>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => setIsCartOpen(false)}
                          className="w-full border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 font-semibold py-4 rounded-2xl transition-all duration-300"
                        >
                          Lanjut Belanja
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedProduct && (
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto scroll-smooth custom-scrollbar mx-4">
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    {selectedProduct.category.name}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-8">
                {/* Product Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="aspect-video relative rounded-xl overflow-hidden">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedProduct.isAvailable && (
                      <Badge className="absolute top-4 right-4 bg-green-600 hover:bg-green-700">
                        Tersedia
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-xl mb-3 text-gray-900">Deskripsi</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-xl mb-3 text-gray-900">Bahan-bahan</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedProduct.ingredients}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-xl mb-3 text-gray-900">Harga</h3>
                      <p className="text-3xl font-bold text-red-600">
                        Rp {(selectedProduct.price || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-xl mb-3 text-gray-900">Jumlah</h3>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}
                          className="hover:bg-red-50 hover:border-red-300"
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <span className="w-16 text-center font-bold text-xl">{detailQuantity}</span>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setDetailQuantity(detailQuantity + 1)}
                          className="hover:bg-red-50 hover:border-red-300"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-xl mb-3 text-gray-900">Total</h3>
                      <p className="text-3xl font-bold text-red-600">
                        Rp {((selectedProduct.price || 0) * detailQuantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold text-lg py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={addToCartFromDetail}
                    >
                      <ShoppingCart className="h-6 w-6 mr-3" />
                      Tambah {detailQuantity} ke Keranjang
                    </Button>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="border-t pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Rating & Review</h3>
                    {selectedProduct.averageRating && (
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-semibold">{selectedProduct.averageRating.toFixed(1)}</span>
                        <span className="text-gray-500">({selectedProduct.reviewCount} review)</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <ReviewList productId={selectedProduct.id} limit={3} />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
            <DialogContent className="max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto scroll-smooth custom-scrollbar mx-4">
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Checkout</DialogTitle>
                <DialogDescription className="text-base md:text-lg">
                  Lengkapi data pemesanan Anda
                </DialogDescription>
                {lastOrder && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-green-700">
                        ✨ Form telah diisi otomatis dari pesanan sebelumnya. Silakan periksa kembali data Anda.
                      </p>
                      <button
                        onClick={clearLastOrder}
                        className="text-xs text-green-600 hover:text-green-800 underline ml-2"
                        title="Hapus riwayat pesanan"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </DialogHeader>
              
              <div className="space-y-8">
                {/* Order Summary */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl">
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Ringkasan Pesanan</h3>
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900">{item.product.name}</span>
                          <span className="text-gray-500 ml-2">x {item.quantity}</span>
                        </div>
                        <span className="font-semibold text-red-600">
                          Rp {((item.product.price || 0) * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                    <div className="border-t-2 border-red-200 pt-4 mt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Subtotal:</span>
                          <span className="font-medium">
                            Rp {getTotalPrice().toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">PPN ({storeSettings.taxRate}%):</span>
                          <span className="font-medium">
                            Rp {getTaxAmount().toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="font-bold text-xl text-gray-900">Total:</span>
                          <span className="font-bold text-2xl text-red-600">
                            Rp {getTotalPriceWithTax().toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Customer Information */}
                <div className="space-y-6">
                  <h3 className="font-bold text-xl text-gray-900">Informasi Pelanggan</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 font-medium">Nama Lengkap *</Label>
                      <Input
                        id="name"
                        value={checkoutForm.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        className="mt-2 h-12 border-2 border-gray-200 focus:border-red-400 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={checkoutForm.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        placeholder="email@example.com"
                        className="mt-2 h-12 border-2 border-gray-200 focus:border-red-400 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-medium">Telepon *</Label>
                    <Input
                      id="phone"
                      value={checkoutForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="+62 812-3456-7890"
                      className="mt-2 h-12 border-2 border-gray-200 focus:border-red-400 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="text-gray-700 font-medium">Alamat Pengiriman *</Label>
                    <Textarea
                      id="address"
                      value={checkoutForm.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      placeholder="Masukkan alamat lengkap pengiriman"
                      rows={3}
                      className="mt-2 border-2 border-gray-200 focus:border-red-400 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes" className="text-gray-700 font-medium">Catatan (Opsional)</Label>
                    <Textarea
                      id="notes"
                      value={checkoutForm.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      placeholder="Contoh: Tidak menggunakan bawang, extra pedas, dll."
                      rows={2}
                      className="mt-2 border-2 border-gray-200 focus:border-red-400 transition-colors"
                    />
                  </div>
                </div>
                
                {/* Delivery & Pre-order Options */}
                <div className="space-y-6">
                  <h3 className="font-bold text-xl text-gray-900">Opsi Pengiriman</h3>
                  
                  {/* Delivery Type */}
                  <div>
                    <Label className="text-gray-700 font-medium mb-3 block">Tipe Pengiriman *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { type: 'delivery', desc: 'Dikirim ke alamat', icon: '🚚', time: '45 menit' },
                        { type: 'pickup', desc: 'Ambil di toko', icon: '🏪', time: '20 menit' },
                        { type: 'dine_in', desc: 'Makan di tempat', icon: '🍽️', time: '15 menit' }
                      ].map((option) => (
                        <label key={option.type} className="relative">
                          <input 
                            type="radio" 
                            name="deliveryType" 
                            value={option.type}
                            checked={checkoutForm.deliveryType === option.type}
                            onChange={(e) => handleFormChange('deliveryType', e.target.value)}
                            className="sr-only peer" 
                          />
                          <div className="p-4 border-2 border-gray-200 rounded-xl interactive-cursor hover:border-red-400 peer-checked:border-red-500 peer-checked:bg-red-50 transition-all">
                            <div className="text-3xl mb-2 text-center">{option.icon}</div>
                            <div className="font-medium text-gray-900 text-center">{option.desc}</div>
                            <div className="text-sm text-gray-500 text-center mt-1">~{option.time}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Pre-order Option */}
                  <div>
                    <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl interactive-cursor hover:border-red-400 transition-all">
                      <input 
                        type="checkbox" 
                        checked={checkoutForm.isPreOrder}
                        onChange={(e) => handleFormChange('isPreOrder', e.target.checked)}
                        className="w-5 h-5 text-red-600 rounded" 
                      />
                      <Calendar className="w-5 h-5 text-red-600" />
                      <div>
                        <span className="font-medium text-gray-900">Pre-Order</span>
                        <p className="text-sm text-gray-500">Pesan untuk waktu spesifik</p>
                      </div>
                    </label>
                  </div>

                  {/* Scheduled Time (shown when pre-order is enabled) */}
                  {checkoutForm.isPreOrder && (
                    <div>
                      <Label htmlFor="scheduledTime" className="text-gray-700 font-medium">Waktu Pengiriman *</Label>
                      <Input
                        id="scheduledTime"
                        type="datetime-local"
                        value={checkoutForm.scheduledTime}
                        onChange={(e) => handleFormChange('scheduledTime', e.target.value)}
                        min={new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)} // Min 2 hours from now
                        className="mt-2 h-12 border-2 border-gray-200 focus:border-red-400 transition-colors"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Pesan minimal 2 jam sebelumnya
                      </p>
                    </div>
                  )}

                  {/* Delivery Address (shown for delivery type) */}
                  {checkoutForm.deliveryType === 'delivery' && (
                    <div>
                      <Label htmlFor="deliveryAddress" className="text-gray-700 font-medium">Alamat Pengiriman *</Label>
                      <Textarea
                        id="deliveryAddress"
                        value={checkoutForm.deliveryAddress}
                        onChange={(e) => handleFormChange('deliveryAddress', e.target.value)}
                        placeholder="Masukkan alamat lengkap pengiriman"
                        rows={3}
                        className="mt-2 border-2 border-gray-200 focus:border-red-400 transition-colors"
                      />
                    </div>
                  )}
                </div>
                
                {/* Payment Method */}
                <div>
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Metode Pembayaran</h3>
                  <div className="space-y-3">
                    {[
                      { method: 'qris', desc: 'QRIS - Quick Response Code Indonesia Standard', icon: '📱' },
                      { method: 'transfer', desc: 'Transfer Bank - BCA, Mandiri, BNI', icon: '🏦' },
                      { method: 'ewallet', desc: 'E-Wallet - GoPay, OVO, DANA', icon: '💳' },
                      { method: 'cod', desc: 'Bayar di Tempat - Cash on Delivery', icon: '💰' }
                    ].map((payment, index) => (
                      <label key={index} className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl interactive-cursor hover:border-red-400 hover:bg-red-50 transition-all">
                        <input 
                          type="radio" 
                          name="payment" 
                          value={payment.method}
                          checked={checkoutForm.paymentMethod === payment.method}
                          onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
                          className="w-4 h-4 text-red-600" 
                        />
                        <span className="text-2xl">{payment.icon}</span>
                        <div>
                          <span className="font-medium text-gray-900">
                            {payment.method === 'qris' ? 'QRIS' : 
                             payment.method === 'transfer' ? 'Transfer Bank' :
                             payment.method === 'ewallet' ? 'E-Wallet' : 'Bayar di Tempat'}
                          </span>
                          <p className="text-sm text-gray-500">{payment.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  {lastOrder && (
                    <Button
                      variant="outline"
                      className="w-full h-12 border-2 border-green-200 hover:border-green-400 text-green-700 hover:bg-green-50 transition-colors"
                      onClick={handleReorderFromCart}
                      title={`Pesan lagi: ${lastOrder.items.map((item: any) => item.product.name).join(', ')}`}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Pesan Lagi Seperti Pesanan Sebelumnya
                      <span className="ml-2 text-xs bg-green-100 px-2 py-1 rounded">
                        {lastOrder.items.length} item • Rp {lastOrder.total.toLocaleString('id-ID')}
                      </span>
                    </Button>
                  )}
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 border-2 border-gray-200 hover:border-red-400 transition-colors"
                      onClick={() => setIsCheckoutOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      className="flex-1 h-12 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={submitOrder}
                    >
                      Konfirmasi Pesanan
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* QRIS Payment Modal */}
      <AnimatePresence>
        {showQRIS && currentOrder && (
          <Dialog open={showQRIS} onOpenChange={setShowQRIS}>
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center text-gray-900">
                  Pembayaran QRIS
                </DialogTitle>
                <DialogDescription className="text-center text-gray-600">
                  Scan QR Code untuk pembayaran
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
                    <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl mb-2">📱</div>
                        <div className="text-sm text-gray-600">QR Code</div>
                        <div className="text-xs text-gray-500 mt-1">QRIS Payment</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Payment Details */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">No. Pesanan:</span>
                      <span className="font-medium">#{currentOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">
                        Rp {(currentOrder.subtotal || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">PPN ({currentOrder.taxRate || 11}%):</span>
                      <span className="font-medium">
                        Rp {(currentOrder.tax || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Total Pembayaran:</span>
                      <span className="font-bold text-red-600 text-lg">
                        Rp {(currentOrder.total || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Metode:</span>
                      <span className="font-medium">QRIS</span>
                    </div>
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-medium text-blue-900 mb-2">Cara Pembayaran:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Buka aplikasi e-wallet atau mobile banking</li>
                    <li>2. Pilih menu "Scan QR"</li>
                    <li>3. Arahkan kamera ke QR Code di atas</li>
                    <li>4. Konfirmasi pembayaran</li>
                    <li>5. Klik tombol "Konfirmasi Pembayaran" di bawah</li>
                  </ol>
                </div>
                
                {/* Timer */}
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">
                    ⏰ QR Code berlaku selama:
                  </div>
                  <div className={`text-2xl font-bold ${qrTimer < 60 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
                    {formatTime(qrTimer)}
                  </div>
                  {qrTimer < 60 && (
                    <div className="text-xs text-red-600 mt-1">
                      ⚠️ QR Code akan segera kadaluarsa!
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 border-2 border-gray-200 hover:border-red-400 transition-colors"
                    onClick={() => {
                      setShowQRIS(false)
                      setCurrentOrder(null)
                      setQrTimer(600) // Reset timer
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={confirmPayment}
                  >
                    ✅ Konfirmasi Pembayaran
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Order History Modal */}
      <AnimatePresence>
        {showOrderHistory && (
          <Dialog open={showOrderHistory} onOpenChange={setShowOrderHistory}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scroll-smooth custom-scrollbar mx-4">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">Riwayat Pesanan</DialogTitle>
                <DialogDescription>
                  Lihat riwayat pesanan Anda
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Search Form */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Cari Pesanan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="searchEmail" className="text-sm font-medium text-gray-700">Email</Label>
                      <Input
                        id="searchEmail"
                        type="email"
                        placeholder="email@example.com"
                        className="mt-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            loadOrderHistory((e.target as HTMLInputElement).value, '')
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="searchPhone" className="text-sm font-medium text-gray-700">Telepon</Label>
                      <Input
                        id="searchPhone"
                        type="tel"
                        placeholder="+62 812-3456-7890"
                        className="mt-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            loadOrderHistory('', (e.target as HTMLInputElement).value)
                          }
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-4 w-full md:w-auto"
                    onClick={() => {
                      const email = (document.getElementById('searchEmail') as HTMLInputElement)?.value
                      const phone = (document.getElementById('searchPhone') as HTMLInputElement)?.value
                      loadOrderHistory(email, phone)
                    }}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Cari Pesanan
                  </Button>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {orderHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Belum ada pesanan</p>
                      <p className="text-gray-400 text-sm mt-2">Masukkan email atau telepon untuk mencari pesanan</p>
                    </div>
                  ) : (
                    orderHistory.map((order: any) => (
                      <div key={order.id} className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900">
                              Order #{order.id.slice(-8)}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : 'N/A'}
                            </p>
                            {order.isPreOrder && (
                              <Badge className="mt-1 bg-blue-100 text-blue-800">
                                <Calendar className="w-3 h-3 mr-1" />
                                Pre-Order
                              </Badge>
                            )}
                            {order.trackingNumber && (
                              <p className="text-sm text-gray-600 mt-1">
                                <Truck className="w-3 h-3 inline mr-1" />
                                Tracking: {order.trackingNumber}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-red-600">
                              Rp {(order.total || 0).toLocaleString('id-ID')}
                            </p>
                            <Badge className={
                              order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {order.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Items:</h5>
                          <div className="space-y-2">
                            {order.items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <span>{item.quantity}x {item.product.name}</span>
                                <span className="text-gray-600">
                                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="mb-4 text-sm text-gray-600">
                          <p><strong>Tipe:</strong> {order.deliveryType}</p>
                          <p><strong>Alamat:</strong> {order.deliveryAddress || order.address}</p>
                          {order.estimatedDelivery && (
                            <p><strong>Estimasi:</strong> {new Date(order.estimatedDelivery).toLocaleString('id-ID')}</p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTrackOrder(order)}
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            Track
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReorder(order)}
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            Pesan Lagi
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Reviews Modal */}
      <AnimatePresence>
        {showReviews && selectedProductForReview && (
          <Dialog open={showReviews} onOpenChange={setShowReviews}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scroll-smooth custom-scrollbar mx-4">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Reviews - {selectedProductForReview.name}
                </DialogTitle>
                <DialogDescription>
                  Lihat dan tambah review untuk produk ini
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Product Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={selectedProductForReview.image}
                      alt={selectedProductForReview.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{selectedProductForReview.name}</h3>
                    <p className="text-gray-600 text-sm">{selectedProductForReview.description}</p>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (selectedProductForReview.averageRating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {selectedProductForReview.averageRating?.toFixed(1) || '0.0'} 
                        ({selectedProductForReview.reviewCount || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add Review Form */}
                <div className="bg-red-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Tambah Review</h3>
                  
                  <div className="space-y-4">
                    {/* Rating */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Rating *</Label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({...reviewForm, rating: star})}
                            className="p-1"
                          >
                            <Star
                              className={`h-8 w-8 transition-colors ${
                                star <= reviewForm.rating
                                  ? 'text-yellow-400 fill-current hover:text-yellow-500'
                                  : 'text-gray-300 hover:text-yellow-400'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div>
                      <Label htmlFor="reviewComment" className="text-sm font-medium text-gray-700 mb-2 block">
                        Komentar
                      </Label>
                      <Textarea
                        id="reviewComment"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                        placeholder="Bagikan pengalaman Anda dengan produk ini..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={submitReview}
                      className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Kirim Review
                    </Button>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">Semua Reviews</h3>
                  
                  {productReviews.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Belum ada review</p>
                      <p className="text-gray-400 text-sm mt-2">Jadilah yang pertama memberikan review!</p>
                    </div>
                  ) : (
                    productReviews.map((review: any) => (
                      <div key={review.id} className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {review.user?.name || 'Anonymous'}
                              </span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {review.createdAt ? new Date(review.createdAt).toLocaleString('id-ID') : 'N/A'}
                            </p>
                          </div>
                          {review.isVerified && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>

                        {review.comment && (
                          <p className="text-gray-700 mb-3">{review.comment}</p>
                        )}

                        {/* Review Images */}
                        {review.images && JSON.parse(review.images).length > 0 && (
                          <div className="flex space-x-2 mb-3">
                            {JSON.parse(review.images).map((image: string, index: number) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Review image ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}

                        {/* Helpful Button */}
                        <div className="flex items-center justify-between">
                          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Helpful ({review.helpful})</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton 
        phoneNumber={storeSettings.contactPhone?.replace(/[^0-9]/g, '') || '6281234567890'}
        message={`Halo ${storeSettings.storeName}! Saya ingin bertanya tentang menu...`}
      />

      {/* Loyalty Widget */}
      <LoyaltyWidget sessionId={sessionId} />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}