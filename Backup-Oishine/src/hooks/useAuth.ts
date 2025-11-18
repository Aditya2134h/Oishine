'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('admin-token') || sessionStorage.getItem('admin-token')
        
        if (!token) {
          router.push('/login')
          return
        }

        // Verify token with server
        const response = await fetch('/api/admin/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setIsAuthenticated(true)
          } else {
            // Token invalid, clear it and redirect to login
            localStorage.removeItem('admin-token')
            sessionStorage.removeItem('admin-token')
            router.push('/login')
          }
        } else {
          // Token invalid, clear it and redirect to login
          localStorage.removeItem('admin-token')
          sessionStorage.removeItem('admin-token')
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('admin-token')
        sessionStorage.removeItem('admin-token')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  return { isAuthenticated, isLoading }
}