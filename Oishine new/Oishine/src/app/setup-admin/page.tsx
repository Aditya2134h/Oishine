'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldCheck, UserPlus } from 'lucide-react';

export default function SetupAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleSetupAdmin = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/setup/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Admin berhasil dibuat! Email: admin@oishine.com, Password: admin123'
        });
        
        // Redirect ke login setelah 2 detik
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Gagal membuat admin'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Terjadi kesalahan. Silakan coba lagi.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OISHINE!</h1>
          <p className="text-gray-600">Setup Administrator</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Buat Admin Pertama
            </CardTitle>
            <CardDescription>
              Buat akun administrator untuk mengelola sistem OISHINE!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Detail Admin:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-mono">admin@oishine.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Password:</span>
                    <span className="font-mono">admin123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama:</span>
                    <span>Admin OISHINE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">SUPER_ADMIN</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSetupAdmin}
                disabled={isLoading}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Membuat Admin...
                  </>
                ) : (
                  'Buat Admin Sekarang'
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Setelah admin dibuat, Anda akan diarahkan ke halaman login.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}