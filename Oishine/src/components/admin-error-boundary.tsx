'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface AdminErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface AdminErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

class AdminErrorBoundary extends React.Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 [Admin Error Boundary] Error caught:', error)
    console.error('🚨 [Admin Error Boundary] Error Info:', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-800">Terjadi Kesalahan</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Admin dashboard mengalami error yang tidak terduga. Silakan coba lagi atau hubungi tim teknis.
              </p>
              {this.state.error && (
                <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                  Error: {this.state.error.message}
                </div>
              )}
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Halaman
                </Button>
                <Button 
                  onClick={() => this.setState({ hasError: false, error: undefined })} 
                  className="w-full"
                >
                  Coba Lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default AdminErrorBoundary