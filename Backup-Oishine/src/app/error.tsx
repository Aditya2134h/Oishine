'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terjadi Kesalahan</h1>
          <p className="text-lg text-gray-600 mb-2">
            Maaf, terjadi kesalahan yang tidak terduga.
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Error ID: {error.digest}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button 
            onClick={reset}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
          
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 text-left">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Langkah yang bisa dicoba:</strong>
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Refresh halaman ini</li>
            <li>• Kembali ke halaman beranda</li>
            <li>• Coba beberapa saat lagi</li>
            <li>• Hubungi admin jika masalah berlanjut</li>
          </ul>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Oishine! - Delicious Japanese Food Delivery Purwokerto
          </p>
        </div>
      </div>
    </div>
  )
}