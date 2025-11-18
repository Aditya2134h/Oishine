'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft, Home, Receipt, Truck, Clock } from 'lucide-react';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('id');
    if (orderId) {
      // Get order from localStorage
      const orders = JSON.parse(localStorage.getItem('oishine-orders') || '[]');
      const order = orders.find((o: any) => o.id === orderId);
      if (order) {
        setOrderData(order);
      }
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pesanan tidak ditemukan</h2>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
            <h1 className="text-xl font-bold text-gray-900">Pesanan Berhasil</h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Terima Kasih!</h2>
            <p className="text-lg text-gray-600 mb-6">Pesanan Anda telah berhasil dibuat</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Nomor Pesanan</p>
              <p className="text-xl font-bold text-gray-900">{orderData.id}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                Kembali ke Beranda
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Receipt className="w-4 h-4" />
                Cetak Struk
              </button>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Pesanan</h3>
          
          <div className="space-y-4 mb-6">
            {orderData.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900">
                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">Rp {orderData.subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ongkos Kirim</span>
              <span className="font-medium">
                {orderData.shipping === 0 ? 'GRATIS' : `Rp ${orderData.shipping.toLocaleString('id-ID')}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pajak</span>
              <span className="font-medium">Rp {orderData.tax.toLocaleString('id-ID')}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total Pembayaran</span>
                <span className="font-bold text-xl text-red-500">
                  Rp {orderData.total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pengiriman</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nama</p>
              <p className="font-medium text-gray-900">{orderData.customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telepon</p>
              <p className="font-medium text-gray-900">{orderData.customer.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{orderData.customer.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Alamat</p>
              <p className="font-medium text-gray-900">{orderData.customer.address}</p>
              <p className="font-medium text-gray-900">
                {orderData.customer.city}, {orderData.customer.postalCode}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pembayaran</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Metode Pembayaran</p>
              <p className="font-medium text-gray-900 capitalize">
                {orderData.paymentMethod === 'qris' ? 'QRIS' : 
                 orderData.paymentMethod === 'transfer' ? 'Transfer Bank' :
                 orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                 orderData.paymentMethod}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status Pembayaran</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="font-medium text-green-600">Lunas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimasi Pengiriman</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Pesanan Dikonfirmasi</p>
                <p className="text-sm text-gray-600">Pesanan Anda telah diterima dan diproses</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Sedang Disiapkan</p>
                <p className="text-sm text-gray-600">Pesanan sedang disiapkan oleh tim kami</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Dalam Pengiriman</p>
                <p className="text-sm text-gray-600">Estimasi: 2-3 hari kerja</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}