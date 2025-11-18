'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AdminAuthWrapperProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function AdminAuthWrapper({ 
  children, 
  redirectTo = '/login' 
}: AdminAuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa autentikasi...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    router.push(redirectTo)
    return null
  }

  // If authenticated, show children
  return <>{children}</>
}