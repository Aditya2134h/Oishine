'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  return (
    <div className="flex items-center justify-center space-x-3">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-orange-500 ${sizeClasses[size]}`}></div>
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  )
}

interface LoadingCardProps {
  title?: string
  height?: string
}

export function LoadingCard({ title, height = 'h-32' }: LoadingCardProps) {
  return (
    <Card>
      <CardContent className={`p-6 ${height}`}>
        <div className="space-y-3">
          {title && (
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          )}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface FullPageLoadingProps {
  text?: string
}

export function FullPageLoading({ text = 'Memuat data...' }: FullPageLoadingProps) {
  return (
    <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
      <Card className="p-8">
        <CardContent className="space-y-4">
          <LoadingSpinner size="lg" text={text} />
        </CardContent>
      </Card>
    </div>
  )
}

export default LoadingSpinner