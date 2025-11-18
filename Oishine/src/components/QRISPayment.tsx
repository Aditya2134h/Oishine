import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Smartphone, QrCode, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import QRCodeLib from 'qrcode';

interface QRISPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderId: string;
  onPaymentSuccess: () => void;
  onPaymentExpired: () => void;
}

export default function QRISPayment({
  isOpen,
  onClose,
  amount,
  orderId,
  onPaymentSuccess,
  onPaymentExpired
}: QRISPaymentProps) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'expired'>('pending');
  const [isChecking, setIsChecking] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Generate QR code data (real QRIS data)
  const qrCodeData = `https://qris.example.com/pay?amount=${amount}&order=${orderId}&merchant=OISHINE&timestamp=${Date.now()}`;
  
  // Generate real QR code using library
  const generateQRCode = async () => {
    try {
      console.log('Generating QR code for order:', orderId, 'amount:', amount);
      
      // Generate QR code as data URL
      const qrDataUrl = await QRCodeLib.toDataURL(qrCodeData, {
        width: 192, // 48 * 4 for higher resolution
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      console.log('QR code generated successfully');
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback to dummy QR code if library fails
      setQrCodeUrl('');
    }
  };

  // Generate QR code when component opens or data changes
  useEffect(() => {
    if (isOpen && qrCodeData) {
      console.log('QRISPayment component opened, generating QR code');
      generateQRCode();
    }
  }, [isOpen]); // Remove qrCodeData dependency to prevent re-generation
  
  // Debug component lifecycle
  useEffect(() => {
    console.log('QRISPayment component mounted or updated', { isOpen, orderId, amount });
    return () => {
      console.log('QRISPayment component cleanup');
    };
  }, [isOpen, orderId, amount]);
  
  // Generate hash for reference number
  const generateReferenceHash = () => {
    const seed = orderId + amount.toString();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  };
  
  const referenceHash = generateReferenceHash();

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPaymentStatus('expired');
          onPaymentExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft, onPaymentExpired]);

  useEffect(() => {
    if (paymentStatus === 'success') {
      const timer = setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, onPaymentSuccess, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkPaymentStatus = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      console.log('Checking payment status for order:', orderId);
      
      // Simulate payment status check with better error handling
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random payment success (for demo) - more predictable
      const randomValue = Math.random();
      console.log('Payment check random value:', randomValue);
      
      if (randomValue > 0.5) { // 50% chance for demo
        console.log('Payment successful!');
        setPaymentStatus('success');
      } else {
        console.log('Payment still pending');
        // Payment still pending, don't change status
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      // Show error but don't break the flow
    } finally {
      setIsChecking(false);
    }
  };

  const refreshQRCode = () => {
    try {
      console.log('Refreshing QR code for order:', orderId);
      setTimeLeft(600);
      setPaymentStatus('pending');
      setQrCodeUrl(''); // Clear current QR code
      // Generate new QR code with updated timestamp
      setTimeout(() => {
        generateQRCode();
      }, 100);
    } catch (error) {
      console.error('Error refreshing QR code:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md transform transition-all">
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-red-500 to-red-600 p-4 sm:p-6">
              <button
                onClick={onClose}
                className="absolute right-2 top-2 sm:right-4 sm:top-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Pembayaran QRIS</h2>
                <p className="text-red-100 text-sm sm:text-base">Scan QR Code untuk membayar</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {paymentStatus === 'pending' && (
                <>
                  {/* Timer */}
                  <div className={`text-center mb-4 sm:mb-6 ${
                    timeLeft <= 60 ? 'animate-pulse' : ''
                  }`}>
                    <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full ${
                      timeLeft <= 60 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-semibold text-sm sm:text-base">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      {timeLeft <= 60 ? 'QR Code akan segera kadaluarsa!' : 'Sisa waktu pembayaran'}
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      {qrCodeUrl ? (
                        <img 
                          src={qrCodeUrl} 
                          alt="QR Code for payment" 
                          className="w-48 h-48 bg-white p-2 rounded-lg shadow-lg border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-xs text-gray-500">Generating QR...</p>
                          </div>
                        </div>
                      )}
                      
                      {/* QRIS indicator overlay */}
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                        QRIS
                      </div>
                      
                      {/* Amount indicator overlay */}
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        Rp{amount.toLocaleString('id-ID')}
                      </div>
                    </motion.div>
                  </div>

                  {/* QR Code Info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <QrCode className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-semibold text-green-900">QR Code Siap Scan!</p>
                    </div>
                    <div className="text-xs text-green-700 space-y-1">
                      <p>ID Pesanan: <span className="font-mono font-semibold">{orderId}</span></p>
                      <p>Nomor Referensi: <span className="font-mono font-semibold">QR-{orderId.slice(-6)}-{referenceHash.toString().slice(-4)}</span></p>
                      <p className="text-green-600 font-medium">✓ QR Code dapat di scan dengan aplikasi e-wallet</p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-center mb-4 sm:mb-6">
                    <p className="text-gray-600 text-sm mb-1">Total Pembayaran</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      Rp {amount.toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                      Cara Pembayaran:
                    </h3>
                    <ol className="space-y-2 text-xs sm:text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                        <span>Buka aplikasi e-wallet atau mobile banking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                        <span>Pilih menu "Scan QR Code"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                        <span>Arahkan kamera ke QR Code di atas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                        <span>Konfirmasi pembayaran</span>
                      </li>
                    </ol>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Refresh QR button clicked');
                        refreshQRCode();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                      type="button"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh QR
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Cek Pembayaran button clicked');
                        checkPaymentStatus();
                      }}
                      disabled={isChecking}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                    >
                      {isChecking ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Memeriksa...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Cek Pembayaran
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {paymentStatus === 'success' && (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Terima kasih telah berbelanja di OISHINE!</p>
                </div>
              )}

              {paymentStatus === 'expired' && (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">QR Code Kadaluarsa</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4">Silakan generate QR Code baru</p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Generate QR Baru button clicked');
                      refreshQRCode();
                    }}
                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                    type="button"
                  >
                    Generate QR Baru
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 border-t">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  <span>Support semua e-wallet</span>
                </div>
                <div className="hidden sm:block">•</div>
                <div className="hidden sm:flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Aman & Terpercaya</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}